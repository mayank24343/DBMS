from datetime import date
from django.db.models import F
from django.db import connection

def fulfill_request(facility_id, item_id, required_qty):
    cursor = connection.cursor()
    remaining = required_qty

    # ================= STEP 1: TRY WAREHOUSE =================
    cursor.execute("""
        SELECT inv.id, inv.quantity, inv.place_id
        FROM inventory inv
        JOIN place p ON inv.place_id = p.id
        JOIN warehouse w ON p.id = w.id
        WHERE inv.item_id = %s AND inv.quantity > 0
        ORDER BY inv.quantity DESC
    """, [item_id])
    
    warehouses = cursor.fetchall()
    for stock in warehouses:
        stock_id, stock_qty, place_id = stock
        if remaining <= 0:
            break
        take = min(stock_qty, remaining)

        # create transfer
        cursor.execute("""
            INSERT INTO inventory_transfer (from_id, to_id, date)
            VALUES (%s, %s, %s)
        """, [place_id, facility_id, date.today()])
        
        # update stock
        cursor.execute("""
            UPDATE inventory SET quantity = quantity - %s WHERE id = %s
        """, [take, stock_id])

        remaining -= take

    # ================= STEP 2: BUY FROM SUPPLIERS =================
    if remaining > 0:
        cursor.execute("""
            SELECT id, supplier_id, quantity, price_per_item
            FROM listing
            WHERE item_id = %s AND quantity > 0
            ORDER BY price_per_item
        """, [item_id])
        
        listings = cursor.fetchall()
        for l in listings:
            l_id, supplier_id, l_qty, price = l
            if remaining <= 0:
                break
            take = min(l_qty, remaining)

            cursor.execute("""
                INSERT INTO supplier_order (supplier_id, destination_id, item_id, quantity, order_date)
                VALUES (%s, %s, %s, %s, %s)
            """, [supplier_id, facility_id, item_id, take, date.today()])

            remaining -= take

    return {
        "requested": required_qty,
        "fulfilled": required_qty - remaining,
        "remaining": remaining
    }
