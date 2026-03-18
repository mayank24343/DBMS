from django.contrib import admin
from django.apps import apps

# This automatically fetches every model in the 'inventory' app
inventory_app = apps.get_app_config('inventory')

for model_name, model in inventory_app.models.items():
    try:
        admin.site.register(model)
    except admin.sites.AlreadyRegistered:
        pass