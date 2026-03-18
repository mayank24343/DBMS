from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, HealthcareWorker, Skill, Works

# 1. Register the custom User model with the special secure UserAdmin UI
admin.site.register(User, UserAdmin)

# 2. Register the rest of your workforce tables normally
admin.site.register(HealthcareWorker)
admin.site.register(Skill)
admin.site.register(Works)