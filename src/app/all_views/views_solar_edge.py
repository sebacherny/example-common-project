from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.models import ClientInfo
import json
from app.apis.solar_edge_api import get_site_inventory
from app.all_views.views_api_calls import serialize_client_info
from app.all_views.views_inverter import create_inverters_from_data


@api_view(['POST'])
def solar_edge_system(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "POST":
        address = request.data.get('address')
        matched_clients = []
        for client in ClientInfo.objects.all():
            if all(word in client.location_address for word in address.split(" ") if word):
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
        try:
            site_inventory = get_site_inventory(site_id)
        except:
            site_inventory = None
        if site_inventory:
            return HttpResponse(json.dumps({"success": True, "data": site_inventory}),
                                status=status.HTTP_200_OK)
        else:
            return HttpResponse(json.dumps({"success": False}),
                                status=status.HTTP_404_NOT_FOUND)
    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


def create_inverters_and_arrays_from_solar_edge(solar_system, avoid_duplicates=False):
    site_id = solar_system.monitor_id
    inventory = get_site_inventory(site_id)

    def get_inverter_info(inverter):
        return {'make': inverter['manufacturer'],
                'model': inverter['model'],
                'serial_number': inverter['SN'],
                'connected_optimizers': inverter['connectedOptimizers'],
                'capacity': 0}
    return create_inverters_from_data(inventory.get("inverters", []), solar_system, get_inverter_info,
                                      avoid_duplicates=avoid_duplicates)
