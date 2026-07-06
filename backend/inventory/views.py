from accounts.permissions import IsRole
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics
from django.db.models import F
from django.utils import timezone
from datetime import date, timedelta

from django.db import connection, transaction

@api_view(['GET'])
@permission_classes([IsRole('worker','admin')])
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
@permission_classes([IsRole('worker','admin')])
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
@permission_classes([IsRole('worker')])
def log_usage(request):
    item_id = request.data['item_id']
    facility_id = request.data['facility_id']
    quantity = request.data['quantity']

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT quantity FROM inventory
                    WHERE place_id = %s AND item_id = %s
                    FOR UPDATE
                """, [facility_id, item_id])
                row = cursor.fetchone()
                if not row:
                    return Response({"error": "No inventory record for this item at this facility"}, status=404)
                if row[0] < quantity:
                    return Response({"error": "Insufficient stock"}, status=400)

                cursor.execute("""
                    INSERT INTO item_use (item_id, fac_id, use_date, quantity)
                    VALUES (%s, %s, %s, %s)
                """, [item_id, facility_id, date.today(), quantity])

                cursor.execute("""
                    UPDATE inventory SET quantity = quantity - %s
                    WHERE place_id = %s AND item_id = %s
                """, [quantity, facility_id, item_id])

        return Response({"status": "usage logged"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
def get_all_items(request):
    cursor = connection.cursor()
    cursor.execute("SELECT id, name FROM item")
    rows = cursor.fetchall()
    data = [{"id": row[0], "name": row[1]} for row in rows]

    return Response(data)
