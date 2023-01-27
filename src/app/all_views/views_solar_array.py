from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from app.models import Inverter, PVWattsArrayInfo, SolarArray, SolarSystem
import json
import datetime

from app.apis.pvwatts_api import get_treated_pvwatts_response
from app.all_views.views_api_calls import serialize_pvwatts_info


def serialize_solar_array(t):
    ret = model_to_dict(t)
    ret["last_pvwatts_call"] = str(ret["last_pvwatts_call"])
    if t.inverter:
        ret["inverter_make_and_model"] = t.inverter.make + \
            " - " + t.inverter.model
    return ret


def store_pvwatts_object(solar_array, output_json):
    pvwatts_obj = PVWattsArrayInfo()
    pvwatts_obj.solar_array = solar_array
    pvwatts_obj.output = output_json
    pvwatts_obj.save()
    return pvwatts_obj


def save_solar_array(data, inverter, solar_system, solar_array, success_status, is_new=False,
                     monitor_id=None):
    errors = []
    panel_make = data.get("panelMake", "")
    if panel_make == "":
        errors.append({"panelMake": "This field is required"})

    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)
    try:
        solar_array.inverter = inverter
        solar_array.panel_make = panel_make
        solar_array.panel_model = data.get("panelModel", "")
        solar_array.module_capacity = int(data.get("moduleCapacity"))
        solar_array.number_of_modules = int(data.get("numberOfModules"))
        solar_array.azimuth = int(data.get("azimuth"))
        solar_array.tilt_angle = int(data.get("tiltAngle"))
        solar_array.module_type = int(data.get("moduleType"))
        solar_array.array_type = int(data.get("arrayType"))
        solar_array.note = data.get("note")
        solar_array.system = solar_system
        solar_array.last_pvwatts_call = datetime.datetime.now()
        try:
            pvwatts_info_response = get_treated_pvwatts_response(
                solar_array, monitor_id=monitor_id)
        except Exception as e:
            raise Exception(
                "PVWatts information could not be obtained, error: {}.".format(str(e)))
        solar_array.save()
        solar_array.pvwatts_object_id = store_pvwatts_object(
            solar_array, pvwatts_info_response).id
        solar_array.save()
        if is_new:
            if inverter:
                inverter.arrays_count += 1
                inverter.save()
            solar_system.arrays_count += 1
            solar_system.save()
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": [{"message": str(e)}]
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_solar_array(solar_array)}), status=success_status)


@api_view(['GET', 'POST'])
def solar_arrays(request, system_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        if request.user.is_staff:
            system_obj = SolarSystem.objects.get(pk=system_id)
        else:
            system_obj = SolarSystem.objects.get(
                pk=system_id, user=request.user)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        arrays = SolarArray.objects.filter(system=system_obj)
        arrays_data = [serialize_solar_array(ar) for ar in arrays]
        return HttpResponse(json.dumps({"data": arrays_data}), status=status.HTTP_200_OK)

    if request.method == "POST":
        ar = SolarArray()
        try:
            if request.user.is_staff:
                inverter = Inverter.objects.get(
                    pk=request.data.get("inverterId"))
            else:
                inverter = Inverter.objects.get(
                    pk=request.data.get("inverterId"), system=system_obj)
        except ObjectDoesNotExist:
            return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
        return save_solar_array(request.data, inverter, inverter.system, ar, status.HTTP_201_CREATED, is_new=True)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'PUT', 'DELETE'])
def solar_array(request, system_id, solar_array_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        solar_array = SolarArray.objects.get(pk=solar_array_id)
        if solar_array.inverter.system.id != system_id:
            raise ObjectDoesNotExist
        inverter = solar_array.inverter
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return HttpResponse(json.dumps({"data": serialize_solar_array(solar_array)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_solar_array(request.data, inverter, inverter.system, solar_array, status.HTTP_200_OK)

    if request.method == "DELETE":
        solar_array.delete()
        inverter.arrays_count -= 1
        inverter.save()
        system = inverter.system
        system.arrays_count -= 1
        system.save()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
def pvwatts_info_view(request, solar_array_id):
    if request.user.is_anonymous and False:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        try:
            objs = PVWattsArrayInfo.objects.filter(
                solar_array=SolarArray.objects.get(pk=solar_array_id))
        except ObjectDoesNotExist:
            return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
        return HttpResponse(json.dumps({"data": [serialize_pvwatts_info(obj) for obj in objs]}), status=status.HTTP_200_OK,
                            content_type="application/json")


@api_view(['GET'])
def json_all_arrays_view(request):
    if request.user.is_anonymous and False:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        return HttpResponse(json.dumps({"data": [serialize_solar_array(obj) for obj in SolarArray.objects.all()]}),
                            status=status.HTTP_200_OK,
                            content_type="application/json")
