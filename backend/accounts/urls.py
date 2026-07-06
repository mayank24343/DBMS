from django.urls import path

from .views import login_view, add_citizen, delete_citizen, add_worker, delete_worker, add_facility, assign_worker, unassign_worker, get_facility_workers, add_citizen_contact, add_facility_contact,  get_citizen_contacts, delete_citizen_contact, delete_facility_contact, get_facility_contacts
from .views import get_all_facilities

urlpatterns = [

    path('api/login/', login_view),

    path('api/citizen/add/', add_citizen),
    path('api/citizen/delete/<int:id>/', delete_citizen),

    path('api/worker/add/', add_worker),
    path('api/worker/delete/<int:id>/', delete_worker),

    path('api/facility/add/', add_facility),

    path('api/worker/assign/', assign_worker),
    path('api/worker/unassign/', unassign_worker),

    path('api/facility/<int:fac_id>/workers/', get_facility_workers),
    path('api/all-facilities/', get_all_facilities),
    path('api/citizen/contact/add/', add_citizen_contact),
    path('api/facility/contact/add/', add_facility_contact),

    path('api/citizen/<int:citizen_id>/contacts/', get_citizen_contacts),
    path('api/facility/<int:facility_id>/contacts/', get_facility_contacts),
    path('api/citizen/<int:citizen_id>/contact/delete/<int:id>/', delete_citizen_contact),
    path('api/facility/contact/delete/<int:id>/', delete_facility_contact),
]