from django.urls import path
from .views import (
    # basic
    get_facility,
    facility_contacts,
    get_citizen,

    # wards / occupancy
    get_ward_availability,
    facility_occupancy,

    # appointments
    today_appointments,

    # inventory
    facility_inventory,
    near_expiry,
    log_usage,

    # admissions & transfers
    admit_patient,
    discharge_patient,
    transfer_patient,

    # analytics
    inventory_usage_stats,
    facility_disease_stats,
    appointment_stats,

    # lab
    pending_lab_tests,
    all_lab_tests,
    submit_lab_result,

    # patients + inventory
    admitted_patients,
    low_inventory,
    # disease analytics
    disease_geo,
    disease_daily,
    disease_monthly_avg
)

urlpatterns = [

    # ================= BASIC =================
    path('facility/<int:id>/', get_facility, name='facility-detail'),
    path('facility/<int:id>/contacts/', facility_contacts, name='facility-contacts'),

    # ================= WARDS / OCCUPANCY =================
    path('wards/<int:fac_id>/', get_ward_availability, name='ward-availability'),
    path('facility/<int:fac_id>/occupancy/', facility_occupancy, name='facility-occupancy'),

    path('facility/get-patient/<int:patient_id>', get_citizen, name='get-patient'),
    

    # ================= APPOINTMENTS =================
    path('facility/<int:fac_id>/appointments/today/', today_appointments, name='today-appointments'),

    # ================= INVENTORY =================
    path('facility/<int:fac_id>/inventory/', facility_inventory, name='facility-inventory'),
    path('facility/<int:fac_id>/expiry/', near_expiry, name='facility-expiry'),
    path('facility/usage/', log_usage, name='facility-usage'),

    # ================= ADMISSION / TRANSFER =================
    path('admission/', admit_patient, name='admit-patient'),
    path('discharge/', discharge_patient, name='discharge-patient'),
    path('transfer/', transfer_patient, name='transfer-patient'),

    # ================= ANALYTICS =================
    path('facility/<int:fac_id>/inventory/stats/', inventory_usage_stats, name='inventory-stats'),
    path('facility/<int:fac_id>/disease/stats/', facility_disease_stats, name='disease-stats'),
    path('facility/<int:fac_id>/appointments/stats/', appointment_stats, name='appointment-stats'),

    # ================= LAB =================
    path('lab/<int:lab_id>/pending/', pending_lab_tests, name='lab-pending'),
    path('lab/<int:lab_id>/all/', all_lab_tests, name='lab-all'),
    path('lab/result/', submit_lab_result, name='lab-submit'),

    # patients + inventory
    path('facility/<int:fac_id>/patients/admitted/', admitted_patients),
    path('facility/<int:fac_id>/inventory/low/', low_inventory),
    

    # disease analytics
    path('stats/disease/<int:disease_id>/geo/', disease_geo),
    path('stats/disease/<int:disease_id>/day/', disease_daily),
    path('stats/disease/<int:disease_id>/monthly/', disease_monthly_avg),
]