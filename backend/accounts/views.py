from django.shortcuts import render
from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, F
from django.db.models.functions import ExtractMonth
from django.db.models import Q
from clinical.models import Citizen

# Create your views here.
@api_view(['POST'])
def login_view(request):
    identifier = request.data.get("identifier")
    role = request.data.get("role")

    if role == "citizen":
        citizen = Citizen.objects.filter(
            Q(pk=identifier) | Q(aadhar_no=identifier)
        ).first()

        if not citizen:
            return Response({"error": "Invalid citizen"}, status=404)

        return Response({
            "citizen_id": citizen.pk
        })

    return Response({"error": "Unsupported role"}, status=400)