from random import randint
import uuid
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from app.models import SolarArray, SolarSystem
import json 

def serialize_solar_array(t):
    ret = model_to_dict(t)
    return ret


def save_solar_array(request, solar_system, solar_array, success_status):
    errors = []
    inverter_make_and_model = request.data.get("inverterMakeAndModel", "")
    if inverter_make_and_model == "":
        errors.append({"inverterMakeAndModel": "This field is required"})

    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)
    try:
        solar_array.inverter_make_and_model = request.data.get("inverterMakeAndModel")
        solar_array.panel_make_and_model = request.data.get("panelMakeAndModel")
        solar_array.panel_nameplate_rating = request.data.get("panelNameplateRating")
        solar_array.number_of_solar_panels = request.data.get("numberOfSolarPanels")
        solar_array.azimuth = request.data.get("azimuth")
        solar_array.tilt_angle = request.data.get("tiltAngle")
        solar_array.shaded_conditions = request.data.get("shadedConditions")
        solar_array.note = request.data.get("note")
        solar_array.system = solar_system
        solar_array.save()
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": {"SolarArray": str(e)}
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_solar_array(solar_array)}), status=success_status)

@api_view(['GET', 'POST'])
def solar_arrays(request, system_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        solar_system = SolarSystem.objects.get(pk=system_id, user=request.user)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        arrays_data = SolarArray.objects.filter(system=solar_system)
        arrays_data = [serialize_solar_array(ar) for ar in arrays_data]
        return HttpResponse(json.dumps({"data": arrays_data}), status=status.HTTP_200_OK)

    if request.method == "POST":
        ar = SolarArray()
        return save_solar_array(request, solar_system, ar, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET', 'PUT', 'DELETE'])
def solar_array(request, system_id, solar_array_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        solar_system = SolarSystem.objects.get(user=request.user, pk=system_id)
        solar_array = SolarArray.objects.get(pk=solar_array_id, system=solar_system)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return HttpResponse(json.dumps({"data": serialize_solar_array(solar_array)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_solar_array(request, solar_system, solar_array, status.HTTP_200_OK)

    if request.method == "DELETE":
        solar_array.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
