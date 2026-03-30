# backend/facilities/views.py
from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response

from accounts.models import HealthFacilityContact
from clinical.models import Admission, Diagnosis, LabOrder, LabResult, Prescription, ProcedureTaken, Transfer, Visit
from inventory.models import Inventory, ItemUse
from .models import HealthFacility, Ward

@api_view(['GET'])
def get_facility(request, id):
    f = HealthFacility.objects.select_related('place').get(pk=id)

    data = {
        "id": f.place_id,
        "name": f.name,
        "type": f.type,
        "address": f.place.addr_l1,
        "city": f.place.city,
        "state": f.place.state
    }

    return Response(data)

@api_view(['GET'])
def facility_contacts(request, id):
    contacts = HealthFacilityContact.objects.filter(healthfac_id=id)

    return Response([
        {
            "email": c.email,
            "phone": c.phone,
            "is_primary": c.is_primary
        } for c in contacts
    ])

from datetime import date

@api_view(['GET'])
def today_appointments(request, fac_id):
    visits = Visit.objects.filter(
        centre_id=fac_id,
        visit_date=date.today()
    ).select_related('citizen')

    return Response([
        {
            "visit_id": v.id,
            "citizen_id": v.citizen_id,
            "name": v.citizen.name,
            "reason": v.reason
        } for v in visits
    ])

@api_view(['GET'])
def get_ward_availability(request, fac_id):
    wards = Ward.objects.filter(facility_id=fac_id)
    data = []
    for ward in wards:
        data.append({
            "id": ward.id,
            "type": ward.type,
            "total": ward.total,
            "occupied": ward.occupied,
            # Calculate available beds right here on the backend
            "available": ward.total - ward.occupied 
        })
    return Response(data)

@api_view(['GET'])
def facility_occupancy(request, fac_id):
    wards = Ward.objects.filter(facility_id=fac_id)

    total = sum(w.total for w in wards)
    occupied = sum(w.occupied for w in wards)

    return Response({
        "total_beds": total,
        "occupied": occupied,
        "vacant": total - occupied
    })

@api_view(['GET'])
def citizen_history(request, citizen_id):
    visits = Visit.objects.filter(citizen_id=citizen_id)

    return Response([
        {
            "visit_id": v.id,
            "date": v.visit_date,
            "facility": v.centre.name
        } for v in visits
    ])

@api_view(['GET'])
def citizen_lab_tests(request, citizen_id):
    orders = LabOrder.objects.filter(
        visit__citizen_id=citizen_id
    ).prefetch_related('results')

    return Response([
        {
            "test": o.test.name,
            "status": "done" if o.results.exists() else "pending"
        }
        for o in orders
    ])

@api_view(['POST'])
def add_diagnosis(request, visit_id):
    # diagnosis
    Diagnosis.objects.create(
        visit_id=visit_id,
        disease_id=request.data.get('disease_id'),
        description=request.data.get('description')
    )

    # prescriptions
    for p in request.data.get('prescriptions', []):
        Prescription.objects.create(
            visit_id=visit_id,
            item_id=p['item_id'],
            dosage=p.get('dosage'),
            frequency=p.get('frequency')
        )

    # lab tests
    for t in request.data.get('tests', []):
        LabOrder.objects.create(
            visit_id=visit_id,
            test_id=t,
            lab_id=request.data.get('lab_id'),
            order_date=date.today()
        )

    return Response({"status": "done"})

@api_view(['POST'])
def add_procedure(request, visit_id):
    ProcedureTaken.objects.create(
        visit_id=visit_id,
        procedure_id=request.data['procedure_id']
    )

    return Response({"status": "added"})

@api_view(['GET'])
def facility_inventory(request, fac_id):
    items = Inventory.objects.filter(place_id=fac_id)

    return Response([
        {
            "item": i.item.name,
            "quantity": i.quantity,
            "expiry": i.expiry
        }
        for i in items
    ])

from datetime import timedelta

@api_view(['GET'])
def near_expiry(request, fac_id):
    items = Inventory.objects.filter(
        place_id=fac_id,
        expiry__lte=date.today() + timedelta(days=30)
    )

    return Response([
        {"item": i.item.name, "expiry": i.expiry}
        for i in items
    ])

@api_view(['POST'])
def log_usage(request):
    ItemUse.objects.create(
        item_id=request.data['item_id'],
        fac_id=request.data['facility_id'],
        quantity=request.data['quantity'],
        use_date=date.today()
    )

    return Response({"status": "logged"})

@api_view(['POST'])
def admit_patient(request):
    Admission.objects.create(
        citizen_id=request.data['citizen_id'],
        visit_id=request.data['visit_id'],
        ward_id=request.data['ward_id'],
        admission_date=date.today()
    )

    return Response({"status": "admitted"})

@api_view(['POST'])
def discharge_patient(request):
    Admission.objects.filter(
        visit_id=request.data['visit_id']
    ).update(discharge_date=date.today())

    return Response({"status": "discharged"})

@api_view(['POST'])
def transfer_patient(request):
    Transfer.objects.create(
        visit_id=request.data['visit_id'],
        citizen_id=request.data['citizen_id'],
        from_fac=request.data['from_fac'],
        to_fac=request.data['to_fac'],
        date_of_transfer=date.today(),
        reason=request.data.get('reason')
    )

    return Response({"status": "transferred"})

from django.db.models import Count

from django.db.models import Sum

@api_view(['GET'])
def inventory_usage_stats(request, fac_id):
    data = ItemUse.objects.filter(fac_id=fac_id) \
        .values('item__name') \
        .annotate(total_used=Sum('quantity'))

    return Response(list(data))

@api_view(['GET'])
def facility_disease_stats(request, fac_id):
    data = Diagnosis.objects.filter(
        visit__centre_id=fac_id
    ).values('disease__name') \
     .annotate(count=Count('id'))

    return Response(list(data))

@api_view(['GET'])
def appointment_stats(request, fac_id):
    data = Visit.objects.filter(centre_id=fac_id) \
        .values('visit_date') \
        .annotate(count=Count('id'))

    return Response(list(data))

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def pending_lab_tests(request, lab_id):
    orders = LabOrder.objects.filter(
        lab_id=lab_id
    ).prefetch_related('results').select_related('test', 'visit__citizen')

    data = []
    for o in orders:
        if not o.results.exists():  # pending only
            data.append({
                "order_id": o.id,
                "test": o.test.name,
                "citizen_id": o.visit.citizen_id,
                "citizen_name": o.visit.citizen.name,
                "date": o.order_date
            })

    return Response(data)

from datetime import date

@api_view(['POST'])
def submit_lab_result(request):
    LabResult.objects.create(
        order_id=request.data['order_id'],
        result=request.data['result'],
        result_date=date.today()
    )

    return Response({"status": "submitted"})

@api_view(['GET'])
def all_lab_tests(request, lab_id):
    orders = LabOrder.objects.filter(
        lab_id=lab_id
    ).prefetch_related('results').select_related('test')

    data = []
    for o in orders:
        result = o.results.first()

        data.append({
            "order_id": o.id,
            "test": o.test.name,
            "status": "Completed" if result else "Pending",
            "result": result.result if result else None
        })

    return Response(data)