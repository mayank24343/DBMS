from rest_framework import generics
from django.db.models import F
from django.utils import timezone
from datetime import timedelta
from .models import Inventory
from .serializers import InventoryAlertSerializer

class LowStockAlertAPIView(generics.ListAPIView):
    """API for Query #8: Items below threshold at a specific facility."""
    serializer_class = InventoryAlertSerializer

    def get_queryset(self):
        facility_id = self.kwargs['fac_id']
        return Inventory.objects.filter(
            place_id=facility_id, 
            quantity__lt=F('threshold') # Pure Query 8 logic
        ).select_related('item')

class NearExpiryAlertAPIView(generics.ListAPIView):
    """API for Query #7: Items expiring within 30 days."""
    serializer_class = InventoryAlertSerializer

    def get_queryset(self):
        facility_id = self.kwargs['fac_id']
        thirty_days_from_now = timezone.now().date() + timedelta(days=30)
        return Inventory.objects.filter(
            place_id=facility_id,
            expiry__lte=thirty_days_from_now # Pure Query 7 logic
        ).select_related('item').order_by('expiry')