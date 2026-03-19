from django.urls import path
from .views import CitizenMedicalHistoryAPIView, DiseaseGeographicStatsAPIView, DiseaseMonthlyTrendAPIView, VisitDetailAPIView, create_visit_with_diagnosis, book_appointment, search_directory
from .views import get_facilities
    
urlpatterns = [
    path('api/history/<str:aadhar_no>/', CitizenMedicalHistoryAPIView.as_view(), name='medical-history'),
    path('api/visit/<int:id>/', VisitDetailAPIView.as_view(), name='visit-detail'),
    # Get regional case counts for a specific disease
    path('api/stats/disease/<int:disease_id>/geo/', DiseaseGeographicStatsAPIView.as_view()),
    # Get monthly trends for charts/graphs
    path('api/stats/disease/<int:disease_id>/trends/', DiseaseMonthlyTrendAPIView.as_view()),
    path('api/visit/new/', create_visit_with_diagnosis, name='create-visit'),
    path('api/appointments/book/', book_appointment, name='book-appointment'),
    path('api/directory/search/', search_directory, name='search-directory'),
    path('api/facilities/', get_facilities),
]