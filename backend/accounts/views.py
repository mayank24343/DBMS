from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from accounts.models import User, HealthcareWorker, Place, HealthFacility, Warehouse, Works, Citizen, CitizenContact, HealthFacilityContact, SupplierContact, WarehouseContact
from clinical.models import Citizen
from inventory.models import Supplier


@csrf_exempt
@api_view(['POST'])
def login_view(request):
    identifier = request.data.get("identifier")
    password = request.data.get("password")
    role = request.data.get("role")

    if role == "citizen":
        citizen = Citizen.objects.filter(
            Q(user_id=identifier) | Q(aadhar_no=identifier)
        ).select_related('user').first()

        if not citizen:
            return Response({"error": "Citizen not found"}, status=404)

        if citizen.user.password != password:
            return Response({"error": "Invalid password"}, status=401)

        return Response({"role": "citizen", "citizen_id": citizen.user_id})

    return Response({"error": "Invalid role"}, status=400)

def create_user(password, role):
    user = User.objects.create(
        password=password,
        role=role
    )
    return user

@api_view(['POST'])
def add_citizen(request):
    user = create_user(request.data['password'], "CITIZEN")

    citizen = Citizen.objects.create(
        user=user,
        aadhar_no=request.data['aadhar_no'],
        name=request.data['name'],
        dob=request.data['dob'],
        sex=request.data['sex'],
        addr_l1=request.data['addr_l1'],
        city=request.data['city'],
        state=request.data['state'],
        postal_code=request.data['postal_code'],
        latitude=request.data['latitude'],
        longitude=request.data['longitude']
    )

    return Response({"citizen_id": citizen.user_id})

@api_view(['POST'])
def add_citizen_contact(request):
    citizen_id = request.data.get('citizen_id')
    email = request.data.get('email')
    phone = request.data.get('phone')

    if not email and not phone:
        return Response({"error": "Provide email or phone"}, status=400)

    contact = CitizenContact.objects.create(
        citizen_id=citizen_id,
        email=email,
        phone=phone,
        is_primary=request.data.get('is_primary', False)
    )

    return Response({"id": contact.id})

@api_view(['DELETE'])
def delete_citizen(request, id):
    Citizen.objects.filter(user_id=id).delete()
    return Response({"status": "deleted"})

@api_view(['POST'])
def add_worker(request):
    user = create_user(request.data['password'], "WORKER")

    worker = HealthcareWorker.objects.create(
        user=user,
        name=request.data['name'],
        role=request.data['role']
    )

    return Response({"worker_id": worker.user_id})

@api_view(['DELETE'])
def delete_worker(request, id):
    HealthcareWorker.objects.filter(user_id=id).delete()
    return Response({"status": "deleted"})

@api_view(['POST'])
def add_supplier(request):
    user = create_user(request.data['password'], "SUPPLIER")

    supplier = Supplier.objects.create(
        user=user,
        name=request.data['name'],
        addr_l1=request.data['addr_l1'],
        city=request.data['city'],
        state=request.data['state'],
        postal_code=request.data['postal_code'],
        latitude=request.data['latitude'],
        longitude=request.data['longitude']
    )

    return Response({"supplier_id": supplier.user_id})

@api_view(['POST'])
def add_supplier_contact(request):
    contact = SupplierContact.objects.create(
        supplier_id=request.data['supplier_id'],
        email=request.data.get('email'),
        phone=request.data.get('phone'),
        is_primary=request.data.get('is_primary', False)
    )

    return Response({"id": contact.id})

@api_view(['POST'])
def add_facility(request):
    place = Place.objects.create(
        addr_l1=request.data['addr_l1'],
        city=request.data['city'],
        state=request.data['state'],
        postal_code=request.data['postal_code'],
        latitude=request.data['latitude'],
        longitude=request.data['longitude']
    )

    facility = HealthFacility.objects.create(
        place=place,
        name=request.data['name'],
        type=request.data['type']
    )

    return Response({"facility_id": facility.place_id})

