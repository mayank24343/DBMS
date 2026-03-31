from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import F
from django.utils import timezone
from datetime import date, timedelta

from inventory.services.supply_chain import fulfill_request
from .models import Inventory, InventoryTransfer, Listing, SupplierOrder
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
    
@api_view(['POST'])
def manual_purchase(request):
    SupplierOrder.objects.create(
        supplier_id=request.data['supplier_id'],
        destination_id=request.data['facility_id'],
        item_id=request.data['item_id'],
        quantity=request.data['quantity'],
        order_date=date.today()
    )

    return Response({"status": "ordered"})

def get_best_suppliers(item_id, required_qty):
    listings = Listing.objects.filter(
        item_id=item_id,
        quantity__gt=0
    ).order_by('price_per_item')

    result = []
    remaining = required_qty

    for l in listings:
        take = min(l.quantity, remaining)

        result.append({
            "supplier_id": l.supplier_id,
            "quantity": take,
            "price": l.price_per_item
        })

        remaining -= take
        if remaining == 0:
            break

    return result

@api_view(['POST'])
def request_item(request):
    result = fulfill_request(
        facility_id=request.data['facility_id'],
        item_id=request.data['item_id'],
        required_qty=request.data['quantity']
    )

    return Response(result)

@api_view(['POST'])
def auto_purchase(request):
    item_id = request.data['item_id']
    qty = request.data['quantity']
    destination = request.data['destination_id']

    plan = get_best_suppliers(item_id, qty)

    for p in plan:
        SupplierOrder.objects.create(
            supplier_id=p['supplier_id'],
            destination_id=destination,
            item_id=item_id,
            quantity=p['quantity'],
            order_date=date.today()
        )

    return Response({"status": "auto-ordered"})

@api_view(['POST'])
def request_from_warehouse(request):
    item_id = request.data['item_id']
    qty = request.data['quantity']
    facility_id = request.data['facility_id']

    stock = Inventory.objects.filter(
        item_id=item_id,
        place__warehouse__isnull=False
    ).order_by('-quantity').first()

    if stock and stock.quantity >= qty:
        # transfer
        InventoryTransfer.objects.create(
            from_id=stock.place_id,
            to_id=facility_id,
            date=date.today()
        )

        stock.quantity -= qty
        stock.save()

        return Response({"status": "fulfilled by warehouse"})

    else:
        return Response({"status": "insufficient, trigger purchase"})
    
    
