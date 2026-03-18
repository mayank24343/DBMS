from rest_framework import generics
from rest_framework.exceptions import NotFound
from .models import Visit, Citizen
from .serializers import MedicalHistorySerializer

class CitizenMedicalHistoryAPIView(generics.ListAPIView):
    serializer_class = MedicalHistorySerializer

    def get_queryset(self):
        # 1. Get the Aadhar number from the URL
        aadhar = self.kwargs.get('aadhar_no')
        
        try:
            # 2. Find the citizen
            citizen = Citizen.objects.get(aadhar_no=aadhar)
        except Citizen.DoesNotExist:
            raise NotFound("Citizen with this Aadhar number not found.")

        # 3. Fetch the visits, heavily optimized with joins just like your SQL!
        return Visit.objects.filter(citizen=citizen)\
            .select_related('centre')\
            .prefetch_related('diagnoses__disease')\
            .order_by('-visit_date')

from .serializers import VisitFullDetailSerializer

class VisitDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieves complete details for one specific visit ID.
    """
    queryset = Visit.objects.all()
    serializer_class = VisitFullDetailSerializer
    lookup_field = 'id' # This matches the 'v.id = 52' part of your Query 2

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
    
# backend/clinical/views.py
from django.db.models import Count, Avg, F
from django.db.models.functions import ExtractMonth
from .models import Diagnosis, Disease
from .serializers import DiseaseCaseSerializer, MonthlyTrendSerializer

class DiseaseGeographicStatsAPIView(generics.ListAPIView):
    """API for Query #13: Cases of a disease by region."""
    serializer_class = DiseaseCaseSerializer

    def get_queryset(self):
        disease_id = self.kwargs['disease_id']
        # Joins Diagnosis -> Visit -> Citizen and groups by location
        return Diagnosis.objects.filter(disease_id=disease_id) \
            .values(state=F('visit__citizen__state'), city=F('visit__citizen__city')) \
            .annotate(case_count=Count('id')) \
            .order_by('-case_count')

class DiseaseMonthlyTrendAPIView(generics.ListAPIView):
    """API for Query #15: Monthly average of a disease."""
    serializer_class = MonthlyTrendSerializer

    def get_queryset(self):
        disease_id = self.kwargs['disease_id']
        # Extracts month from visit_date and calculates average
        return Diagnosis.objects.filter(disease_id=disease_id) \
            .annotate(month=ExtractMonth('visit__visit_date')) \
            .values('month') \
            .annotate(avg_daily_cases=Count('id', distinct=True) / Count('visit__visit_date', distinct=True)) \
            .order_by('month')