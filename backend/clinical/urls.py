from django.urls import path
from .views import  available_facilities, create_visit, create_diagnosis, book_appointment, current_appointments, current_prescriptions, eligible_vaccines, lab_reports, medical_history, search_facilities, visit_detail
from .views import get_facilities, vaccination_history
from .views import get_all_diseases, get_lab_tests, get_procedures, get_medicines, create_prescription, create_lab_order, create_procedure
    
urlpatterns = [
    path('api/history/<int:citizen_id>/', medical_history),
    path('api/labs/<int:citizen_id>/', lab_reports),
    path('api/vaccinations/<int:citizen_id>/', vaccination_history),
    path('api/vaccines/eligible/<int:citizen_id>/', eligible_vaccines),

    path('api/visit/<int:id>/', visit_detail),
    path('api/appointments/book/', book_appointment),
    path('api/visit/new/', create_visit),

    path('api/search/', search_facilities),
    path('api/facilities/available/', available_facilities),
    path('api/current/prescriptions/<int:citizen_id>/', current_prescriptions),
    path('api/current/appointments/<int:citizen_id>/', current_appointments),
    
    path('api/visit/new/', create_visit, name='create-visit'),
    path('api/diagnosis/<int:visit_id>/', create_diagnosis, name='create-visit-with-diagnosis'),
    path('api/prescription/<int:visit_id>/', create_prescription, name='create-visit-with-prescription'),
    path('api/lab-order/<int:visit_id>/', create_lab_order, name='create-visit-with-lab-order'),
    path('api/procedure/<int:visit_id>/', create_procedure, name='create-visit-with-procedure'),
   
    path('api/facilities/', get_facilities),
    path('api/diseases/', get_all_diseases),
    path('api/lab-tests/', get_lab_tests),
    path('api/procedures/', get_procedures),
    path('api/medicines/', get_medicines),
]