# backend/clinical/views.py

# --- Django & DRF Imports ---
from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, F
from django.db.models.functions import ExtractMonth

# --- Local App Imports ---
from .models import Visit, Citizen, Diagnosis, Disease
from .serializers import (
    MedicalHistorySerializer, 
    VisitFullDetailSerializer,
    DiseaseCaseSerializer, 
    MonthlyTrendSerializer
)

# ==========================================
# WRITE DATA (POST REQUESTS)
# ==========================================

@api_view(['GET'])
def search_directory(request):
    search_type = request.GET.get('type', 'lab') # 'lab', 'pharmacy', or 'procedure'
    query = request.GET.get('query', '').strip()

    try:
        # --- THE REAL ORM LOGIC ---
        # If your models are named perfectly, this is how you filter them:
        #
        # if search_type == 'lab':
        #     facilities = HealthFacility.objects.filter(tests_offered__name__icontains=query)
        # elif search_type == 'pharmacy':
        #     facilities = HealthFacility.objects.filter(inventory__medicine__name__icontains=query)
        # elif search_type == 'procedure':
        #     facilities = HealthFacility.objects.filter(procedures_offered__name__icontains=query)
        # 
        # data = [{"id": f.id, "name": f.name, "type": f.type, "address": f.address} for f in facilities]
        # return Response(data)

        # --- FALLBACK MOCK DATA FOR UI TESTING ---
        # Until the exact model relations are un-commented above, we will return this so React works instantly:
        mock_results = [
            {"id": 1, "name": "Central General Hospital", "type": "Hospital", "address": "123 Main St, Region A", "contact": "011-23456789", "distance": "2.4 km"},
            {"id": 2, "name": "City Care Clinic", "type": "Clinic", "address": "45 South Extension, Region B", "contact": "011-98765432", "distance": "5.1 km"},
            {"id": 142, "name": "National Research Lab", "type": "Laboratory", "address": "Knowledge Park, Region C", "contact": "011-11122233", "distance": "8.0 km"}
        ]
        
        # Simulate a search filter
        if query:
            if search_type == 'lab':
                mock_results = [mock_results[2]] # Only return the lab
            elif search_type == 'pharmacy':
                mock_results = [mock_results[0], mock_results[1]] # Return hospitals/clinics
                
        return Response(mock_results)

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


# ==========================================
# READ DATA (GET REQUESTS)
# ==========================================

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
            'lab_orders__result_data',
            'admission_set__ward__facility'
        )

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