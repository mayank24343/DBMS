from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from django.db import connection

from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .tokens import issue_token
from .permissions import IsRole
from .permissions import IsOwnerCitizenOrStaff

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    identifier = request.data.get('identifier')
    password = request.data.get('password')
    role = request.data.get('role')

    if not identifier or not password or not role:
        return Response({"error": "identifier, password and role are required"}, status=400)

    cursor = connection.cursor()

    try:
        if role == "citizen":
            cursor.execute("""
                SELECT u.userid, u.password_hash
                FROM citizen c JOIN users u ON c.citizen_id = u.userid
                WHERE c.citizen_id = %s OR c.aadhar_no = %s
            """, [identifier, identifier])
            row = cursor.fetchone()
            if not row:
                return Response({"error": "Citizen not found"}, status=400)
            user_id, password_hash = row
            if not check_password(password, password_hash):
                return Response({"error": "Incorrect password"}, status=400)
            token = issue_token(user_id, "citizen")
            return Response({"role": "citizen", "citizen_id": user_id, "token": token})

        elif role == "worker":
            cursor.execute("""
                SELECT u.userid, w.fac_id, u.password_hash
                FROM healthcareworker hw
                JOIN users u ON hw.id = u.userid
                LEFT JOIN works w ON hw.id = w.worker_id AND w.end_date IS NULL
                WHERE hw.id = %s
            """, [identifier])
            row = cursor.fetchone()
            if not row:
                return Response({"error": "Worker not found"}, status=400)
            user_id, fac_id, password_hash = row
            if not check_password(password, password_hash):
                return Response({"error": "Incorrect password"}, status=400)
            token = issue_token(user_id, "worker")
            return Response({"role": "worker", "worker_id": user_id, "facility_id": fac_id, "token": token})

        elif role == "admin":
            cursor.execute("""
                SELECT userid, password_hash FROM users WHERE userid = %s AND role = 'admin'
            """, [identifier])
            row = cursor.fetchone()
            if not row:
                return Response({"error": "Admin not found"}, status=400)
            user_id, password_hash = row
            if not check_password(password, password_hash):
                return Response({"error": "Incorrect password"}, status=400)
            token = issue_token(user_id, "admin")
            return Response({"role": "admin", "id": user_id, "token": token})

        else:
            return Response({"error": "Invalid role"}, status=400)

    except Exception:
        return Response({"error": "Login failed"}, status=500)

def create_user(password, role):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO users (password_hash, role)
        VALUES (%s, %s)
    """, [make_password(password), role])
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
@permission_classes([IsOwnerCitizenOrStaff])
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
@permission_classes([IsRole('admin')])
def delete_citizen(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM citizen WHERE citizen_id = %s", [id])
    return Response({"status": "deleted"})

@api_view(['POST'])
@permission_classes([IsRole('admin')])
def add_worker(request):
    cursor = connection.cursor()

    user_id = create_user(request.data['password'], "WORKER")

    cursor.execute("""
        INSERT INTO healthcareworker (id, name, role)
        VALUES (%s, %s, %s)
    """, [user_id, request.data['name'], request.data['role']])

    return Response({"worker_id": user_id})

@api_view(['DELETE'])
@permission_classes([IsRole('admin')])
def delete_worker(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM healthcareworker WHERE id = %s", [id])
    return Response({"status": "deleted"})

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
@permission_classes([IsOwnerCitizenOrStaff])
def delete_citizen_contact(request, id):
    cursor = connection.cursor()
    cursor.execute("DELETE FROM citizen_contact WHERE id = %s", [id])
    return Response({"status": "deleted"})

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