@api_view(['POST'])
def add_facility_contact(request):
    contact = HealthFacilityContact.objects.create(
        healthfac_id=request.data['facility_id'],
        email=request.data.get('email'),
        phone=request.data.get('phone'),
        is_primary=request.data.get('is_primary', False)
    )

    return Response({"id": contact.id})

@api_view(['POST'])
def add_warehouse(request):
    place = Place.objects.create(
        addr_l1=request.data['addr_l1'],
        city=request.data['city'],
        state=request.data['state'],
        postal_code=request.data['postal_code'],
        latitude=request.data['latitude'],
        longitude=request.data['longitude']
    )

    Warehouse.objects.create(place=place)

    return Response({"warehouse_id": place.id})

@api_view(['POST'])
def add_warehouse_contact(request):
    contact = WarehouseContact.objects.create(
        wh_id=request.data['warehouse_id'],
        email=request.data.get('email'),
        phone=request.data.get('phone'),
        is_primary=request.data.get('is_primary', False)
    )

    return Response({"id": contact.id})

@api_view(['POST'])
def assign_worker(request):
    Works.objects.create(
        worker_id=request.data['worker_id'],
        fac_id=request.data['facility_id'],
        start_date=request.data['start_date']
    )

    return Response({"status": "assigned"})

@api_view(['GET'])
def get_facility_workers(request, fac_id):
    workers = Works.objects.select_related('worker') \
        .filter(facility_id=fac_id, end_date__isnull=True)

    data = [
        {
            "worker_id": w.worker.user_id,
            "name": w.worker.name,
            "role": w.worker.role
        }
        for w in workers
    ]

    return Response(data)

@api_view(['POST'])
def unassign_worker(request):
    Works.objects.filter(
        worker_id=request.data['worker_id'],
        fac_id=request.data['facility_id'],
        end_date__isnull=True
    ).update(end_date=request.data['end_date'])

    return Response({"status": "unassigned"})

@api_view(['GET'])
def get_citizen_contacts(request, citizen_id):
    contacts = CitizenContact.objects.filter(citizen_id=citizen_id)

    data = [
        {
            "id": c.id,
            "email": c.email,
            "phone": c.phone,
            "is_primary": c.is_primary
        }
        for c in contacts
    ]

    return Response(data)

@api_view(['DELETE'])
def delete_citizen_contact(request, id):
    CitizenContact.objects.filter(id=id).delete()
    return Response({"status": "deleted"})

@api_view(['GET'])
def get_facility_contacts(request, facility_id):
    contacts = HealthFacilityContact.objects.filter(healthfac_id=facility_id)

    data = [
        {
            "id": c.id,
            "email": c.email,
            "phone": c.phone,
            "is_primary": c.is_primary
        }
        for c in contacts
    ]

    return Response(data)

@api_view(['DELETE'])
def delete_facility_contact(request, id):
    HealthFacilityContact.objects.filter(id=id).delete()
    return Response({"status": "deleted"})

@api_view(['GET'])
def get_warehouse_contacts(request, warehouse_id):
    contacts = WarehouseContact.objects.filter(wh_id=warehouse_id)

    data = [
        {
            "id": c.id,
            "email": c.email,
            "phone": c.phone,
            "is_primary": c.is_primary
        }
        for c in contacts
    ]

    return Response(data)

@api_view(['DELETE'])
def delete_warehouse_contact(request, id):
    WarehouseContact.objects.filter(id=id).delete()
    return Response({"status": "deleted"})

@api_view(['GET'])
def get_supplier_contacts(request, facility_id):
    contacts = SupplierContact.objects.filter(healthfac_id=facility_id)

    data = [
        {
            "id": c.id,
            "email": c.email,
            "phone": c.phone,
            "is_primary": c.is_primary
        }
        for c in contacts
    ]

    return Response(data)

@api_view(['DELETE'])
def delete_supplier_contact(request, id):
    SupplierContact.objects.filter(id=id).delete()
    return Response({"status": "deleted"})