# backend/inventory/urls.py
from django.urls import path
from .views import auto_purchase, get_all_items, get_best_suppliers, log_usage, manual_purchase, request_from_warehouse, request_item

urlpatterns = [
   
    path('api/request-item/', request_item),
    path('api/manual-purchase/', manual_purchase),
    path('api/request-warehouse/', request_from_warehouse),
    path('api/get_best_suppliers/', get_best_suppliers),
    path('api/log-usage/', log_usage),
    path('api/all-items/', get_all_items),
]