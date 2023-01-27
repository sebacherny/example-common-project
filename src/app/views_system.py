from random import randint
import uuid
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from app.models import SolarSystem
import json 

def serialize_solar_system(t):
    ret = model_to_dict(t)
    return ret


def save_solar_system(request, system, success_status):
    errors = []
    name = request.data.get("systemName", "")
    location = request.data.get("systemLocation", "")
    system_id = request.data.get("systemId", "")
    if name == "":
        errors.append({"systemName": "This field is required"})
    if location == "":
        errors.append({"systemLocation": "This field is required"})
    if system_id == "":
        errors.append({"systemId": "This field is required"})

    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)
    try:
        system.name = name
        system.location = location
        system.system_id = system_id
        system.user = request.user
        system.save()
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": {"SolarSystem": str(e)}
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_solar_system(system)}), status=success_status)

@api_view(['GET', 'POST'])
def systems(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        systems_data = SolarSystem.objects.filter(user=request.user)
        systems_data = [serialize_solar_system(system) for system in systems_data]
        return HttpResponse(json.dumps({"data": systems_data}), status=status.HTTP_200_OK)

    if request.method == "POST":
        ar = SolarSystem()
        return save_solar_system(request, ar, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET', 'PUT', 'DELETE'])
def system(request, system_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        solar_system = SolarSystem.objects.get(pk=system_id, user=request.user)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return HttpResponse(json.dumps({"data": serialize_solar_system(solar_system)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_solar_system(request, solar_system, status.HTTP_200_OK)

    if request.method == "DELETE":
        solar_system.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET'])
def dashboard_view(request, system_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        solar_system = SolarSystem.objects.get(user=request.user, pk=system_id)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        # Do API call
        return HttpResponse(json.dumps({"data": {"energy_produced": "7 kWh",
                                                 "expected_production": "7 kWh",
                                                 "value_of_energy_produced": "$ 2.50"}}), status=status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)