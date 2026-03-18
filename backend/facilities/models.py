from django.db import models
from django.core.exceptions import ValidationError

class Place(models.Model):
    id = models.BigAutoField(primary_key=True)
    addr_l1 = models.TextField()
    addr_l2 = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'place'
        managed = False   

class HealthFacility(models.Model):
    place = models.OneToOneField(
        Place,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'   # 🔥 THIS FIXES YOUR ERROR
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=30)

    class Meta:
        db_table = 'health_facility'
        managed = False

class HealthFacContact(models.Model):
    id = models.BigAutoField(primary_key=True)

    healthfac = models.ForeignKey(
        'HealthFacility',
        on_delete=models.CASCADE,
        db_column='healthfac_id'
    )

    email = models.EmailField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'healthfac_contact'
        managed = False

    def __str__(self):
        return f"Contact for {self.healthfac.place_id}"

class Warehouse(models.Model):
    place = models.OneToOneField(
        Place,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'
    )

    class Meta:
        db_table = 'warehouse'
        managed = False

class WarehouseContact(models.Model):
    id = models.BigAutoField(primary_key=True)

    warehouse = models.ForeignKey(
        'Warehouse',
        on_delete=models.CASCADE,
        db_column='wh_id'
    )

    email = models.EmailField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'warehouse_contact'
        managed = False

    def __str__(self):
        return f"Warehouse Contact {self.id}"

class Ward(models.Model):
    id = models.BigAutoField(primary_key=True)

    facility = models.ForeignKey(
        'HealthFacility',
        on_delete=models.CASCADE,
        db_column='facility_id'
    )

    type = models.CharField(max_length=30, default='General')
    occupied = models.IntegerField(default=0)
    total = models.IntegerField(default=10)

    class Meta:
        db_table = 'wards'
        managed = False

    def __str__(self):
        return f"{self.type} ward at facility {self.facility_id}"

    @property
    def vacant_beds(self):
        return self.total - self.occupied