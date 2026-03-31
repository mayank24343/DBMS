from django.core.management.base import BaseCommand
from django.db.models import F
from datetime import date

from inventory.services.supply_chain import fulfill_request
from inventory.models import Inventory
from inventory.views import auto_purchase   # your function

class Command(BaseCommand):
    help = "Auto restock low inventory"

    def handle(self, *args, **kwargs):
        low_items = Inventory.objects.filter(quantity__lt=F('threshold'))

        for item in low_items:
            self.stdout.write(f"Restocking {item.item.name}")
            
        fulfill_request(
            facility_id=item.place_id,
            item_id=item.item_id,
            required_qty=item.threshold * 2
        )
        
        self.stdout.write(self.style.SUCCESS("Auto restock completed"))