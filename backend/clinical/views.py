# backend/clinical/views.py

# --- Django & DRF Imports ---
from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, F
from django.db.models.functions import ExtractMonth

# --- Local App Imports ---
from .models import Vaccination, Visit, Citizen, Diagnosis, Disease, LabOrder, Prescription, VaccPrereqAge, VaccPrereqDose
from inventory.models import Item
from .serializers import (
    MedicalHistorySerializer, 
    VisitFullDetailSerializer,
    DiseaseCaseSerializer, 
    MonthlyTrendSerializer
)

@api_view(['GET'])
def medical_history(request, citizen_id):
    visits = Visit.objects.filter(citizen_id=citizen_id) \
        .select_related('centre') \
        .prefetch_related('diagnoses__disease') \
        .order_by('-visit_date')

    data = []
    for v in visits:
        data.append({
            "id": v.id,
            "visit_date": v.visit_date,
            "facility": v.centre.name,
            "reason": v.reason,
            "diagnoses": [
                {
                    "disease": d.disease.name if d.disease else None,
                    "description": d.description
                } for d in v.diagnoses.all()
            ]
        })

    return Response(data)

@api_view(['GET'])
def lab_reports(request, citizen_id):
    reports = LabOrder.objects.filter(
        visit__citizen_id=citizen_id
    ).select_related('test').prefetch_related('results')

    data = []
    for r in reports:
        result = r.results.first()

        data.append({
            "test": r.test.name,
            "order_date": r.order_date,
            "status": "Completed" if result else "Pending",
            "result": result.result if result else None,
            "result_date": result.result_date if result else None
        })

    return Response(data)

@api_view(['GET'])
def vaccination_history(request, citizen_id):
    vaccinations = Vaccination.objects.filter(
        citizen_id=citizen_id
    ).select_related('vaccine', 'centre') \
     .order_by('-vaccination_date')

    data = [
        {
            "vaccine": v.vaccine.name,
            "date": v.vaccination_date,
            "dose": v.dose_no,
            "centre": v.centre.name
        }
        for v in vaccinations
    ]

    return Response(data)

from datetime import date

@api_view(['GET'])
def eligible_vaccines(request, citizen_id):
    citizen = Citizen.objects.get(pk=citizen_id)

    age = date.today().year - citizen.dob.year

    taken = Vaccination.objects.filter(
        citizen_id=citizen_id
    ).values_list('vaccine_id', flat=True)

    vaccines = Item.objects.filter(
        type='vaccine',
        vaccprereqage__age_limit__lte=age
    ).exclude(id__in=taken).distinct()

    data = [{"id": v.id, "name": v.name} for v in vaccines]

    return Response(data)

@api_view(['GET'])
def visit_detail(request, id):
    visit = Visit.objects.select_related('centre').get(id=id)

    data = {
        "visit_date": visit.visit_date,
        "facility": visit.centre.name,
        "reason": visit.reason,

        "diagnosis": [
            d.disease.name for d in visit.diagnoses.all()
        ],

        "prescriptions": [
            {
                "item": p.item.name,
                "dosage": p.dosage,
                "frequency": p.frequency
            } for p in visit.prescriptions.all()
        ],

        "lab_tests": [
            {
                "test": o.test.name,
                "result": o.results.first().result if o.results.exists() else None
            } for o in visit.lab_orders.all()
        ],

        "procedures": [
            p.procedure.name for p in visit.procedures.all()
        ]
    }

    return Response(data)

@api_view(['POST'])
def book_appointment(request):
    visit = Visit.objects.create(
        citizen_id=request.data['citizen_id'],
        centre_id=request.data['facility_id'],
        visit_date=request.data['date'],
        reason=request.data.get('reason')
    )

    return Response({"visit_id": visit.id})

