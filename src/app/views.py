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


def login_sports_view(request):
    context = {}
    return render(request, "login_sports.html", context=context)


def register_view(request):
    context = {}
    return render(request, "register.html", context=context)


def register_sports_view(request):
    context = {}
    return render(request, "register_sports.html", context=context)


def profile_view(request):
    context = {}
    return render(request, "profile.html", context=context)


def dataset_dashboard_view(request, spreadsheet_id):
    context = {"spreadsheet_id": spreadsheet_id}
    return render(request, "dashboard.html", context=context)


def sports_dashboard_view(request):
    context = {}
    return render(request, "dashboard_sports.html", context=context)


def dataset_table_view(request, spreadsheet_id):
    context = {"spreadsheet_id": spreadsheet_id}
    return render(request, "spreadsheet_rows.html", context=context)


def datasets_view(request):
    context = {}
    return render(request, "datasets.html", context=context)


def linkedin_scrapper_view(request):
    context = {}
    return render(request, "linkedin_scrapper.html", context=context)


def welcome(request, random_str):
    try:
        user = CustomUser.objects.get(registration_random_code=random_str)
    except:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
    context = {'username': user.username}
    return render(request, "user_validation.html", context=context)


def see_tickets(request):
    context = {}
    return render(request, "tickets.html", context=context)


def see_one_ticket(request, ticket_id):
    context = {"ticket_id": ticket_id}
    return render(request, 'one_ticket.html', context=context)


def upload_form(request):
    context = {}
    return render(request, "form.html", context=context)


def health(_request):
    return HttpResponse(json.dumps({"success": True, "message": "Up and running!"}), status=status.HTTP_200_OK)

def test_url_view(request):
    context = {}
    return render(request, "test_url.html", context=context)
