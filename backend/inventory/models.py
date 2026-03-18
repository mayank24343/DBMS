# backend/inventory/models.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

# ------------------------------------------------------------------------
# CATALOG & SUPPLIERS
# ------------------------------------------------------------------------

class Item(models.Model):
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

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class Supplier(models.Model):
    # Links directly to the custom User model
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    name = models.CharField(max_length=100)
    
    # Address Fields
    addr_l1 = models.TextField()
    addr_l2 = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        db_table = 'supplier'

    def __str__(self):
        return self.name

class SupplierContact(models.Model):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='contacts')
    email = models.EmailField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'supplier_contact'

    def clean(self):
        if not self.email and not self.phone:
            raise ValidationError("Either email or phone must be provided.")

class Listing(models.Model):
    """What items a supplier sells and at what price."""
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='listings')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='listings')
    quantity = models.BigIntegerField()
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'listing'

# ------------------------------------------------------------------------
# INVENTORY & SUPPLY CHAIN
# ------------------------------------------------------------------------

class Inventory(models.Model):
    place = models.ForeignKey('facilities.Place', on_delete=models.CASCADE, related_name='inventory')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    expiry = models.DateField()
    threshold = models.IntegerField(default=0)

    class Meta:
        db_table = 'inventory'

class SupplierOrder(models.Model):
    STATUS_CHOICES = (
        ('Order Placed', 'Order Placed'),
        ('Received', 'Received'),
        ('Cancelled', 'Cancelled'),
    )
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='orders')
    destination = models.ForeignKey('facilities.Place', on_delete=models.CASCADE, related_name='incoming_orders')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.BigIntegerField()
    order_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Order Placed')

    class Meta:
        db_table = 'supplier_order'

class InventoryTransfer(models.Model):
    from_warehouse = models.ForeignKey('facilities.Warehouse', on_delete=models.CASCADE, related_name='outbound_transfers')
    to_facility = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE, related_name='inbound_transfers')
    date = models.DateField()

    class Meta:
        db_table = 'inventory_transfer'

class ItemUse(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    facility = models.ForeignKey('facilities.HealthFacility', on_delete=models.CASCADE)
    use_date = models.DateField()

    class Meta:
        db_table = 'item_use'

# ------------------------------------------------------------------------
# VACCINE RULES
# ------------------------------------------------------------------------

class VaccPrereqAge(models.Model):
    vaccine = models.ForeignKey(Item, on_delete=models.CASCADE, limit_choices_to={'type': 'vaccine'})
    age_limit = models.IntegerField(default=0)

    class Meta:
        db_table = 'vacc_prereq_age'

class VaccPrereqDose(models.Model):
    vaccine = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='dose_rules', limit_choices_to={'type': 'vaccine'})
    prereq = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='prereq_for', limit_choices_to={'type': 'vaccine'})
    number_of_times = models.IntegerField(default=1)

    class Meta:
        db_table = 'vacc_prereq_dose'