@api_view(['GET'])
def search_facilities(request):
    query = request.GET.get('q', '')
    type_ = request.GET.get('type')

    if type_ == 'medicine':
        facilities = HealthFacility.objects.filter(
            inventory__item__name__icontains=query
        )

    elif type_ == 'lab':
        facilities = HealthFacility.objects.filter(
            labtestprovided__test__name__icontains=query
        )

    elif type_ == 'procedure':
        facilities = HealthFacility.objects.filter(
            procedureprovided__procedure__name__icontains=query
        )

    else:
        return Response({"error": "Invalid type"}, status=400)

    data = [{"id": f.id, "name": f.name} for f in facilities.distinct()]

    return Response(data)

from django.db.models import Sum, F

@api_view(['GET'])
def available_facilities(request):
    state = request.GET.get('state')
    city = request.GET.get('city')

    facilities = HealthFacility.objects.filter(
        place__state=state,
        place__city=city
    ).annotate(
        total=Sum('ward__total'),
        occupied=Sum('ward__occupied')
    ).annotate(
        vacant=F('total') - F('occupied')
    ).filter(vacant__gt=0)

    data = [
        {
            "id": f.id,
            "name": f.name,
            "vacant_beds": f.vacant
        }
        for f in facilities
    ]

    return Response(data)

# ==========================================
# WRITE DATA (POST REQUESTS)
# ==========================================

from rest_framework.decorators import api_view
from rest_framework.response import Response
from facilities.models import HealthFacility
from clinical.models import LabTestProvided, ProcedureProvided
from inventory.models import Inventory

@api_view(['GET'])
def search_directory(request):
    search_type = request.GET.get('type', 'lab')
    query = request.GET.get('query', '').strip()

    try:
        facilities = HealthFacility.objects.all()

        # 🔬 LAB SEARCH
        if search_type == 'lab':
            facilities = facilities.filter(
                labtestprovided__test__name__icontains=query
            )

        # 💊 PHARMACY SEARCH
        elif search_type == 'pharmacy':
            facilities = facilities.filter(
                place__inventory__item__name__icontains=query,
                place__inventory__item__type='medicine'
            )

        # 🏥 PROCEDURE SEARCH
        elif search_type == 'procedure':
            facilities = facilities.filter(
                procedureprovided__procedure__name__icontains=query
            )

        facilities = facilities.distinct()

        # 🔥 SERIALIZE MANUALLY
        data = []
        for f in facilities:
            place = f.place

            data.append({
                "id": f.place_id,
                "name": f.name,
                "type": f.type,
                "address": f"{place.addr_l1}, {place.city}, {place.state}",
                "latitude": float(place.latitude),
                "longitude": float(place.longitude),
            })

        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
