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

    except Exception as e:
        print(e)
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
def add_citizen_contact(request):
    user = request.user
    citizen_id = request.data.get('citizen_id')

    if not getattr(user, 'is_authenticated', False):
        return Response({"error": "Authentication required"}, status=401)
    if user.role == 'citizen' and str(user.id) != str(citizen_id):
        return Response({"error": "Forbidden"}, status=403)
    if user.role not in ('citizen', 'worker', 'admin'):
        return Response({"error": "Forbidden"}, status=403)

    email = request.data.get('email')
    phone = request.data.get('phone')
    if not email and not phone:
        return Response({"error": "Provide email or phone"}, status=400)

    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO citizen_contact (citizen_id, email, phone, is_primary)
        VALUES (%s, %s, %s, %s)
    """, [citizen_id, email, phone, request.data.get('is_primary', False)])

    return Response({"id": cursor.lastrowid})

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
def delete_citizen_contact(request, citizen_id, id):
    cursor = connection.cursor()
    cursor.execute(
        "DELETE FROM citizen_contact WHERE id = %s AND citizen_id = %s",
        [id, citizen_id]
    )
    return Response({"status": "deleted"})