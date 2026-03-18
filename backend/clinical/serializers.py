from rest_framework import serializers
from .models import Admission, LabResult, Prescription, Visit, Diagnosis

class DiagnosisSerializer(serializers.ModelSerializer):
    disease_name = serializers.CharField(source='disease.name', read_only=True)

    class Meta:
        model = Diagnosis
        fields = ['disease_name', 'description']

class MedicalHistorySerializer(serializers.ModelSerializer):
    # This reaches across the foreign key to grab the hospital's name
    facility_name = serializers.CharField(source='centre.name', read_only=True)
    # This grabs all diagnoses linked to this visit
    diagnoses = DiagnosisSerializer(many=True, read_only=True)

    class Meta:
        model = Visit
        fields = ['id', 'visit_date', 'facility_name', 'reason', 'diagnoses']

# backend/clinical/serializers.py

class PrescriptionDetailSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    
    class Meta:
        model = Prescription
        fields = ['item_name', 'item_type', 'dosage', 'frequency', 'start_date', 'end_date', 'instruction']

class LabResultDetailSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(source='order.test.name', read_only=True)
    order_date = serializers.DateField(source='order.order_date', read_only=True)
    
    class Meta:
        model = LabResult
        fields = ['test_name', 'order_date', 'result_date', 'result']

class AdmissionDetailSerializer(serializers.ModelSerializer):
    ward_type = serializers.CharField(source='ward.type', read_only=True)
    facility_name = serializers.CharField(source='ward.facility.name', read_only=True)

    class Meta:
        model = Admission
        fields = ['facility_name', 'ward_type', 'admission_date', 'discharge_date']

class VisitFullDetailSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(source='centre.name', read_only=True)
    diagnoses = DiagnosisSerializer(many=True, read_only=True)
    prescriptions = PrescriptionDetailSerializer(many=True, read_only=True)
    # We use a trick here: reach through the 'result_data' OneToOne link
    lab_results = serializers.SerializerMethodField()
    admission = AdmissionDetailSerializer(source='admission_set.first', read_only=True)

    class Meta:
        model = Visit
        fields = ['id', 'visit_date', 'facility_name', 'reason', 'diagnoses', 'prescriptions', 'lab_results', 'admission']

    def get_lab_results(self, obj):
        # Fetch all lab orders for this visit that actually have a result
        results = LabResult.objects.filter(order__visit=obj)
        return LabResultDetailSerializer(results, many=True).data

# backend/clinical/serializers.py
from django.db.models import Count

class DiseaseCaseSerializer(serializers.Serializer):
    """
    Used for Query #13: Aggregating cases by geography.
    """
    state = serializers.CharField()
    city = serializers.CharField()
    case_count = serializers.IntegerField()

class MonthlyTrendSerializer(serializers.Serializer):
    """
    Used for Query #15: Tracking disease spread over time.
    """
    month = serializers.IntegerField()
    avg_daily_cases = serializers.FloatField()