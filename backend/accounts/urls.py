from django.urls import path
from rest_framework.decorators import permission_classes
from accounts.permissions import IsRole, IsOwnerCitizenOrStaff

from .views import (
    login_view,
    add_citizen, delete_citizen,
    add_worker, delete_worker,
    add_citizen_contact, delete_citizen_contact, get_citizen_contacts,
)

urlpatterns = [
    path('api/login/', login_view),

    path('api/citizen/add/', add_citizen),
    path('api/citizen/delete/<int:id>/', delete_citizen),

    path('api/worker/add/', add_worker),
    path('api/worker/delete/<int:id>/', delete_worker),

    path('api/citizen/contact/add/', add_citizen_contact),
    path('api/citizen/<int:citizen_id>/contacts/', get_citizen_contacts),
    path('api/citizen/<int:citizen_id>/contact/delete/<int:id>/', delete_citizen_contact),
]