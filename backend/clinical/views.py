# backend/clinical/views.py

# --- Django & DRF Imports ---
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from datetime import date

from django.db import connection
from datetime import date

@api_view(['GET'])
def medical_history(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT v.id, v.visit_date, hf.name, v.reason
        FROM visit v
        LEFT JOIN health_facility hf ON v.centre_id = hf.id
        WHERE v.citizen_id = %s and status='done'
        ORDER BY v.visit_date DESC
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "visit_date": row[1],
            "facility": row[2],
            "reason": row[3],
            "diagnoses": []
        })
    return Response(data)

@api_view(['GET'])
def lab_reports(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT lt.name, lo.order_date, lr.result, lr.result_date
        FROM lab_order lo
        JOIN lab_test lt ON lo.test_id = lt.id
        LEFT JOIN lab_result lr ON lo.id = lr.order_id
        JOIN visit v ON lo.visit_id = v.id
        WHERE v.citizen_id = %s
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = []
    for row in rows:
        status = "Completed" if row[2] else "Pending"
        data.append({
            "test": row[0],
            "order_date": row[1],
            "status": status,
            "result": row[2],
            "result_date": row[3]
        })
    return Response(data)

@api_view(['GET'])
def vaccination_history(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, vacc.vaccination_date, vacc.dose_no, hf.name
        FROM vaccination vacc
        JOIN item i ON vacc.vaccine_id = i.id
        LEFT JOIN health_facility hf ON vacc.centre_id = hf.id
        WHERE vacc.citizen_id = %s
        ORDER BY vacc.vaccination_date DESC
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "vaccine": row[0],
            "date": row[1],
            "dose": row[2],
            "centre": row[3]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def eligible_vaccines(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT c.dob FROM citizen c WHERE c.citizen_id = %s
    """, [citizen_id])
    
    row = cursor.fetchone()
    if not row:
        return Response({"error": "Citizen not found"}, status=404)
    
    dob = row[0]
    age = date.today().year - dob.year
    
    cursor.execute("""
        SELECT DISTINCT i.id, i.name
        FROM item i
        JOIN vacc_prereq_age vpa ON i.id = vpa.vaccine_id
        WHERE i.type = 'vaccine' AND vpa.age_limit <= %s
        AND i.id NOT IN (
            SELECT v.vaccine_id FROM vaccination v WHERE v.citizen_id = %s
        )
    """, [age, citizen_id])
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1]} for row in rows]
    return Response(data)

@api_view(['GET'])
def visit_detail(request, id):
    cursor = connection.cursor()
    
    # base visit
    cursor.execute("""
        SELECT v.visit_date, hf.name, v.reason, v.status
        FROM visit v
        LEFT JOIN health_facility hf ON v.centre_id = hf.id
        WHERE v.id = %s
    """, [id])
    row = cursor.fetchone()
    if not row:
        return Response({"error": "Visit not found"}, status=404)
    
    data = {
        "visit_date": row[0],
        "facility": row[1],
        "reason": row[2],
        "status": row[3],
        "diagnosis": [],
        "prescriptions": [],
        "lab_tests": [],
        "procedures": [],
        "admission": []
    }
    
    # diagnoses
    cursor.execute("""
        SELECT d.name
        FROM diagnosis dg
        JOIN disease d ON dg.disease_id = d.id
        WHERE dg.visit_id = %s
    """, [id])
    data["diagnosis"] = [row[0] for row in cursor.fetchall()]
    
    # prescriptions
    cursor.execute("""
        SELECT i.name, p.dosage, p.frequency
        FROM prescription p
        JOIN item i ON p.item_id = i.id
        WHERE p.visit_id = %s
    """, [id])
    data["prescriptions"] = [{"item": row[0], "dosage": row[1], "frequency": row[2]} for row in cursor.fetchall()]
    
    # lab tests
    cursor.execute("""
        SELECT lt.name, lr.result
        FROM lab_order lo
        JOIN lab_test lt ON lo.test_id = lt.id
        LEFT JOIN lab_result lr ON lo.id = lr.order_id
        WHERE lo.visit_id = %s
    """, [id])
    data["lab_tests"] = [{"test": row[0], "result": row[1] if row[1] else None} for row in cursor.fetchall()]
    
    # procedures
    cursor.execute("""
        SELECT mp.name
        FROM procedure_taken pt
        JOIN medical_procedure mp ON pt.procedure_id = mp.procedure_id
        WHERE pt.visit_id = %s
    """, [id])
    data["procedures"] = [row[0] for row in cursor.fetchall()]

    #admission details
    cursor.execute("""
        SELECT a.admission_date, a.discharge_date, hf.name
        FROM admission a
        JOIN wards w ON a.ward_id = w.id 
        JOIN health_facility hf ON w.facility_id = hf.id
        WHERE a.visit_id = %s
    """, [id])
    admission_rows = cursor.fetchall()
    if admission_rows:
        data["admission"] = {"admission_date": admission_rows[0][0], "discharge_date": admission_rows[0][1], "ward": admission_rows[0][2]}
    
    return Response(data)

@api_view(['GET'])
def current_prescriptions(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, p.dosage, p.frequency, v.visit_date
        FROM prescription p
        JOIN item i ON p.item_id = i.id
        JOIN visit v ON p.visit_id = v.id
        WHERE v.citizen_id = %s AND (p.end_date >= CURRENT_DATE and p.start_date <= CURRENT_DATE)
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = [{"item": row[0], "dosage": row[1], "frequency": row[2], "prescribed_on": row[3]} for row in rows]
    return Response(data)

@api_view(['GET'])
def current_appointments(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT v.id, v.visit_date, hf.name, v.reason
        FROM visit v
        JOIN health_facility hf ON v.centre_id = hf.id
        WHERE v.citizen_id = %s AND v.visit_date >= CURRENT_DATE and v.status = 'pending'
        ORDER BY v.visit_date ASC
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "visit_date": row[1], "facility": row[2], "reason": row[3]} for row in rows]
    return Response(data)

@api_view(['POST'])
def book_appointment(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO visit (citizen_id, centre_id, visit_date, reason)
        VALUES (%s, %s, %s, %s)
    """, [request.data['citizen_id'], request.data['facility_id'], request.data['date'], request.data.get('reason', '')])
    
    visit_id = cursor.lastrowid
    return Response({"visit_id": visit_id})

@api_view(['GET'])
def search_facilities(request):
    query = request.GET.get('query', '')
    type_ = request.GET.get('type')

    cursor = connection.cursor()
    if type_ == 'medicine':
        cursor.execute("""
            SELECT DISTINCT hf.id, hf.name, hf.type, p.city, p.state, i.name
            FROM health_facility hf
            JOIN place p ON hf.id = p.id
            JOIN inventory inv ON p.id = inv.place_id
            JOIN item i ON inv.item_id = i.id
            WHERE i.name LIKE %s
        """, [f'%{query}%'])
    
    elif type_ == 'lab':
        
        cursor.execute("""
            SELECT DISTINCT hf.id, hf.name, hf.type, p.city, p.state, lt.name
            FROM health_facility hf
            JOIN place p ON hf.id = p.id
            JOIN lab_test_provided ltp ON hf.id = ltp.fac_id
            JOIN lab_test lt ON ltp.test_id = lt.id
            WHERE lt.name LIKE %s
        """, [f'%{query}%'])
    
    elif type_ == 'procedure':
        cursor.execute("""
            SELECT DISTINCT hf.id, hf.name, hf.type, p.city, p.state, mp.name
            FROM health_facility hf
            JOIN place p ON hf.id = p.id
            JOIN procedure_provided pp ON hf.id = pp.fac_id
            JOIN medical_procedure mp ON pp.procedure_id = mp.procedure_id
            WHERE mp.name LIKE %s
        """, [f'%{query}%'])
    
    else:
        return Response({"error": "Invalid type"}, status=400)

    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1], "type":row[2], "city":row[3], "state":row[4], "thing":row[5]} for row in rows]
    if (len(data) > 100):
        data = data[:100]  # limit to 100 results
    return Response(data)