def book_appointment(request):
    data = request.data
    try:
        # 1. Verify the citizen
        citizen = Citizen.objects.get(aadhar_no=data['aadhar_no'])
        
        # 2. Create the future Visit record
        # We prepend "APPOINTMENT:" to the reason so doctors know it's scheduled
        visit = Visit.objects.create(
            citizen=citizen,
            centre_id=data['facility_id'],
            visit_date=data['appointment_date'],
            reason=f"APPOINTMENT: {data['reason']}"
        )
        
        return Response({"message": "Appointment booked successfully!", "visit_id": visit.id}, status=201)
        
    except Citizen.DoesNotExist:
        return Response({"error": "Citizen not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
def create_visit_with_diagnosis(request):
    data = request.data
    try:
        # 1. Find the citizen by Aadhar
        citizen = Citizen.objects.get(aadhar_no=data['aadhar_no'])
        
        # 2. Create the Visit record
        visit = Visit.objects.create(
            citizen=citizen,
            centre_id=data['facility_id'],
            visit_date=data['visit_date'],
            reason=data['reason']
        )
        
        # 3. If a disease was selected, create the Diagnosis record
        if data.get('disease_id'):
            Diagnosis.objects.create(
                visit=visit,
                disease_id=data['disease_id'],
                description=data.get('description', '')
            )
            
        return Response({"message": "Success!", "visit_id": visit.id}, status=201)
        
    except Citizen.DoesNotExist:
        return Response({"error": "Citizen not found. Check Aadhar number."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from facilities.models import HealthFacility

@api_view(['GET'])
def get_facilities(request):
    facilities = HealthFacility.objects.select_related('place').all()

    data = []
    for f in facilities:
        data.append({
            "id": f.place_id,
            "name": f.name,
            "type": f.type,
            "city": f.place.city
        })

    return Response(data)

# ==========================================
# READ DATA (GET REQUESTS)
# ==========================================

@api_view(['GET'])
def vaccination_history(request, citizen_id):
    data = Vaccination.objects.select_related('vaccine', 'centre') \
        .filter(citizen_id=citizen_id) \
        .order_by('-vaccination_date')

    result = []
    for v in data:
        result.append({
            "vaccine": v.vaccine.name,
            "date": v.vaccination_date,
            "dose": v.dose_no,
            "centre": v.centre.name
        })

    return Response(result)

class CitizenMedicalHistoryAPIView(generics.ListAPIView):
    serializer_class = MedicalHistorySerializer

    def get_queryset(self):
        aadhar = self.kwargs.get('aadhar_no')
        try:
            citizen = Citizen.objects.get(aadhar_no=aadhar)
        except Citizen.DoesNotExist:
            raise NotFound("Citizen with this Aadhar number not found.")

        return Visit.objects.filter(citizen=citizen)\
            .select_related('centre')\
            .prefetch_related('diagnoses__disease')\
            .order_by('-visit_date')

class VisitDetailAPIView(generics.RetrieveAPIView):
    """Retrieves complete details for one specific visit ID."""
    queryset = Visit.objects.all()
    serializer_class = VisitFullDetailSerializer
    lookup_field = 'id' 

    def get_queryset(self):
        return super().get_queryset().select_related(
            'centre'
        ).prefetch_related(
            'diagnoses__disease',
            'prescriptions__item',
            'lab_orders__test',
            'lab_orders__results',        # ✅ FIXED
            'admission_set__ward__facility'
        )
    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
from inventory.models import Item
from clinical.models import Vaccination, Citizen  # adjust import if needed

@api_view(['GET'])
def eligible_vaccines(request, citizen_id):
    try:
        citizen = Citizen.objects.get(pk=citizen_id)

        # 🔥 calculate age
        today = date.today()
        age = today.year - citizen.dob.year - (
            (today.month, today.day) < (citizen.dob.month, citizen.dob.day)
        )

        # 🔥 vaccines already taken
        taken_vaccine_ids = Vaccination.objects.filter(
            citizen_id=citizen_id
        ).values_list('vaccine_id', flat=True)

        # 🔥 eligible vaccines
        vaccines = Item.objects.filter(
            type='vaccine',
            vaccprereqage__age_limit__lte=age
        ).exclude(
            id__in=taken_vaccine_ids
        ).distinct()

        data = [
            {
                "id": v.id,
                "name": v.name
            }
            for v in vaccines
        ]

        return Response(data)

    except Citizen.DoesNotExist:
        return Response({"error": "Citizen not found"}, status=404)

# ==========================================
# ANALYTICS & DASHBOARD (GET REQUESTS)
# ==========================================

class DiseaseGeographicStatsAPIView(generics.ListAPIView):
    """API for Query #13: Cases of a disease by region."""
    serializer_class = DiseaseCaseSerializer

    def get_queryset(self):
        disease_id = self.kwargs['disease_id']
        return Diagnosis.objects.filter(disease_id=disease_id) \
            .values(state=F('visit__citizen__state'), city=F('visit__citizen__city')) \
            .annotate(case_count=Count('id')) \
            .order_by('-case_count')

class DiseaseMonthlyTrendAPIView(generics.ListAPIView):
    """API for Query #15: Monthly average of a disease."""
    serializer_class = MonthlyTrendSerializer

    def get_queryset(self):
        disease_id = self.kwargs['disease_id']
        return Diagnosis.objects.filter(disease_id=disease_id) \
            .annotate(month=ExtractMonth('visit__visit_date')) \
            .values('month') \
            .annotate(avg_daily_cases=Count('id', distinct=True) / Count('visit__visit_date', distinct=True)) \
            .order_by('month')