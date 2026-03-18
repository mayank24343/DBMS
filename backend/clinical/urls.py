from django.urls import path
from .views import CitizenMedicalHistoryAPIView, DiseaseGeographicStatsAPIView, DiseaseMonthlyTrendAPIView, VisitDetailAPIView

urlpatterns = [
    path('api/history/<str:aadhar_no>/', CitizenMedicalHistoryAPIView.as_view(), name='medical-history'),
    path('api/visit/<int:id>/', VisitDetailAPIView.as_view(), name='visit-detail'),
    # Get regional case counts for a specific disease
    path('api/stats/disease/<int:disease_id>/geo/', DiseaseGeographicStatsAPIView.as_view()),
    # Get monthly trends for charts/graphs
    path('api/stats/disease/<int:disease_id>/trends/', DiseaseMonthlyTrendAPIView.as_view()),
]