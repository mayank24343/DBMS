# backend/facilities/views.py
from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.db import connection
from datetime import date, timedelta

@api_view(['GET'])
def get_facility(request, id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT hf.id, hf.name, hf.type, p.addr_l1, p.city, p.state
        FROM health_facility hf
        JOIN place p ON hf.id = p.id
        WHERE hf.id = %s
    """, [id])
    
    row = cursor.fetchone()
    if not row:
        return Response({"error": "Facility not found"}, status=404)
    
    data = {
        "id": row[0],
        "name": row[1],
        "type": row[2],
        "address": row[3],
        "city": row[4],
        "state": row[5]
    }
    return Response(data)

@api_view(['GET'])
def facility_contacts(request, id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT email, phone, is_primary
        FROM healthfac_contact 
        WHERE healthfac_id = %s
    """, [id])
    
    rows = cursor.fetchall()
    data = [
        {
            "email": row[0],
            "phone": row[1],
            "is_primary": row[2]
        } for row in rows
    ]
    return Response(data)

from datetime import date

@api_view(['GET'])
def today_appointments(request, fac_id):
    cursor = connection.cursor()
    today = date.today()
    cursor.execute("""
        SELECT v.id, v.citizen_id, c.name, v.reason
        FROM visit v
        JOIN citizen c ON v.citizen_id = c.citizen_id
        WHERE v.centre_id = %s AND v.visit_date = %s
    """, [fac_id, today])
    
    rows = cursor.fetchall()
    data = [
        {
            "visit_id": row[0],
            "citizen_id": row[1],
            "name": row[2],
            "reason": row[3]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def get_ward_availability(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, type, occupied, total
        FROM wards 
        WHERE facility_id = %s
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "id": row[0],
            "type": row[1],
            "occupied": row[2],
            "total": row[3],
            "available": row[3] - row[2]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def facility_occupancy(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT COALESCE(SUM(total), 0) as total_beds, COALESCE(SUM(occupied), 0) as occupied_beds
        FROM wards 
        WHERE facility_id = %s
    """, [fac_id])
    
    row = cursor.fetchone()
    total = row[0]
    occupied = row[1]
    
    return Response({
        "total_beds": total,
        "occupied": occupied,
        "vacant": total - occupied
    })

@api_view(['GET'])
def citizen_history(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT v.id, v.visit_date, hf.name
        FROM visit v
        JOIN health_facility hf ON v.centre_id = hf.id
        WHERE v.citizen_id = %s
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "visit_id": row[0],
            "date": row[1],
            "facility": row[2]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def citizen_lab_tests(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT lt.name
        FROM lab_order lo
        JOIN lab_test lt ON lo.test_id = lt.id
        JOIN visit v ON lo.visit_id = v.id
        WHERE v.citizen_id = %s
    """, [citizen_id])
    
    rows = cursor.fetchall()
    data = [{"test": row[0], "status": "pending"} for row in rows]
    return Response(data)

@api_view(['POST'])
def add_diagnosis(request, visit_id):
    cursor = connection.cursor()
    
    # diagnosis
    if request.data.get('disease_id'):
        cursor.execute("""
            INSERT INTO diagnosis (visit_id, disease_id, description)
            VALUES (%s, %s, %s)
        """, [visit_id, request.data.get('disease_id'), request.data.get('description', '')])
    
    # prescriptions
    for p in request.data.get('prescriptions', []):
        cursor.execute("""
            INSERT INTO prescription (visit_id, item_id, dosage, frequency)
            VALUES (%s, %s, %s, %s)
        """, [visit_id, p['item_id'], p.get('dosage'), p.get('frequency')])
    
    # lab tests
    for t in request.data.get('tests', []):
        cursor.execute("""
            INSERT INTO lab_order (visit_id, test_id, lab_id, order_date)
            VALUES (%s, %s, %s, %s)
        """, [visit_id, t, request.data.get('lab_id'), date.today()])
    
    return Response({"status": "done"})

@api_view(['POST'])
def add_procedure(request, visit_id):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO procedure_taken (visit_id, procedure_id)
        VALUES (%s, %s)
    """, [visit_id, request.data['procedure_id']])
    return Response({"status": "added"})

@api_view(['GET'])
def facility_inventory(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, inv.quantity, inv.expiry
        FROM inventory inv
        JOIN item i ON inv.item_id = i.id
        WHERE inv.place_id = %s
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "item": row[0],
            "quantity": row[1],
            "expiry": row[2]
        } for row in rows
    ]
    return Response(data)

from datetime import timedelta

@api_view(['GET'])
def near_expiry(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, inv.expiry
        FROM inventory inv
        JOIN item i ON inv.item_id = i.id
        WHERE inv.place_id = %s AND inv.expiry <= %s
    """, [fac_id, date.today() + timedelta(days=30)])
    
    rows = cursor.fetchall()
    data = [{"item": row[0], "expiry": row[1]} for row in rows]
    return Response(data)

@api_view(['POST'])
def log_usage(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO item_use (item_id, fac_id, use_date, quantity)
        VALUES (%s, %s, %s, %s)
    """, [request.data['item_id'], request.data['facility_id'], date.today(), request.data['quantity']])
    return Response({"status": "logged"})

@api_view(['POST'])
def admit_patient(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT occupied, total FROM wards WHERE id = %s
    """, [request.data['ward_id']])
    
    row = cursor.fetchone()
    if row[0] >= row[1]:
        return Response({"error": "Ward full"}, status=400)
    
    cursor.execute("""
        INSERT INTO admission (citizen_id, visit_id, ward_id, admission_date)
        VALUES (%s, %s, %s, %s)
    """, [request.data['citizen_id'], request.data['visit_id'], request.data['ward_id'], date.today()])
    
    return Response({"status": "admitted"})

@api_view(['POST'])
def discharge_patient(request):
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE admission SET discharge_date = %s WHERE visit_id = %s
    """, [date.today(), request.data['visit_id']])
    return Response({"status": "discharged"})

from datetime import date

@api_view(['POST'])
def transfer_patient(request):
    cursor = connection.cursor()
    visit_id = request.data['visit_id']
    citizen_id = request.data['citizen_id']
    from_fac = request.data['from_fac']
    to_fac = request.data['to_fac']
    new_ward_id = request.data['ward_id']
    
    # Check new ward
    cursor.execute("SELECT occupied, total FROM wards WHERE id = %s", [new_ward_id])
    row = cursor.fetchone()
    if row[0] >= row[1]:
        return Response({"error": "New ward full"}, status=400)
    
    # Discharge old admission
    cursor.execute("""
        UPDATE admission SET discharge_date = %s WHERE visit_id = %s AND discharge_date IS NULL
    """, [date.today(), visit_id])
    
    # Create new admission
    cursor.execute("""
        INSERT INTO admission (citizen_id, visit_id, ward_id, admission_date)
        VALUES (%s, %s, %s, %s)
    """, [citizen_id, visit_id, new_ward_id, date.today()])
    
    # Log transfer
    cursor.execute("""
        INSERT INTO transfer (visit_id, citizen_id, from_fac, to_fac, date_of_transfer, reason)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, [visit_id, citizen_id, from_fac, to_fac, date.today(), request.data.get('reason', '')])
    
    return Response({"status": "transferred"})



@api_view(['GET'])
def inventory_usage_stats(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, COALESCE(SUM(iu.quantity), 0) as total_used
        FROM item_use iu
        JOIN item i ON iu.item_id = i.id
        WHERE iu.fac_id = %s
        GROUP BY i.id, i.name
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [{"item__name": row[0], "total_used": row[1]} for row in rows]
    return Response(data)

@api_view(['GET'])
def facility_disease_stats(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT d.name, COUNT(dg.id) as count
        FROM diagnosis dg
        JOIN disease d ON dg.disease_id = d.id
        JOIN visit v ON dg.visit_id = v.id
        WHERE v.centre_id = %s
        GROUP BY d.id, d.name
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [{"disease__name": row[0], "count": row[1]} for row in rows]
    return Response(data)

@api_view(['GET'])
def appointment_stats(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT visit_date, COUNT(*) as count
        FROM visit
        WHERE centre_id = %s
        GROUP BY visit_date
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [{"visit_date": row[0], "count": row[1]} for row in rows]
    return Response(data)

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def pending_lab_tests(request, lab_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT lo.id, lt.name, v.citizen_id, c.name, lo.order_date
        FROM lab_order lo
        JOIN lab_test lt ON lo.test_id = lt.id
        JOIN visit v ON lo.visit_id = v.id
        JOIN citizen c ON v.citizen_id = c.citizen_id
        WHERE lo.lab_id = %s AND lo.id NOT IN (SELECT order_id FROM lab_result)
    """, [lab_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "order_id": row[0],
            "test": row[1],
            "citizen_id": row[2],
            "citizen_name": row[3],
            "date": row[4]
        } for row in rows
    ]
    return Response(data)

from datetime import date

@api_view(['POST'])
def submit_lab_result(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO lab_result (order_id, result, result_date)
        VALUES (%s, %s, %s)
    """, [request.data['order_id'], request.data['result'], date.today()])
    return Response({"status": "submitted"})

@api_view(['GET'])
def all_lab_tests(request, lab_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT lo.id, lt.name, lr.result, lr.result_date
        FROM lab_order lo
        JOIN lab_test lt ON lo.test_id = lt.id
        LEFT JOIN lab_result lr ON lo.id = lr.order_id
        WHERE lo.lab_id = %s
    """, [lab_id])
    
    rows = cursor.fetchall()
    data = []
    for row in rows:
        status = "Completed" if row[2] else "Pending"
        data.append({
            "order_id": row[0],
            "test": row[1],
            "status": status,
            "result": row[2] if row[2] else None
        })
    return Response(data)

@api_view(['GET'])
def admitted_patients(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT a.citizen_id, c.name, w.type, a.admission_date
        FROM admission a
        JOIN wards w ON a.ward_id = w.id
        JOIN citizen c ON a.citizen_id = c.citizen_id
        WHERE w.facility_id = %s AND a.discharge_date IS NULL
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "citizen_id": row[0],
            "name": row[1],
            "ward": row[2],
            "admission_date": row[3]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
def low_inventory(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, inv.quantity, inv.threshold
        FROM inventory inv
        JOIN item i ON inv.item_id = i.id
        WHERE inv.place_id = %s AND inv.quantity < inv.threshold
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "item": row[0],
            "quantity": row[1],
            "threshold": row[2]
        } for row in rows
    ]
    return Response(data)



@api_view(['GET'])
def disease_geo(request, disease_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT c.state, c.city, COUNT(DISTINCT v.citizen_id) as cases
        FROM diagnosis dg
        JOIN visit v ON dg.visit_id = v.id
        JOIN citizen c ON v.citizen_id = c.citizen_id
        WHERE dg.disease_id = %s
        GROUP BY c.state, c.city
        ORDER BY cases DESC
    """, [disease_id])
    
    rows = cursor.fetchall()
    data = [{"state": row[0], "city": row[1], "cases": row[2]} for row in rows]
    return Response(data)

@api_view(['GET'])
def disease_daily(request, disease_id):
    date_str = request.GET.get('date')
    
    cursor = connection.cursor()
    cursor.execute("""
        SELECT COUNT(*) as cases
        FROM diagnosis dg
        JOIN visit v ON dg.visit_id = v.id
        WHERE dg.disease_id = %s AND v.visit_date = %s
    """, [disease_id, date_str])
    
    row = cursor.fetchone()
    count = row[0]
    
    return Response({
        "date": date_str,
        "cases": count
    })

from django.db.models.functions import ExtractMonth

@api_view(['GET'])
def disease_monthly_avg(request, disease_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT EXTRACT(MONTH FROM v.visit_date) as month,
               COUNT(*) as total_cases,
               COUNT(DISTINCT v.visit_date) as days
        FROM diagnosis dg
        JOIN visit v ON dg.visit_id = v.id
        WHERE dg.disease_id = %s
        GROUP BY EXTRACT(MONTH FROM v.visit_date)
        ORDER BY month
    """, [disease_id])
    
    rows = cursor.fetchall()
    result = [
        {
            "month": int(row[0]),
            "avg_daily_cases": row[1] / row[2] if row[2] else 0
        } for row in rows
    ]
    return Response(result)

