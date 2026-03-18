from django.contrib import admin
from django.apps import apps

# This automatically fetches every model in the 'clinical' app
clinical_app = apps.get_app_config('clinical')

for model_name, model in clinical_app.models.items():
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass