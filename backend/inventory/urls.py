# backend/inventory/urls.py
from django.urls import path
from .views import LowStockAlertAPIView, NearExpiryAlertAPIView

urlpatterns = [
    path('api/alerts/low-stock/<int:fac_id>/', LowStockAlertAPIView.as_view(), name='low-stock'),
    path('api/alerts/expiry/<int:fac_id>/', NearExpiryAlertAPIView.as_view(), name='near-expiry'),
]