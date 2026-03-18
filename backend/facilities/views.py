# backend/facilities/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Wards

@api_view(['GET'])
def get_ward_availability(request, fac_id):
    wards = Wards.objects.filter(facility_id=fac_id)
    data = []
    for ward in wards:
        data.append({
            "id": ward.id,
            "type": ward.type,
            "total": ward.total,
            "occupied": ward.occupied,
            # Calculate available beds right here on the backend
            "available": ward.total - ward.occupied 
        })
    return Response(data)