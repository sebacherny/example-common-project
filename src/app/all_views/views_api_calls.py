from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from app.models import ClientInfo, PVWattsArrayInfo, SystemActualEnergyProduction
import json
from app.apis.enphase_api import create_enphase_users_from_bulk
from app.apis.solar_edge_api import create_solar_edge_users_from_bulk
from django.core.exceptions import ObjectDoesNotExist


def serialize_pvwatts_info(obj):
    ret = model_to_dict(obj)
    return ret


def serialize_solar_edge_info(obj):
    ret = model_to_dict(obj)
    return ret


def serialize_client_info(client_info_object):
    ret = model_to_dict(client_info_object)
    ret['installation_date'] = str(ret['installation_date'])
    return ret


@api_view(['POST'])
def solar_edge_all_users(request):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "POST":
        create_solar_edge_users_from_bulk()
        ret = []
        for client_info in ClientInfo.objects.all():
            ret.append(serialize_client_info(client_info))
        return HttpResponse(json.dumps({"data": sorted(ret, key=lambda c: c["name"])}))

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['POST'])
def enphase_all_users(request):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "POST":
        ret = []
        create_enphase_users_from_bulk()
        for client_info in ClientInfo.objects.all():
            ret.append(serialize_client_info(client_info))
        return HttpResponse(json.dumps({"data": sorted(ret, key=lambda c: c["name"])}))

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
def pvwatts_info(request, object_id):
    if request.user.is_anonymous and False:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        try:
            obj = PVWattsArrayInfo.objects.get(pk=object_id)
        except ObjectDoesNotExist:
            return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
        return HttpResponse(json.dumps({"data": serialize_pvwatts_info(obj)}), status=status.HTTP_200_OK,
                            content_type="application/json")


@api_view(['GET'])
def solar_edge_info(request, object_id):
    if request.user.is_anonymous and False:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        try:
            obj = SystemActualEnergyProduction.objects.get(pk=object_id)
        except ObjectDoesNotExist:
            return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
        return HttpResponse(json.dumps({"data": serialize_solar_edge_info(obj)}), status=status.HTTP_200_OK,
                            content_type="application/json")
