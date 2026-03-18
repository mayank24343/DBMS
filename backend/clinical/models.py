from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Citizen(models.Model):
    """
    Links to your custom User model. Contains all demographic and location data.
    """
    SEX_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    # OneToOne links this exactly to the User table
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    aadhar_no = models.CharField(max_length=12, unique=True)
    dob = models.DateField()
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    
    # Address Fields
    addr_l1 = models.TextField()
    addr_l2 = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'citizen'

    def __str__(self):
        return f"{self.user.username} ({self.aadhar_no})"

class CitizenContact(models.Model):
    citizen = models.ForeignKey(Citizen, on_delete=models.CASCADE, related_name='contacts')
    email = models.EmailField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'citizen_contact'

    def clean(self):
        if not self.email and not self.phone:
            raise ValidationError("Either email or phone must be provided.")

# ------------------------------------------------------------------------
# MEDICAL REFERENCE TABLES (Diseases, Procedures, Tests)
# ------------------------------------------------------------------------

class Disease(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'disease'

    def __str__(self):
        return self.name

class MedicalProcedure(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    is_invasive = models.BooleanField(default=True)

    class Meta:
        db_table = 'medical_procedure'

    def __str__(self):
        return self.name

class LabTest(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'lab_test'

    def __str__(self):
        return self.name

# ------------------------------------------------------------------------
# THE PATIENT JOURNEY (Visits, Diagnoses, Admissions, etc.)
# ------------------------------------------------------------------------

class Visit(models.Model):
    """The central hub for a patient's interaction with a facility."""
    citizen = models.ForeignKey(Citizen, on_delete=models.CASCADE, related_name='visits')
    # Using a string reference to avoid importing from the facilities app directly
    centre = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE, related_name='facility_visits')
    visit_date = models.DateField()
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'visit'

    def __str__(self):
        return f"Visit: {self.citizen.user.username} at {self.centre.name} on {self.visit_date}"

class Diagnosis(models.Model):
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='diagnoses')
    disease = models.ForeignKey(Disease, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'diagnosis'

class ProcedureTaken(models.Model):
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='procedures')
    procedure = models.ForeignKey(MedicalProcedure, on_delete=models.CASCADE)

    class Meta:
        db_table = 'procedure_taken'

class LabOrder(models.Model):
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='lab_orders')
    test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    lab = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE, related_name='lab_orders_received')
    order_date = models.DateField()

    class Meta:
        db_table = 'lab_order'

class LabResult(models.Model):
    # OneToOne because usually one order yields one finalized result record
    order = models.OneToOneField(LabOrder, on_delete=models.CASCADE, related_name='result_data')
    result_date = models.DateField(blank=True, null=True)
    result = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'lab_result'

class Admission(models.Model):
    citizen = models.ForeignKey(Citizen, on_delete=models.CASCADE, related_name='admissions')
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE)
    ward = models.ForeignKey('facilities.Ward', on_delete=models.CASCADE, related_name='admissions')
    admission_date = models.DateField()
    discharge_date = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'admission'

class Transfer(models.Model):
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='transfers')
    citizen = models.ForeignKey(Citizen, on_delete=models.CASCADE)
    from_fac = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE, related_name='transfers_out')
    to_fac = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE, related_name='transfers_in')
    date_of_transfer = models.DateField()
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'transfers'

class Prescription(models.Model):
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE, related_name='prescriptions')
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)
    
    # We replicate your constraint natively with choices
    ITEM_TYPES = (('medicine', 'Medicine'), ('vaccine', 'Vaccine'))
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES)
    
    dosage = models.CharField(max_length=50, blank=True, null=True)
    frequency = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    instruction = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'prescription'

class Vaccination(models.Model):
    citizen = models.ForeignKey(Citizen, on_delete=models.CASCADE, related_name='vaccinations')
    vaccine = models.ForeignKey('inventory.Item', on_delete=models.CASCADE, limit_choices_to={'type': 'vaccine'})
    vaccination_date = models.DateField()
    dose_no = models.IntegerField()
    centre = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE)

    class Meta:
        db_table = 'vaccination'

class DoctorVisit(models.Model):
    visit = models.ForeignKey(Visit, on_delete=models.CASCADE)
    doctor = models.ForeignKey('accounts.HealthcareWorker', on_delete=models.CASCADE)
    role = models.CharField(max_length=50)

    class Meta:
        db_table = 'doctor_visit'
        # This perfectly replicates your SQL: PRIMARY KEY (visit_id, doctor_id)
        unique_together = (('visit', 'doctor'),) 

class LabTestProvided(models.Model):
    test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    fac = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE)

    class Meta:
        db_table = 'lab_test_provided'
        unique_together = (('test', 'fac'),)

class ProcedureProvided(models.Model):
    procedure = models.ForeignKey(MedicalProcedure, on_delete=models.CASCADE)
    fac = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE)

    class Meta:
        db_table = 'procedure_provided'
        unique_together = (('procedure', 'fac'),)