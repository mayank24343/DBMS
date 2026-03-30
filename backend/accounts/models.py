from django.db import models

# ================= USERS =================
class User(models.Model):
    id = models.BigAutoField(primary_key=True)
    password = models.CharField(max_length=50)
    role = models.CharField(max_length=20)

    class Meta:
        db_table = 'users'
        managed = False


# ================= PLACE =================
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


# ================= CITIZEN =================
class Citizen(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        db_column='citizen_id',
        primary_key=True
    )

    aadhar_no = models.CharField(max_length=12)
    name = models.CharField(max_length=100)
    dob = models.DateField()
    sex = models.CharField(max_length=1)

    addr_l1 = models.TextField()
    addr_l2 = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'citizen'
        managed = False


# ================= CITIZEN CONTACT =================
class CitizenContact(models.Model):
    id = models.BigAutoField(primary_key=True)

    citizen = models.ForeignKey(
        Citizen,
        on_delete=models.CASCADE,
        db_column='citizen_id'
    )

    email = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'citizen_contact'
        managed = False


# ================= HEALTH FACILITY =================
class HealthFacility(models.Model):
    place = models.OneToOneField(
        Place,
        on_delete=models.CASCADE,
        db_column='id',
        primary_key=True
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=30)

    class Meta:
        db_table = 'health_facility'
        managed = False


# ================= HEALTH FACILITY CONTACT =================
class HealthFacilityContact(models.Model):
    id = models.BigAutoField(primary_key=True)

    healthfac = models.ForeignKey(
        HealthFacility,
        on_delete=models.CASCADE,
        db_column='healthfac_id'
    )

    email = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'healthfac_contact'
        managed = False


# ================= SUPPLIER =================
class Supplier(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        db_column='id',
        primary_key=True
    )

    name = models.CharField(max_length=100)

    addr_l1 = models.TextField()
    addr_l2 = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'supplier'
        managed = False


# ================= SUPPLIER CONTACT =================
class SupplierContact(models.Model):
    id = models.BigAutoField(primary_key=True)

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        db_column='supplier_id'
    )

    email = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'supplier_contact'
        managed = False


# ================= HEALTHCARE WORKER =================
class HealthcareWorker(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        db_column='id',
        primary_key=True
    )

    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50)

    class Meta:
        db_table = 'healthcareworker'
        managed = False


# ================= WORKS =================
class Works(models.Model):
    id = models.BigAutoField(primary_key=True)

    worker = models.ForeignKey(
        'HealthcareWorker',
        on_delete=models.CASCADE,
        db_column='worker_id'
    )

    facility = models.ForeignKey(
        'HealthFacility',
        on_delete=models.CASCADE,
        db_column='fac_id'
    )

    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'works'
        managed = False

class Warehouse(models.Model):
    place = models.OneToOneField(
        Place,
        on_delete=models.CASCADE,
        db_column='id',
        primary_key=True
    )

    class Meta:
        db_table = 'warehouse'
        managed = False

    def __str__(self):
        return f"Warehouse {self.place_id}"
    
class WarehouseContact(models.Model):
    id = models.BigAutoField(primary_key=True)

    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        db_column='wh_id'
    )

    email = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'warehouse_contact'
        managed = False