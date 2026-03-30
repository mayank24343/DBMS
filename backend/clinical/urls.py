from django.urls import path
from .views import CitizenMedicalHistoryAPIView, DiseaseGeographicStatsAPIView, DiseaseMonthlyTrendAPIView, VisitDetailAPIView, create_visit_with_diagnosis, book_appointment, eligible_vaccines, search_directory
from .views import get_facilities, vaccination_history
    
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
    
    path('api/vaccines/history/<int:citizen_id>/', vaccination_history, name='vaccination-history'),
    path('api/vaccines/eligible/<int:citizen_id>/', eligible_vaccines),
]