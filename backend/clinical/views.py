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
    queryset = Visit.objects.all()
    serializer_class = VisitFullDetailSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return super().get_queryset().select_related(
            'centre',
            'citizen'
        ).prefetch_related(
            'diagnoses__disease',
            'prescriptions__item',
            'lab_orders__test',
            'lab_orders__results',        # ✅ FIXED
            'admission_set__ward__facility'  # ⚠️ works, see note below
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
