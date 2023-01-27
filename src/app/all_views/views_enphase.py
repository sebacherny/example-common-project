from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.apis.enphase_api import get_user_inverters, get_user_inventory
from app.models import ClientInfo
import json
from app.all_views.views_api_calls import serialize_client_info
from app.all_views.views_inverter import create_inverters_from_data


@api_view(['POST'])
def enphase_system(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "POST":
        address = request.data.get('address')
        matched_clients = []
        for client in ClientInfo.objects.filter(api_name="Enphase"):
            if all(word in client.location_address for word in address.split(" ") if word) or address == client.user_id:
                matched_clients.append(client)
        if len(matched_clients) == 1:
            return HttpResponse(json.dumps({"success": True, "data": serialize_client_info(matched_clients[0])}),
                                status=status.HTTP_200_OK)
        else:
            return HttpResponse(json.dumps({"success": False}),
                                status=status.HTTP_404_NOT_FOUND)
    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
def site_inventory(request, site_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        site_inventory = get_user_inventory(site_id)
        if site_inventory:
            inverters = site_inventory['micros']
            for inverter in inverters:
                inverter['connectedOptimizers'] = 1234
                inverter['SN'] = inverter['serial_number']
            return HttpResponse(json.dumps({"success": True,
                                            "data": {'inverters': inverters,
                                                     'gateways': site_inventory.get('gateways', [])}}),
                                status=status.HTTP_200_OK)
        else:
            return HttpResponse(json.dumps({"success": False}),
                                status=status.HTTP_404_NOT_FOUND)
    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


def create_inverters_and_arrays_from_enphase(solar_system, avoid_duplicates=False):
    site_id = solar_system.monitor_id
    inverters_list = get_user_inverters(site_id)

    def get_inverter_info(inverter):
        return {'make': inverter['name'],
                'model': inverter['model'],
                'serial_number': inverter['serial_number'],
                'sku': inverter['sku'],
                'part_number': inverter['part_number'],
                'active': inverter['active'],
                'connected_optimizers': 0,
                'capacity': 0}

    return create_inverters_from_data(inverters_list, solar_system, get_inverter_info,
                                      avoid_duplicates=avoid_duplicates, is_micro_inverter=True)