@api_view(['GET'])
def available_facilities_state(request):
    state = request.GET.get('state')

    cursor = connection.cursor()
    cursor.execute("""
        SELECT hf.id, hf.name, (COALESCE(SUM(w.total), 0) - COALESCE(SUM(w.occupied), 0)) as vacant_beds, p.city, p.state
        FROM health_facility hf
        JOIN place p ON hf.id = p.id
        LEFT JOIN wards w ON hf.id = w.facility_id
        WHERE p.state = %s
        GROUP BY hf.id, hf.name
        HAVING (COALESCE(SUM(w.total), 0) - COALESCE(SUM(w.occupied), 0)) > 0
    """, [state])
    
    rows = cursor.fetchall()
    data = [
        {
            "id": row[0],
            "name": row[1],
            "vacant_beds": row[2],
            "city": row[3],
            "state": row[4]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def available_facilities_city(request):
    
    city = request.GET.get('city')

    cursor = connection.cursor()
    cursor.execute("""
        SELECT hf.id, hf.name, (COALESCE(SUM(w.total), 0) - COALESCE(SUM(w.occupied), 0)) as vacant_beds, p.city, p.state
        FROM health_facility hf
        JOIN place p ON hf.id = p.id
        LEFT JOIN wards w ON hf.id = w.facility_id
        WHERE p.city = %s
        GROUP BY hf.id, hf.name
        HAVING (COALESCE(SUM(w.total), 0) - COALESCE(SUM(w.occupied), 0)) > 0
    """, [ city])
    
    rows = cursor.fetchall()
    data = [
        {
            "id": row[0],
            "name": row[1],
            "vacant_beds": row[2],
            "city": row[3],
            "state": row[4]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def get_states(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT DISTINCT state FROM place
    """)
    
    rows = cursor.fetchall()
    data = [row[0] for row in rows]
    return Response(data)

@api_view(['GET'])
def get_cities(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT DISTINCT city FROM place
    """)
    
    rows = cursor.fetchall()
    data = [row[0] for row in rows]
    return  Response(data)

# ==========================================
# WRITE DATA (POST REQUESTS)
# ==========================================

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def book_appointment(request):
    data = request.data
    cursor = connection.cursor()
    
    
    citizen_id = data.get('citizen_id')
    if not citizen_id:
        return Response({"error": "Citizen ID is required"}, status=400)
    cursor.execute("""
        INSERT INTO visit (citizen_id, centre_id, visit_date, reason, status)
        VALUES (%s, %s, %s, %s, `pending`)
    """, [citizen_id, data['facility_id'], data['appointment_date'], f"{data['reason']}"])
    
    visit_id = cursor.lastrowid
    return Response({"message": "Appointment booked successfully!", "visit_id": visit_id}, status=201)

@api_view(['POST'])
def create_visit(request):
    data = request.data
    cursor = connection.cursor()
    citizen_id = data.get('citizen_id')

    cursor.execute("""
        INSERT INTO visit (citizen_id, centre_id, visit_date, reason, status)
        VALUES (%s, %s, CURRENT_DATE(), %s, 'done')
    """, [citizen_id, data['facility_id'], data['reason']])
    
    visit_id = cursor.lastrowid
    return Response({"message": "Visit created successfully!", "visit_id": visit_id}, status=201)

@api_view(['POST'])
def create_diagnosis(request, visit_id):
    data = request.data
    cursor = connection.cursor()
    if data.get('disease_id'):
        cursor.execute("""
            INSERT INTO diagnosis (visit_id, disease_id, description)
            VALUES (%s, %s, %s)
        """, [visit_id, data['disease_id'], data.get('description', '')])
    
    return Response({"message": "Success!", "visit_id": visit_id}, status=201)
    
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def create_prescription(request, visit_id):
    data = request.data
    cursor = connection.cursor()
    if data.get('item_id'):
        cursor.execute("""
            INSERT INTO prescription (visit_id, item_id, dosage, frequency, start_date, end_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, [visit_id, data['item_id'], data['dosage'], data['frequency'], data['start_date'], data['end_date']])
    
    return Response({"message": "Success!", "visit_id": visit_id}, status=201)

@api_view(['POST'])
def create_lab_order(request, visit_id):
    data = request.data
    cursor = connection.cursor()
    if data.get('test_id'):
        cursor.execute("""
            INSERT INTO lab_order (visit_id, test_id, lab_id, order_date)
            VALUES (%s, %s, %s, CURRENT_DATE())
        """, [visit_id, data['test_id'], data['lab_id']])
    
    return Response({"message": "Lab order created!", "visit_id": visit_id}, status=201)

@api_view(['POST'])
def create_procedure(request, visit_id):
    data = request.data
    cursor = connection.cursor()
    if data.get('procedure_id'):
        cursor.execute("""
            INSERT INTO procedure_taken (visit_id, procedure_id)
            VALUES (%s, %s)
        """, [visit_id, data['procedure_id']])
    
    return Response({"message": "Procedure recorded!", "visit_id": visit_id}, status=201)


@api_view(['GET'])
def get_facilities(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT hf.id, hf.name, hf.type, p.city
        FROM health_facility hf
        JOIN place p ON hf.id = p.id
    """)
    
    rows = cursor.fetchall()
    data = [
        {
            "id": row[0],
            "name": row[1],
            "type": row[2],
            "city": row[3]
        } for row in rows
    ]
    return Response(data)

# ==========================================
# READ DATA (GET REQUESTS)
# ==========================================

@api_view(['GET'])
def vaccination_history(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, vacc.vaccination_date, vacc.dose_no, hf.name
        FROM vaccination vacc
        JOIN item i ON vacc.vaccine_id = i.id
        LEFT JOIN health_facility hf ON vacc.centre_id = hf.id
        WHERE vacc.citizen_id = %s
        ORDER BY vacc.vaccination_date DESC
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "vaccine": row[0],
            "date": row[1],
            "dose": row[2],
            "centre": row[3]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def citizen_medical_history(request, aadhar_no):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT v.id, v.visit_date, hf.name, v.reason
        FROM visit v
        JOIN citizen c ON v.citizen_id = c.citizen_id
        LEFT JOIN health_facility hf ON v.centre_id = hf.id
        WHERE c.aadhar_no = %s
        ORDER BY v.visit_date DESC
    """, [aadhar_no])
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "visit_date": row[1], "facility": row[2], "reason": row[3], "diagnoses": []} for row in rows]
    return Response(data)

    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date

@api_view(['GET'])
def eligible_vaccines(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT c.dob FROM citizen c WHERE c.citizen_id = %s
    """, [citizen_id])
    
    row = cursor.fetchone()
    if not row:
        return Response({"error": "Citizen not found"}, status=404)
    
    dob = row[0]
    age = date.today().year - dob.year
    
    cursor.execute("""
        SELECT DISTINCT i.id, i.name
        FROM item i
        JOIN vacc_prereq_age vpa ON i.id = vpa.vaccine_id
        WHERE i.type = 'vaccine' AND vpa.age_limit <= %s
        AND i.id NOT IN (
            SELECT v.vaccine_id FROM vaccination v WHERE v.citizen_id = %s
        )
    """, [age, citizen_id])
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1]} for row in rows]
    return Response(data)

# ==========================================
# ANALYTICS & DASHBOARD (GET REQUESTS)
# ==========================================

@api_view(['GET'])
def disease_geographic_stats(request, disease_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT c.state, c.city, COUNT(*) as case_count
        FROM diagnosis dg
        JOIN visit v ON dg.visit_id = v.id
        JOIN citizen c ON v.citizen_id = c.citizen_id
        WHERE dg.disease_id = %s
        GROUP BY c.state, c.city
        ORDER BY case_count DESC
    """, [disease_id])
    
    rows = cursor.fetchall()
    data = [{"state": row[0], "city": row[1], "case_count": row[2]} for row in rows]
    return Response(data)

@api_view(['GET'])
def get_all_diseases(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, name FROM disease
    """)
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1]} for row in rows]
    return Response(data)

@api_view(['GET'])
def get_lab_tests(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, name FROM lab_test
    """)
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1]} for row in rows]
    return Response(data)

@api_view(['GET'])
def get_procedures(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT procedure_id, name FROM medical_procedure
    """)
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1]} for row in rows]
    return Response(data)

@api_view(['GET'])
def get_medicines(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, name, type FROM item WHERE type = 'medicine' or type= 'vaccine'
    """)
    
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1], "type":row[2]} for row in rows]
    return Response(data)



@api_view(['POST'])
def create_vaccination(request, visit_id):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO vaccination (citizen_id, vaccine_id, dose_no, centre_id, vaccination_date)
        VALUES (%s, %s, %s, %s, %s)
    """, [request.data['citizen_id'], request.data['item_id'], request.data['dose_number'], request.data['centre_id'], date.today()])
    return Response({"status": "vaccination recorded"})


