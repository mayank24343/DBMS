from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from accounts.models import Citizen
from inventory.models import Item

# ------------------------------------------------------------------------
# MEDICAL REFERENCE TABLES (Diseases, Procedures, Tests)
# ------------------------------------------------------------------------

class Disease(models.Model):
    id = models.BigAutoField(primary_key=True)

    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'disease'
        managed = False

class MedicalProcedure(models.Model):
    procedure_id = models.BigAutoField(primary_key=True)

    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    is_invasive = models.BooleanField()

    class Meta:
        db_table = 'medical_procedure'
        managed = False

class LabTest(models.Model):
    id = models.BigAutoField(primary_key=True)

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'lab_test'
        managed = False

# ------------------------------------------------------------------------
# THE PATIENT JOURNEY (Visits, Diagnoses, Admissions, etc.)
# ------------------------------------------------------------------------

class Visit(models.Model):
    id = models.BigAutoField(primary_key=True)

    citizen = models.ForeignKey(
        Citizen,
        on_delete=models.CASCADE,
        db_column='citizen_id',
        related_name='visits'
    )

    centre = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='centre_id',
        related_name='facility_visits'
    )

    visit_date = models.DateField()
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'visit'
        managed = False

class Diagnosis(models.Model):
    id = models.BigAutoField(primary_key=True)

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        db_column='visit_id',
        related_name='diagnoses'
    )

    disease = models.ForeignKey(
        Disease,
        on_delete=models.SET_NULL,
        null=True,
        db_column='disease_id'
    )

    description = models.TextField()

    class Meta:
        db_table = 'diagnosis'
        managed = False

class ProcedureTaken(models.Model):
    id = models.BigAutoField(primary_key=True)

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        db_column='visit_id',
        related_name='procedures'
    )

    procedure = models.ForeignKey(
        MedicalProcedure,
        on_delete=models.CASCADE,
        db_column='procedure_id'
    )

    class Meta:
        db_table = 'procedure_taken'
        managed = False

class LabOrder(models.Model):
    id = models.BigAutoField(primary_key=True)

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        db_column='visit_id',
        related_name='lab_orders'
    )

    test = models.ForeignKey(
        LabTest,
        on_delete=models.CASCADE,
        db_column='test_id'
    )

    lab = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='lab_id'
    )

    order_date = models.DateField()

    class Meta:
        db_table = 'lab_order'
        managed = False

class LabResult(models.Model):
    id = models.BigAutoField(primary_key=True)

    order = models.ForeignKey(
        LabOrder,
        on_delete=models.CASCADE,
        db_column='order_id',
        related_name='results'
    )

    result_date = models.DateField(blank=True, null=True)
    result = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'lab_result'
        managed = False

class Admission(models.Model):
    id = models.BigAutoField(primary_key=True)

    citizen = models.ForeignKey(
        Citizen,
        on_delete=models.CASCADE,
        db_column='citizen_id'
    )

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        db_column='visit_id'
    )

    ward = models.ForeignKey(
        'facilities.Ward',
        on_delete=models.CASCADE,
        db_column='ward_id'
    )

    admission_date = models.DateField()
    discharge_date = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'admission'
        managed = False

class Transfer(models.Model):
    id = models.BigAutoField(primary_key=True)

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        db_column='visit_id'
    )

    citizen = models.ForeignKey(
        Citizen,
        on_delete=models.CASCADE,
        db_column='citizen_id'
    )

    from_fac = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='from_fac',
        related_name='transfers_out'
    )

    to_fac = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='to_fac',
        related_name='transfers_in'
    )

    date_of_transfer = models.DateField()
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'transfers'
        managed = False

class Prescription(models.Model):
    id = models.BigAutoField(primary_key=True)

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        db_column='visit_id',
        related_name='prescriptions'
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='item_id'
    )

    item_type = models.CharField(max_length=10)

    dosage = models.CharField(max_length=50, blank=True, null=True)
    frequency = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    instruction = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'prescription'
        managed = False

class Vaccination(models.Model):
    id = models.BigAutoField(primary_key=True)

    citizen = models.ForeignKey(
        Citizen,
        on_delete=models.CASCADE,
        db_column='citizen_id'
    )

    vaccine = models.ForeignKey(
        'inventory.Item',
        on_delete=models.CASCADE,
        db_column='vaccine_id'
    )

    vaccination_date = models.DateField()
    dose_no = models.IntegerField()

    centre = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='centre_id'
    )

    class Meta:
        db_table = 'vaccination'
        managed = False

class DoctorVisit(models.Model):
    id = models.BigAutoField(primary_key=True)

    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        db_column='visit_id'
    )

    doctor = models.ForeignKey(
        'accounts.HealthcareWorker',
        on_delete=models.CASCADE,
        db_column='doctor_id'
    )

    role = models.CharField(max_length=50)

    class Meta:
        db_table = 'doctor_visit'
        managed = False

class LabTestProvided(models.Model):
    id = models.BigAutoField(primary_key=True)

    test = models.ForeignKey(
        LabTest,
        on_delete=models.CASCADE,
        db_column='test_id'
    )

    fac = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='fac_id'
    )

    class Meta:
        db_table = 'lab_test_provided'
        managed = False

class ProcedureProvided(models.Model):
    id = models.BigAutoField(primary_key=True)

    procedure = models.ForeignKey(
        MedicalProcedure,
        on_delete=models.CASCADE,
        db_column='procedure_id'
    )

    fac = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='fac_id'
    )

    class Meta:
        db_table = 'procedure_provided'
        managed = False

    # ------------------------------------------------------------------------
# VACCINE RULES
# ------------------------------------------------------------------------

class VaccPrereqAge(models.Model):
    id = models.BigAutoField(primary_key=True)

    vaccine = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='vaccine_id',
        related_name='vaccprereqage'
    )

    age_limit = models.IntegerField(default=0)

    class Meta:
        db_table = 'vacc_prereq_age'
        managed = False

class VaccPrereqDose(models.Model):
    id = models.BigAutoField(primary_key=True)

    vaccine = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='vaccine_id',
        related_name='dose_rules'
    )

    prereq = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='prereq_id',
        related_name='prereq_for'
    )

    number_of_times = models.IntegerField(default=1)

    class Meta:
        db_table = 'vacc_prereq_dose'
        managed = False