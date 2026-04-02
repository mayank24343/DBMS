from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import F
from django.utils import timezone
from datetime import date, timedelta

from inventory.services.supply_chain import fulfill_request

from django.db import connection

@api_view(['GET'])
def low_stock_alert(request, fac_id):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT i.name, inv.quantity, inv.threshold
        FROM inventory inv
        JOIN item i ON inv.item_id = i.id
        WHERE inv.place_id = %s AND inv.quantity < inv.threshold
    """, [fac_id])
    
    rows = cursor.fetchall()
    data = [{"item": row[0], "quantity": row[1], "threshold": row[2]} for row in rows]
    return Response(data)

@api_view(['GET'])
def near_expiry_alert(request, fac_id):
    cursor = connection.cursor()
    thirty_days = date.today() + timedelta(days=30)
    cursor.execute("""
        SELECT i.name, inv.quantity, inv.expiry
        FROM inventory inv
        JOIN item i ON inv.item_id = i.id
        WHERE inv.place_id = %s AND inv.expiry <= %s
        ORDER BY inv.expiry
    """, [fac_id, thirty_days])
    
    rows = cursor.fetchall()
    data = [{"item": row[0], "quantity": row[1], "expiry": row[2]} for row in rows]
    return Response(data)
    
@api_view(['POST'])
def manual_purchase(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO supplier_order (supplier_id, destination_id, item_id, quantity, order_date)
        VALUES (%s, %s, %s, %s, %s)
    """, [request.data['supplier_id'], request.data['facility_id'], request.data['item_id'], request.data['quantity'], date.today()])
    return Response({"status": "ordered"})

@api_view(['POST'])
def get_best_suppliers(request):
    item_id = request.data['item_id']
    required_qty = request.data['required_qty']
    cursor = connection.cursor()
    cursor.execute("""
        SELECT supplier_id, quantity, price_per_item
        FROM listing 
        WHERE item_id = %s AND quantity > 0
        ORDER BY price_per_item ASC
    """, [item_id])
    
    listings = cursor.fetchall()
    result = []
    

    for l in listings:
        supplier_id, l_qty, price = l
        

        result.append({
            "supplier_id": supplier_id,
            "quantity": l_qty,
            "price": price
        })

       

    return Response(result)

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

    cursor = connection.cursor()
    for p in plan:
        cursor.execute("""
            INSERT INTO supplier_order (supplier_id, destination_id, item_id, quantity, order_date)
            VALUES (%s, %s, %s, %s, %s)
        """, [p['supplier_id'], destination, item_id, p['quantity'], date.today()])

    return Response({"status": "auto-ordered"})

@api_view(['POST'])
def request_from_warehouse(request):
    item_id = request.data['item_id']
    qty = request.data['quantity']
    facility_id = request.data['facility_id']

    cursor = connection.cursor()
    cursor.execute("""
        SELECT inv.id, inv.quantity, inv.place_id
        FROM inventory inv
        JOIN place p ON inv.place_id = p.id
        JOIN warehouse w ON p.id = w.id
        WHERE inv.item_id = %s
        ORDER BY inv.quantity DESC
        LIMIT 1
    """, [item_id])
    
    row = cursor.fetchone()
    if row and row[1] >= qty:
        # transfer
        cursor.execute("""
            INSERT INTO inventory_transfer (from_id, to_id, date)
            VALUES (%s, %s, %s)
        """, [row[2], facility_id, date.today()])
        
        cursor.execute("""
            UPDATE inventory SET quantity = quantity - %s WHERE id = %s
        """, [qty, row[0]])

        return Response({"status": "fulfilled by warehouse"})

    else:
        return Response({"status": "insufficient, trigger purchase"})
    
    
@api_view(['POST'])
def log_usage(request):
    cursor = connection.cursor()
    cursor.execute("""
        INSERT INTO item_use (item_id, fac_id, use_date, quantity)
        VALUES (%s, %s, %s, %s)
    """, [request.data['item_id'], request.data['facility_id'], date.today(), request.data['quantity']])

    # Decrease inventory
    cursor.execute("""
        UPDATE inventory 
        SET quantity = quantity - %s 
        WHERE place_id = %s AND item_id = %s
    """, [request.data['quantity'], request.data['facility_id'], request.data['item_id']])  

    return Response({"status": "usage logged"})

@api_view(['GET'])
def get_all_items(request):
    cursor = connection.cursor()
    cursor.execute("SELECT id, name FROM item")
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1]} for row in rows]

    return Response(data)
