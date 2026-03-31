from django.core.management.base import BaseCommand
from django.db import connection
from datetime import date

from inventory.services.supply_chain import fulfill_request

class Command(BaseCommand):
    help = "Auto restock low inventory"

    def handle(self, *args, **kwargs):
        cursor = connection.cursor()
        cursor.execute("""
            SELECT inv.place_id, inv.item_id, inv.threshold
            FROM inventory inv
            WHERE inv.quantity < inv.threshold
        """)
        
        low_items = cursor.fetchall()
        for item in low_items:
            place_id, item_id, threshold = item
            self.stdout.write(f"Restocking item {item_id} at facility {place_id}")
            
            fulfill_request(
                facility_id=place_id,
                item_id=item_id,
                required_qty=threshold * 2
            )
        
        self.stdout.write(self.style.SUCCESS("Auto restock completed"))
