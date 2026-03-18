from django.contrib import admin
from django.apps import apps

# This automatically fetches every model in the 'facilities' app
facilities_app = apps.get_app_config('facilities')

for model_name, model in facilities_app.models.items():
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass