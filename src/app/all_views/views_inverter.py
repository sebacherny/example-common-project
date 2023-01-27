from random import randint
import uuid
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from app.models import Inverter, SolarSystem, MicroInverter
import json


def serialize_inverter(t):
    ret = model_to_dict(t)
    # ret["array_indexes"] = [1, 2]
    return ret


def save_inverter(data, solar_system, inverter, success_status, is_new=False):
    errors = []
    inverter_make = data.get("inverterMake", "")
    inverter_model = data.get("inverterModel", "")
    if inverter_make == "":
        errors.append({"inverterMake": "This field is required"})

    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)
    try:
        inverter.make = inverter_make
        inverter.model = inverter_model
        inverter.system = solar_system
        inverter.save()
        if is_new:
            solar_system.arrays_count += 1
            solar_system.save()
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": [{"Inverter": str(e)}]
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_inverter(inverter)}), status=success_status)


@api_view(['GET', 'POST'])
def inverters(request, system_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        if request.user.is_staff:
            solar_system = SolarSystem.objects.get(pk=system_id)
        else:
            solar_system = SolarSystem.objects.get(
                pk=system_id, user=request.user)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        inverters = Inverter.objects.filter(system=solar_system)
        inverters = [serialize_inverter(inverter) for inverter in inverters]
        micro_inverters = MicroInverter.objects.filter(system=solar_system)
        inverters += [serialize_inverter(inverter) for inverter in micro_inverters]
        return HttpResponse(json.dumps({"data": inverters}), status=status.HTTP_200_OK)

    if request.method == "POST":
        inverter = Inverter()
        return save_inverter(request.data, solar_system, inverter, status.HTTP_201_CREATED, is_new=True)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'PUT', 'DELETE'])
def inverter(request, system_id, inverter_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        if request.user.is_staff:
            solar_system = SolarSystem.objects.get(pk=system_id)
        else:
            solar_system = SolarSystem.objects.get(
                pk=system_id, user=request.user)
        inverter = Inverter.objects.get(pk=inverter_id, system=solar_system)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return HttpResponse(json.dumps({"data": serialize_inverter(inverter)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_inverter(request.data, solar_system, inverter, status.HTTP_200_OK)

    if request.method == "DELETE":
        inverter.delete()
        solar_system.arrays_count -= 1
        solar_system.save()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


def create_inverters_from_data(inverters_list, solar_system, get_inverter_info, avoid_duplicates=False,
                               is_micro_inverter=False):
    inverters_obj = []
    for inverter in inverters_list:
        inverter_obj = MicroInverter() if is_micro_inverter else Inverter()
        inverter_info = get_inverter_info(inverter)
        if avoid_duplicates:
            try:
                if is_micro_inverter:
                    inverter_obj = MicroInverter.objects.get(
                        system=solar_system, serial_number=inverter_info['serial_number'])
                else:
                    inverter_obj = Inverter.objects.get(
                        system=solar_system, serial_number=inverter_info['serial_number'])
            except:
                pass
        inverter_obj.make = inverter_info['make']
        inverter_obj.model = inverter_info['model']
        inverter_obj.serial_number = inverter_info['serial_number']
        inverter_obj.connected_optimizers = inverter_info['connected_optimizers']
        inverter_obj.capacity = inverter_info['capacity']
        if 'sku' in inverter_info:
            inverter_obj.sku = inverter_info['sku']
        if 'part_number' in inverter_info:
            inverter_obj.part_number = inverter_info['part_number']
        if 'active' in inverter_info:
            inverter_obj.active = inverter_info['active']

        inverter_obj.system = solar_system
        inverter_obj.save()
        inverters_obj.append(inverter_obj)
    solar_system.inverters_count = len(inverters_list)
    return inverters_obj
