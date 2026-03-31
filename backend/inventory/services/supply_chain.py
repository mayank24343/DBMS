from datetime import date
from django.db.models import F
from inventory.models import Inventory, SupplierOrder, Listing, InventoryTransfer

def fulfill_request(facility_id, item_id, required_qty):

    remaining = required_qty

    # ================= STEP 1: TRY WAREHOUSE =================
    warehouses = Inventory.objects.filter(
        item_id=item_id,
        place__warehouse__isnull=False,
        quantity__gt=0
    ).order_by('-quantity')

    for stock in warehouses:
        if remaining <= 0:
            break

        take = min(stock.quantity, remaining)

        # create transfer
        InventoryTransfer.objects.create(
            from_id=stock.place_id,
            to_id=facility_id,
            date=date.today()
        )

        stock.quantity -= take
        stock.save()

        remaining -= take

    # ================= STEP 2: BUY FROM SUPPLIERS =================
    if remaining > 0:
        listings = Listing.objects.filter(
            item_id=item_id,
            quantity__gt=0
        ).order_by('price_per_item')

        for l in listings:
            if remaining <= 0:
                break

            take = min(l.quantity, remaining)

            SupplierOrder.objects.create(
                supplier_id=l.supplier_id,
                destination_id=facility_id,
                item_id=item_id,
                quantity=take,
                order_date=date.today()
            )

            remaining -= take

    return {
        "requested": required_qty,
        "fulfilled": required_qty - remaining,
        "remaining": remaining
    }