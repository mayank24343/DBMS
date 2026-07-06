# backend/inventory/urls.py
from django.urls import path
from .views import  get_all_items, log_usage

urlpatterns = [
    path('api/log-usage/', log_usage),
    path('api/all-items/', get_all_items),
]