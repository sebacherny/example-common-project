import json
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import status

from app.models import CustomUser

# Create your views here.

def index(request):
    context = {}
    return render(request, "index.html", context=context)


def login_view(request):
    context = {}
    return render(request, "login.html", context=context)

def register_view(request):
    context = {}
    return render(request, "register.html", context=context)

def system_information_view(request, system_id):
    context = {"system_id": system_id}
    return render(request, "system_information.html", context=context)

def all_systems_view(request):
    context = {}
    return render(request, "all_systems.html", context=context)

def profile_view(request):
    context = {}
    return render(request, "profile.html", context=context)

def dashboard_view(request, system_id):
    context = {"system_id": system_id}
    return render(request, "dashboard.html", context=context)

def admin_dashboard(request):
    context = {}
    return render(request, "admin_dashboard.html", context=context)

def clients_view(request):
    context = {}
    return render(request, "clients_info.html", context=context)

def database_view(request):
    context = {}
    return render(request, "database_view.html", context=context)

def welcome(request, random_str):
    try:
        user = CustomUser.objects.get(registration_random_code=random_str)
    except:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
    context = {'username': user.username}
    return render(request, "user_validation.html", context=context)

def rate_creation_view(request):
    context = {}
    return render(request, "new_rate_creation.html", context=context)