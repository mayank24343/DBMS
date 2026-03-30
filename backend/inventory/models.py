# backend/inventory/models.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

# ------------------------------------------------------------------------
# CATALOG & SUPPLIERS
# ------------------------------------------------------------------------

class Item(models.Model):
    id = models.BigAutoField(primary_key=True)

    ITEM_TYPES = (
        ('medicine', 'Medicine'),
        ('vaccine', 'Vaccine'),
        ('equipment', 'Equipment'),
        ('other', 'Other'),
    )

    type = models.CharField(max_length=30, choices=ITEM_TYPES)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'item'
        managed = False

class Supplier(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'
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

class SupplierContact(models.Model):
    id = models.BigAutoField(primary_key=True)

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        db_column='supplier_id',
        related_name='contacts'
    )

    email = models.EmailField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'supplier_contact'
        managed = False

class Listing(models.Model):
    id = models.BigAutoField(primary_key=True)

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        db_column='supplier_id',
        related_name='listings'
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='item_id',
        related_name='listings'
    )

    quantity = models.BigIntegerField()
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'listing'
        managed = False

# ------------------------------------------------------------------------
# INVENTORY & SUPPLY CHAIN
# ------------------------------------------------------------------------

class Inventory(models.Model):
    id = models.BigAutoField(primary_key=True)

    place = models.ForeignKey(
        'facilities.Place',
        on_delete=models.CASCADE,
        db_column='place_id',
        related_name='inventory'
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='item_id'
    )

    quantity = models.IntegerField()
    expiry = models.DateField()
    threshold = models.IntegerField(default=0)

    class Meta:
        db_table = 'inventory'
        managed = False

class SupplierOrder(models.Model):
    id = models.BigAutoField(primary_key=True)

    STATUS_CHOICES = (
        ('Order Placed', 'Order Placed'),
        ('Received', 'Received'),
        ('Cancelled', 'Cancelled'),
    )

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        db_column='supplier_id',
        related_name='orders'
    )

    destination = models.ForeignKey(
        'facilities.Place',
        on_delete=models.CASCADE,
        db_column='destination_id',
        related_name='incoming_orders'
    )

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='item_id'
    )

    quantity = models.BigIntegerField()
    order_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    class Meta:
        db_table = 'supplier_order'
        managed = False

class InventoryTransfer(models.Model):
    id = models.BigAutoField(primary_key=True)

    from_warehouse = models.ForeignKey(
        'facilities.Warehouse',
        on_delete=models.CASCADE,
        db_column='from_id',
        related_name='outbound_transfers'
    )

    to_facility = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='to_id',
        related_name='inbound_transfers'
    )

    date = models.DateField()

    class Meta:
        db_table = 'inventory_transfer'
        managed = False

class ItemUse(models.Model):
    id = models.BigAutoField(primary_key=True)

    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        db_column='item_id'
    )

    facility = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='fac_id'
    )

    use_date = models.DateField()

    class Meta:
        db_table = 'item_use'
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