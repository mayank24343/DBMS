# backend/inventory/urls.py
from django.urls import path
from .views import LowStockAlertAPIView, NearExpiryAlertAPIView, auto_purchase, get_best_suppliers, manual_purchase, request_from_warehouse, request_item, suppliers_for_item

urlpatterns = [
    path('api/alerts/low-stock/<int:fac_id>/', LowStockAlertAPIView.as_view(), name='low-stock'),
    path('api/alerts/expiry/<int:fac_id>/', NearExpiryAlertAPIView.as_view(), name='near-expiry'),
    path('api/request-item/', request_item),
    path('api/manual-purchase/', manual_purchase),
    path('api/request-warehouse/', request_from_warehouse),
    path('api/get_best_suppliers/', get_best_suppliers),
]