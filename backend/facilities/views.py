# backend/facilities/views.py
from datetime import date

from accounts.permissions import IsOwnerCitizenOrStaff, IsRole
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django.db import connection
from django.db import transaction
from datetime import date, timedelta
from django.db.models.functions import ExtractMonth

from datetime import datetime


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

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
def today_appointments(request, fac_id):
    cursor = connection.cursor()
    today = date.today()
    cursor.execute("""
        SELECT v.id, v.citizen_id, c.name, v.reason, v.visit_date
        FROM visit v
        JOIN citizen c ON v.citizen_id = c.citizen_id
        WHERE v.centre_id = %s AND v.visit_date = %s and status = "pending"
    """, [fac_id, today])
    
    rows = cursor.fetchall()
    data = [
        {
            "visit_id": row[0],
            "citizen_id": row[1],
            "name": row[2],
            "reason": row[3],
            "visit_date": row[4],
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
@permission_classes([IsRole('worker','admin')])
def ward_admitted_patients(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT a.citizen_id, c.name, a.admission_date
        FROM admission a
        JOIN citizen c ON a.citizen_id = c.citizen_id
        WHERE a.ward_id = %s AND a.discharge_date IS NULL
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "citizen_id": row[0],
            "name": row[1],
            "admission_date": row[2]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
def get_citizen(request, patient_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT citizen_id, name, dob, sex
        FROM citizen
        WHERE citizen_id = %s   
    """, [patient_id])
    row = cursor.fetchone()
    if not row:
        return Response({"error": "Citizen not found"}, status=404)
    return Response({
        "citizen_id": patient_id,
        "name": row[1],
        "dob": row[2],
        "gender": row[3]
    })

@api_view(['GET'])
@permission_classes([IsOwnerCitizenOrStaff])
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
@permission_classes([IsOwnerCitizenOrStaff])
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

#redundant 
@api_view(['POST'])
@permission_classes([IsRole('worker')])
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
@permission_classes([IsRole('worker')])
def add_procedure(request, visit_id):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO procedure_taken (visit_id, procedure_id)
        VALUES (%s, %s)
    """, [visit_id, request.data['procedure_id']])
    return Response({"status": "added"})

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
def facility_inventory(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, inv.quantity, inv.expiry, i.id
        FROM inventory inv
        JOIN item i ON inv.item_id = i.id
        WHERE inv.place_id = %s
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "item": row[0],
            "quantity": row[1],
            "expiry": row[2],
            "item_id": row[3]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
def near_expiry(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, inv.expiry, inv.quantity
        FROM inventory inv
        JOIN item i ON inv.item_id = i.id
        WHERE inv.place_id = %s AND inv.expiry <= %s
    """, [fac_id, date.today() + timedelta(days=30)])
    
    rows = cursor.fetchall()
    data = [{"item": row[0], "expiry": row[1], "quantity": row[2]} for row in rows]
    return Response(data)

    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO item_use (item_id, fac_id, use_date, quantity)
        VALUES (%s, %s, %s, %s)
    """, [request.data['item_id'], request.data['facility_id'], date.today(), request.data['quantity']])
    cursor.execute(
        """UPDATE inventory SET quantity = quantity-%s WHERE place_id = %s AND item_id = %s""", [request.data['quantity'],request.data['facility_id'], request.data['item_id']]
    )
    return Response({"status": "logged"})

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
def get_lab_order_details(request, order_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT lo.id, lt.name, v.citizen_id, c.name, lo.order_date
        FROM lab_order lo
        JOIN lab_test lt ON lo.test_id = lt.id
        JOIN visit v ON lo.visit_id = v.id
        JOIN citizen c ON v.citizen_id = c.citizen_id
        WHERE lo.id = %s
    """, [order_id])
    
    row = cursor.fetchone()
    if not row:
        return Response({"error": "Lab order not found"}, status=404)
    
    data = {
        "order_id": row[0],
        "test": row[1],
        "citizen_id": row[2],
        "citizen_name": row[3],
        "date": row[4]
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
def get_current_visit_admit(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
                     (
  SELECT v.id, v.visit_date, v.citizen_id, c.name
  FROM visit v
  JOIN admission a ON a.visit_id = v.id
                   JOIN citizen c ON v.citizen_id = c.citizen_id
  WHERE v.centre_id = %s AND a.discharge_date IS NULL
) UNION DISTINCT 
                   (SELECT v.id, v.visit_date, v.citizen_id, c.name
                    FROM visit v JOIN citizen c ON v.citizen_id = c.citizen_id
                    WHERE v.centre_id = %s AND v.visit_date = %s)
    """,[fac_id, fac_id, date.today])
    
    rows = cursor.fetchall()
    data = [
        {
            "visit_id": row[0],
            "visit_date": row[1],
            "citizen_id": row[2],
            "name": row[3],
            
        } for row in rows
    ]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsRole('worker')])
def admit_patient(request):
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Lock the ward row for the duration of the transaction
                cursor.execute(
                    "SELECT occupied, total FROM wards WHERE id = %s FOR UPDATE",
                    [request.data['ward_id']]
                )
                row = cursor.fetchone()
                if not row:
                    return Response({"error": "Ward not found"}, status=404)

                occupied, total = row
                if occupied >= total:
                    return Response({"error": "Ward full"}, status=400)

                # Insert admission
                cursor.execute("""
                    INSERT INTO admission (citizen_id, visit_id, ward_id, admission_date)
                    VALUES (%s, %s, %s, %s)
                """, [request.data['citizen_id'], request.data['visit_id'],
                      request.data['ward_id'], date.today()])

                # Update visit status
                cursor.execute("UPDATE visit SET status='done' WHERE id = %s", [request.data['visit_id']])

                # Actually increment occupancy — this was missing
                cursor.execute("UPDATE wards SET occupied = occupied + 1 WHERE id = %s", [request.data['ward_id']])

        return Response({"status": "admitted"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Lock the ward row for the duration of the transaction
                cursor.execute("""
                    SELECT occupied, total FROM wards WHERE id = %s FOR UPDATE
                """, [request.data['ward_id']])
                
                row = cursor.fetchone()
                if not row:
                    return Response({"error": "Ward not found"}, status=404)
                
                if row[0] >= row[1]:
                    return Response({"error": "Ward full"}, status=400)

                # 2. Insert Admission
                cursor.execute("""
                    INSERT INTO admission (citizen_id, visit_id, ward_id, admission_date)
                    VALUES (%s, %s, %s, %s)
                """, [request.data['citizen_id'], request.data['visit_id'], 
                      request.data['ward_id'], date.today()])

                # 3. Update Visit Status
                cursor.execute("UPDATE visit SET status='done' WHERE id = %s", [request.data['visit_id']])

                #4. Trigger automatically updates ward capacity on admission table insert
        
        return Response({"status": "admitted"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsRole('worker')])
def discharge_patient(request):
    with transaction.atomic():
        with connection.cursor() as cursor:
            # Lock the ward row via the active admission, fixing the missing ON clause
            cursor.execute("""
                SELECT w.id, w.facility_id
                FROM admission a
                JOIN wards w ON a.ward_id = w.id
                WHERE a.visit_id = %s AND a.discharge_date IS NULL
                FOR UPDATE
            """, [request.data['visit_id']])
            row = cursor.fetchone()

            if not row:
                return Response({"error": "No active admission found"}, status=404)

            ward_id, facility_id = row
            if facility_id != int(request.data['facility_id']):
                return Response({"error": "Ward does not belong to this facility"}, status=400)

            cursor.execute("""
                UPDATE admission SET discharge_date = %s
                WHERE visit_id = %s AND discharge_date IS NULL
            """, [date.today(), request.data['visit_id']])

            if cursor.rowcount == 0:
                return Response({"error": "No active admission found"}, status=404)

            # Actually decrement occupancy — this was missing
            cursor.execute("UPDATE wards SET occupied = occupied - 1 WHERE id = %s", [ward_id])

    return Response({"status": "discharged"})
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute("""SELECT w.facility_id FROM wards w JOIN admission a WHERE a.ward_id = w.id AND a.visit_id = %s AND a.discharge_date IS NULL""", [request.data['visit_id']])
            id = cursor.fetchone()
            print(request.data['facility_id'])
            print(id)
            if (not id or id[0] != int(request.data['facility_id'])):
                return Response({"error":"error"}, status = 400)
            
            cursor.execute("""
                UPDATE admission SET discharge_date = %s 
                WHERE visit_id = %s AND discharge_date IS NULL
            """, [date.today(), request.data['visit_id']])
            
            if cursor.rowcount == 0:
                return Response({"error": "No active admission found"}, status=404)
                
    return Response({"status": "discharged"})

@api_view(['POST'])
@permission_classes([IsRole('worker')])
def transfer_patient(request):
    data = request.data
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Lock and check new ward
                cursor.execute("SELECT occupied, total FROM wards WHERE id = %s FOR UPDATE", [data['ward_id']])
                ward = cursor.fetchone()
                if not ward or ward[0] >= ward[1]:
                    return Response({"error": "Target ward full or missing"}, status=400)

                cursor.execute(
                    "SELECT ward_id FROM admission WHERE visit_id = %s AND discharge_date IS NULL FOR UPDATE",
                    [data['visit_id']]
                )
                current = cursor.fetchone()
                if not current:
                    return Response({"error": "Patient not admitted"}, status=400)

                old_ward_id = current[0]

                # Discharge old admission
                cursor.execute("""
                    UPDATE admission SET discharge_date = %s
                    WHERE visit_id = %s AND discharge_date IS NULL
                """, [date.today(), data['visit_id']])

                # Create new admission
                cursor.execute("""
                    INSERT INTO admission (citizen_id, visit_id, ward_id, admission_date)
                    VALUES (%s, %s, %s, %s)
                """, [data['citizen_id'], data['visit_id'], data['ward_id'], date.today()])

                # Adjust occupancy on both wards — this was missing
                cursor.execute("UPDATE wards SET occupied = occupied - 1 WHERE id = %s", [old_ward_id])
                cursor.execute("UPDATE wards SET occupied = occupied + 1 WHERE id = %s", [data['ward_id']])

                # Log transfer
                cursor.execute("""
                    INSERT INTO transfers (visit_id, citizen_id, from_fac, to_fac, date_of_transfer, reason)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, [data['visit_id'], data['citizen_id'], data['from_fac'],
                      data['to_fac'], date.today(), data.get('reason', '')])

        return Response({"status": "transferred"})
    except Exception as e:
        return Response({"error": "Transfer failed", "details": str(e)}, status=500)
    data = request.data
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Lock and Check New Ward
                cursor.execute("SELECT occupied, total FROM wards WHERE id = %s FOR UPDATE", [data['ward_id']])
                ward = cursor.fetchone()
                if not ward or ward[0] >= ward[1]:
                    return Response({"error": "Target ward full or missing"}, status=400)
                
                cursor.execute("SELECT * FROM admission WHERE visit_id = %s AND discharge_date IS NULL", [data['visit_id']])
                t = cursor.fetchone()
                if not t:
                    print(data['visit_id'])
                    return Response({"error": "Patient Not Admitted"}, status=400)

                # 2. Discharge old admission
                cursor.execute("""
                    UPDATE admission SET discharge_date = %s 
                    WHERE visit_id = %s AND discharge_date IS NULL
                """, [date.today(), data['visit_id']])
                

                # 3. Create new admission
                cursor.execute("""
                    INSERT INTO admission (citizen_id, visit_id, ward_id, admission_date)
                    VALUES (%s, %s, %s, %s)
                """, [data['citizen_id'], data['visit_id'], data['ward_id'], date.today()])

                # 4. Log transfer
                cursor.execute("""
                    INSERT INTO transfers (visit_id, citizen_id, from_fac, to_fac, date_of_transfer, reason)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, [data['visit_id'], data['citizen_id'], data['from_fac'], 
                      data['to_fac'], date.today(), data.get('reason', '')])

        return Response({"status": "transferred"})
    except Exception as e:
        return Response({"error": "Transfer failed", "details": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
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
@permission_classes([IsRole('worker','admin')])
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
@permission_classes([IsRole('worker','admin')])
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

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
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

@api_view(['POST'])
@permission_classes([IsRole('worker')])
def submit_lab_result(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO lab_result (order_id, result, result_date)
        VALUES (%s, %s, %s)
    """, [request.data['order_id'], request.data['result'], date.today()])
    return Response({"status": "submitted"})

@api_view(['GET'])
@permission_classes([IsRole('worker')])
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
@permission_classes([IsRole('worker', 'admin')])
def admitted_patients(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT a.citizen_id, c.name, w.type, a.admission_date, a.visit_id
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
            "admission_date": row[3],
            "visit_id": row[4]
        } for row in rows
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsRole('worker', 'admin')])
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
@permission_classes([IsRole('worker', 'admin')])
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
@permission_classes([IsRole('worker', 'admin')])
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

@api_view(['GET'])
@permission_classes([IsRole('worker', 'admin')])
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

@api_view(['GET'])
@permission_classes([IsRole('worker', 'admin')])
def visit_id(request, visit_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT citizen_id, centre_id FROM visit WHERE id = %s
    """, [visit_id])
    
    row = cursor.fetchone()
    if not row:
        return Response({"error": "Visit not found"}, status=404)
    
    return Response({"citizen_id": row[0], "facility_id":row[1]})

@api_view(['POST'])
@permission_classes([IsRole('admin')])
def add_facility(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO place (addr_l1, addr_l2, city, state, postal_code, latitude, longitude)
        VALUES (%s, NULL, %s, %s, %s, %s, %s)
    """, [request.data['addr_l1'], request.data['city'], request.data['state'], request.data['postal_code'], request.data['latitude'], request.data['longitude']])
    
    place_id = cursor.lastrowid
    cursor.execute("""
        INSERT INTO health_facility (id, name, type)
        VALUES (%s, %s, %s)
    """, [place_id, request.data['name'], request.data['type']])
    
    return Response({"facility_id": place_id})

@api_view(['POST'])
@permission_classes([IsRole('admin')])
def add_facility_contact(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO healthfac_contact (healthfac_id, email, phone, is_primary)
        VALUES (%s, %s, %s, %s)
    """, [request.data['facility_id'], request.data.get('email'), request.data.get('phone'), request.data.get('is_primary', False)])
    
    contact_id = cursor.lastrowid
    return Response({"id": contact_id})

@api_view(['POST'])
@permission_classes([IsRole('admin')])
def assign_worker(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO works (worker_id, fac_id, start_date)
        VALUES (%s, %s, %s)
    """, [request.data['worker_id'], request.data['facility_id'], request.data['start_date']])
    return Response({"status": "assigned"})

@api_view(['POST'])
@permission_classes([IsRole('admin')])
def unassign_worker(request):
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE works 
        SET end_date = %s 
        WHERE worker_id = %s AND fac_id = %s AND end_date IS NULL
    """, [request.data['end_date'], request.data['worker_id'], request.data['facility_id']])
    return Response({"status": "unassigned"})

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
def get_facility_workers(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT w.worker_id, hw.id as user_id, hw.name, hw.role, s.name
        FROM works w
        JOIN healthcareworker hw ON w.worker_id = hw.id
                   JOIN skills s ON hw.id = s.worker_id
        WHERE w.fac_id = %s AND w.end_date IS NULL
    """, [fac_id])
    
    rows = cursor.fetchall()
    
    # Use a dictionary to group everything by worker_id temporarily
    workers_dict = {}
    
    for row in rows:
        worker_id = row[1]
        name = row[2]
        role = row[3]
        skill = row[4]
        
        # If we haven't seen this worker yet, create their entry
        if worker_id not in workers_dict:
            workers_dict[worker_id] = {
                "worker_id": worker_id,
                "name": name,
                "role": role,
                "skills": [] # Start with an empty list for skills
            }
            
        # Append the skill to the worker's skills list (checking if it's not None)
        if skill:
            workers_dict[worker_id]["skills"].append(skill)
            
    # Convert the grouped dictionary values back into the final list format
    data = list(workers_dict.values())

    return Response(data)

@api_view(['GET'])
def get_all_facilities(request):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, name, type
        FROM health_facility
    """)
    
    rows = cursor.fetchall()
    data = [
        {
            "id": row[0],
            "name": row[1],
            "type": row[2]
        }
        for row in rows
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsOwnerCitizenOrStaff])
def get_facility_contacts(request, facility_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, email, phone, is_primary
        FROM healthfac_contact 
        WHERE healthfac_id = %s
    """, [facility_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "id": row[0],
            "email": row[1],
            "phone": row[2],
            "is_primary": row[3]
        }
        for row in rows
    ]
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsRole('admin')])
def delete_facility_contact(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM healthfac_contact WHERE id = %s", [id])
    return Response({"status": "deleted"})