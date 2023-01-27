from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.all_views.views_inverter import serialize_inverter
from app.all_views.views_solar_array import serialize_solar_array
from app.all_views.views_user import serialize_user
from app.all_views.views_rate import serialize_rate_for_table
from app.models import ClientInfo, CustomUser, Inverter, SolarArray, \
    SolarSystem, UtilityRate
import json
from app.all_views.views_api_calls import serialize_client_info
from app.all_views.views_system import serialize_solar_system


@api_view(['GET'])
def all_users(request):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        all_systems = SolarSystem.objects.all()
        return HttpResponse(json.dumps({"data": [serialize_solar_system(s, add_output=True,
                                                                        period=request.query_params.get("period"))
                                                 for s in all_systems]}))

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
def clients_info(request):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        all_clients = ClientInfo.objects.all().order_by('name')
        return HttpResponse(json.dumps({"data": [serialize_client_info(c) for c in all_clients]}))

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
def database_info(request):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    if request.method == "GET":
        all_data = {}
        all_data["clients_info"] = {"data": [serialize_client_info(c) for c in ClientInfo.objects.all()],
                                    "headers": ['id', 'name', 'account_id', 'user_id', 'installation_date', 'status', 'api_name']}
        all_data["users"] = {"data": [serialize_user(c) for c in CustomUser.objects.all()],
                             "headers": ['username', 'name', 'address', 'is_admin']}
        all_data["solar_system"] = {"data": [serialize_solar_system(c) for c in SolarSystem.objects.all()],
                                    "headers": ['id', 'name', 'monitor_id',
                                                'total_capacity', 'inverters_count', 'arrays_count',
                                                'rate']}
        all_data["inverter"] = {"data": [serialize_inverter(c) for c in Inverter.objects.all()],
                                "headers": ['id', 'make', 'model', 'serial_number',
                                            'capacity', 'connected_optimizers', 'sku',
                                            'part_number', 'active', 'system', 'arrays_count']}
        all_data["solar_array"] = {"data": [serialize_solar_array(c) for c in SolarArray.objects.all()],
                                   "headers": ['id', 'panel_make', 'panel_model', 'module_capacity', 'azimuth',
                                               'tilt_angle', 'losses', 'module_type', 'array_type',
                                               'number_of_modules', 'shaded_conditions', 'note', 'inverter']}
        all_data["rates"] = {"data": [serialize_rate_for_table(r) for r in UtilityRate.objects.all()],
                             "headers": ['id', 'utility_name', 'rate_name', 'period_1', 'period_2', 'period_3']}
        # print("pv")
        #all_data["pvwatts_info"] = [serialize_pvwatts_info(c) for c in PVWattsArrayInfo.objects.all()]
        # print("aep")
        #all_data["aep_objects"] = [serialize_solar_edge_info(c) for c in SystemActualEnergyProduction.objects.all()]
        return HttpResponse(json.dumps({"data": all_data}))

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
