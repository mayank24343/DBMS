from django.db import models
from django.core.exceptions import ValidationError

class Place(models.Model):
    """Base model for all physical locations."""
    addr_l1 = models.TextField()
    addr_l2 = models.TextField(blank=True, null=True)  # blank=True allows empty forms
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=6)
    
    # If you use GeoDjango later, these become a single PointField!
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'place'

    def __str__(self):
        return f"{self.addr_l1}, {self.city}"

class HealthFacility(Place):
    """
    Inherits from Place. Django automatically creates a OneToOneField 
    back to Place, acting exactly like your SQL schema!
    """
    FACILITY_TYPES = (
        ('Hospital', 'Hospital'),
        ('Clinic', 'Clinic'),
        ('Pharmacy', 'Pharmacy'),
        ('Laboratory', 'Laboratory'),
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=30, choices=FACILITY_TYPES)

    class Meta:
        db_table = 'health_facility'

    def __str__(self):
        return f"{self.name} ({self.type})"

class HealthFacContact(models.Model):
    """
    The related_name='contacts' allows us to query `facility.contacts.all()`
    """
    healthfac = models.ForeignKey(HealthFacility, on_delete=models.CASCADE, related_name='contacts')
    email = models.EmailField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'healthfac_contact'

    def clean(self):
        # This replaces your SQL CHECK constraint for contact details
        if not self.email and not self.phone:
            raise ValidationError("Either email or phone must be provided.")

    def __str__(self):
        contact_method = self.phone if self.phone else self.email
        return f"Contact for {self.healthfac.name} - {contact_method}"

class Warehouse(Place):
    """
    Inherits from Place. Even though there are no extra fields, keeping it as 
    a separate model makes linking inventory explicitly to a warehouse much safer.
    """

    class Meta:
        db_table = 'warehouse'

    def __str__(self):
        return f"Warehouse - {self.city}, {self.state}"

class WarehouseContact(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='contacts')
    email = models.EmailField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'warehouse_contact'

    def clean(self):
        if not self.email and not self.phone:
            raise ValidationError("Either email or phone must be provided.")

class Ward(models.Model):
    facility = models.ForeignKey(HealthFacility, on_delete=models.CASCADE, related_name='wards')
    type = models.CharField(max_length=30, default='General')
    occupied = models.IntegerField(default=0)
    total = models.IntegerField(default=10)

    class Meta:
        db_table = 'wards'

    def __str__(self):
        return f"{self.type} Ward at {self.facility.name}"
        
    @property
    def vacant_beds(self):
        # A helpful property to calculate this on the fly for your React UI
        return self.total - self.occupied