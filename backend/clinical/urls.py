from django.urls import path
from .views import CitizenMedicalHistoryAPIView, DiseaseGeographicStatsAPIView, DiseaseMonthlyTrendAPIView, VisitDetailAPIView, available_facilities, create_visit_with_diagnosis, book_appointment, eligible_vaccines, lab_reports, medical_history, search_directory, search_facilities, visit_detail
from .views import get_facilities, vaccination_history
    
urlpatterns = [
    path('api/history/<int:citizen_id>/', medical_history),
path('api/labs/<int:citizen_id>/', lab_reports),
path('api/vaccinations/<int:citizen_id>/', vaccination_history),
path('api/vaccines/eligible/<int:citizen_id>/', eligible_vaccines),

path('api/visit/<int:id>/', visit_detail),
path('api/appointments/book/', book_appointment),

path('api/search/', search_facilities),
path('api/facilities/available/', available_facilities),
    
    
    # Get regional case counts for a specific disease
    path('api/stats/disease/<int:disease_id>/geo/', DiseaseGeographicStatsAPIView.as_view()),
    # Get monthly trends for charts/graphs
    path('api/stats/disease/<int:disease_id>/trends/', DiseaseMonthlyTrendAPIView.as_view()),
    path('api/visit/new/', create_visit_with_diagnosis, name='create-visit'),
   
    path('api/facilities/', get_facilities),
]