from django.contrib.auth.models import AbstractUser
from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Extending Django's built-in user to include your platform roles.
    """
    class Meta:
        db_table = 'users'
    ROLE_CHOICES = (
        ('CITIZEN', 'Citizen'),
        ('WORKER', 'Healthcare Worker'),
        ('SUPPLIER', 'Supplier'),
        ('ADMIN', 'Department Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
class HealthcareWorker(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        db_column='id'   # 🔥 CRITICAL
    )

    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50)

    class Meta:
        db_table = 'healthcareworker'
        managed = False

    def __str__(self):
        return f"{self.name} ({self.role})"

class Skill(models.Model):
    id = models.BigAutoField(primary_key=True)

    worker = models.ForeignKey(
        HealthcareWorker,
        on_delete=models.CASCADE,
        db_column='worker_id',
        related_name='skills'
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=30)

    class Meta:
        db_table = 'skills'
        managed = False

class Works(models.Model):
    worker = models.ForeignKey(
        HealthcareWorker,
        on_delete=models.CASCADE,
        db_column='worker_id',
        related_name='work_assignments'
    )

    fac = models.ForeignKey(
        'facilities.HealthFacility',
        on_delete=models.CASCADE,
        db_column='fac_id'
    )

    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'works'
        managed = False
    