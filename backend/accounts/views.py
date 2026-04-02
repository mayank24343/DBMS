from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from django.db import connection


from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response


@csrf_exempt

@api_view(['POST'])
def login_view(request):
    identifier = request.data.get('identifier')
    password = request.data.get('password')
    role = request.data.get('role')

    cursor = connection.cursor()

    try:
        # ================= CITIZEN =================
        if role == "citizen":

            cursor.execute("""
                SELECT u.userid, u.password
                FROM citizen c
                JOIN users u ON c.citizen_id = u.userid
                WHERE c.citizen_id = %s OR c.aadhar_no = %s
            """, [identifier, identifier])

            row = cursor.fetchone()

            if not row:
                return Response({"error": "Citizen not found"}, status=400)

            user_id, db_password = row

            if db_password != password:
                return Response({"error": "Incorrect password"}, status=400)

            return Response({
                "role": "citizen",
                "citizen_id": user_id
            })

        # ================= WORKER =================
        elif role == "worker":

            cursor.execute("""
                SELECT u.userid, u.password, w.fac_id
                FROM healthcareworker hw
                JOIN users u ON hw.id = u.userid
                LEFT JOIN works w ON hw.id = w.worker_id AND w.end_date IS NULL
                WHERE hw.id = %s
            """, [identifier])

            row = cursor.fetchone()

            if not row:
                return Response({"error": "Worker not found"}, status=400)

            user_id, db_password, fac_id = row

            if db_password != password:
                return Response({"error": "Incorrect password"}, status=400)

            return Response({
                "role": "worker",
                "worker_id": user_id,
                "facility_id": fac_id
            })

        # ================= SUPPLIER =================
        elif role == "supplier":

            cursor.execute("""
                SELECT u.userid, u.password
                FROM supplier s
                JOIN users u ON s.id = u.userid
                WHERE s.id = %s
            """, [identifier])

            row = cursor.fetchone()

            if not row:
                return Response({"error": "Supplier not found"}, status=400)

            user_id, db_password = row

            if db_password != password:
                return Response({"error": "Incorrect password"}, status=400)

            return Response({
                "role": "supplier",
                "supplier_id": user_id
            })

        # ================= ADMIN =================
        elif role == "admin":

            return Response({"role": "admin"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

def create_user(password, role):
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO users (password, role)
        VALUES (%s, %s)
    """, [password, role])

    return cursor.lastrowid

@api_view(['POST'])
def add_citizen(request):
    cursor = connection.cursor()

    user_id = create_user(request.data['password'], "CITIZEN")

    cursor.execute("""
        INSERT INTO citizen (
            citizen_id, aadhar_no, name, dob, sex,
            addr_l1, city, state, postal_code, latitude, longitude
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, [
        user_id,
        request.data['aadhar_no'],
        request.data['name'],
        request.data['dob'],
        request.data['sex'],
        request.data['addr_l1'],
        request.data['city'],
        request.data['state'],
        request.data['postal_code'],
        request.data['latitude'],
        request.data['longitude']
    ])

    return Response({"citizen_id": user_id})

@api_view(['POST'])
def add_citizen_contact(request):
    citizen_id = request.data.get('citizen_id')
    email = request.data.get('email')
    phone = request.data.get('phone')

    if not email and not phone:
        return Response({"error": "Provide email or phone"}, status=400)

    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO citizen_contact (citizen_id, email, phone, is_primary)
        VALUES (%s, %s, %s, %s)
    """, [citizen_id, email, phone, request.data.get('is_primary', False)])
    
    contact_id = cursor.lastrowid
    return Response({"id": contact_id})

@api_view(['DELETE'])
def delete_citizen(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM citizen WHERE citizen_id = %s", [id])
    return Response({"status": "deleted"})

@api_view(['POST'])
def add_worker(request):
    cursor = connection.cursor()

    user_id = create_user(request.data['password'], "WORKER")

    cursor.execute("""
        INSERT INTO healthcareworker (id, name, role)
        VALUES (%s, %s, %s)
    """, [user_id, request.data['name'], request.data['role']])

    return Response({"worker_id": user_id})

@api_view(['DELETE'])
def delete_worker(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM healthcareworker WHERE id = %s", [id])
    return Response({"status": "deleted"})

@api_view(['POST'])
def add_supplier(request):
    cursor = connection.cursor()

    user_id = create_user(request.data['password'], "SUPPLIER")

    cursor.execute("""
        INSERT INTO supplier (
            id, name, addr_l1, city, state,
            postal_code, latitude, longitude
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, [
        user_id,
        request.data['name'],
        request.data['addr_l1'],
        request.data['city'],
        request.data['state'],
        request.data['postal_code'],
        request.data['latitude'],
        request.data['longitude']
    ])

    return Response({"supplier_id": user_id})

@api_view(['POST'])
def add_supplier_contact(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO supplier_contact (supplier_id, email, phone, is_primary)
        VALUES (%s, %s, %s, %s)
    """, [request.data['supplier_id'], request.data.get('email'), request.data.get('phone'), request.data.get('is_primary', False)])
    
    contact_id = cursor.lastrowid
    return Response({"id": contact_id})

@api_view(['POST'])
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
def add_facility_contact(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO healthfac_contact (healthfac_id, email, phone, is_primary)
        VALUES (%s, %s, %s, %s)
    """, [request.data['facility_id'], request.data.get('email'), request.data.get('phone'), request.data.get('is_primary', False)])
    
    contact_id = cursor.lastrowid
    return Response({"id": contact_id})

@api_view(['POST'])
def add_warehouse(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO place (addr_l1, addr_l2, city, state, postal_code, latitude, longitude)
        VALUES (%s, NULL, %s, %s, %s, %s, %s)
    """, [request.data['addr_l1'], request.data['city'], request.data['state'], request.data['postal_code'], request.data['latitude'], request.data['longitude']])
    
    place_id = cursor.lastrowid
    cursor.execute("INSERT INTO warehouse (id) VALUES (%s)", [place_id])
    
    return Response({"warehouse_id": place_id})

@api_view(['POST'])
def add_warehouse_contact(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO warehouse_contact (wh_id, email, phone, is_primary)
        VALUES (%s, %s, %s, %s)
    """, [request.data['warehouse_id'], request.data.get('email'), request.data.get('phone'), request.data.get('is_primary', False)])
    
    contact_id = cursor.lastrowid
    return Response({"id": contact_id})

@api_view(['POST'])
def assign_worker(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO works (worker_id, fac_id, start_date)
        VALUES (%s, %s, %s)
    """, [request.data['worker_id'], request.data['facility_id'], request.data['start_date']])
    return Response({"status": "assigned"})

@api_view(['GET'])
def get_facility_workers(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT w.worker_id, hw.id as user_id, hw.name, hw.role
        FROM works w
        JOIN healthcareworker hw ON w.worker_id = hw.id
        WHERE w.fac_id = %s AND w.end_date IS NULL
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [
        {
            "worker_id": row[1],
            "name": row[2],
            "role": row[3]
        }
        for row in rows
    ]
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

@api_view(['POST'])
def unassign_worker(request):
    cursor = connection.cursor()
    cursor.execute("""
        UPDATE works 
        SET end_date = %s 
        WHERE worker_id = %s AND fac_id = %s AND end_date IS NULL
    """, [request.data['end_date'], request.data['worker_id'], request.data['facility_id']])
    return Response({"status": "unassigned"})

@api_view(['GET'])
def get_citizen_contacts(request, citizen_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, email, phone, is_primary
        FROM citizen_contact 
        WHERE citizen_id = %s
    """, [citizen_id])
    
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
def delete_citizen_contact(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM citizen_contact WHERE id = %s", [id])
    return Response({"status": "deleted"})

@api_view(['GET'])
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
def delete_facility_contact(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM healthfac_contact WHERE id = %s", [id])
    return Response({"status": "deleted"})

@api_view(['GET'])
def get_warehouse_contacts(request, warehouse_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, email, phone, is_primary
        FROM warehouse_contact 
        WHERE wh_id = %s
    """, [warehouse_id])
    
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
def delete_warehouse_contact(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM warehouse_contact WHERE id = %s", [id])
    return Response({"status": "deleted"})

@api_view(['GET'])
def get_supplier_contacts(request, facility_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT id, email, phone, is_primary
        FROM supplier_contact 
        WHERE supplier_id = %s
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
def delete_supplier_contact(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM supplier_contact WHERE id = %s", [id])
    return Response({"status": "deleted"})
