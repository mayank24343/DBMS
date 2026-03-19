from django.urls import path
from .views import get_ward_availability

urlpatterns = [
    path('wards/<int:fac_id>/', get_ward_availability, name='ward-availability'),
]