import datetime
from random import randint
import uuid
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from app.all_views.views_enphase import create_inverters_and_arrays_from_enphase
from app.apis.enphase_api import obtain_past_hourly_production_enphase, retrieve_one_enphase_user
from app.all_views.views_solar_array import save_solar_array
from app.apis.solar_edge_api import obtain_past_hourly_production_solar_edge, get_site_details
from app.apis import store_past_hourly_production, get_aep_day, get_aep_month, get_aep_year, store_client_in_db
from app.models import ClientInfo, Inverter, PVWattsArrayInfo, SolarArray, SystemActualEnergyProduction, SolarSystem, UtilityRate
import json
import numpy as np

from app.apis.pvwatts_api import get_day_hourly_average, get_month_daily_average, get_year_monthly_average
from app.all_views.views_solar_edge import create_inverters_and_arrays_from_solar_edge
from django_files.settings import MONTHS_NAMES, DAYS_PER_MONTH


def _get_all_requested_days(requested_date, requested_period):
    date_from = datetime.datetime.strptime(requested_date, "%Y-%m-%d")
    if requested_period == "ac_month":
        date_from = datetime.datetime.strptime(
            requested_date[:7] + "-01", "%Y-%m-%d")
    if requested_period == "ac_year":
        date_from = datetime.datetime.strptime(
            requested_date[:4] + "-01-01", "%Y-%m-%d")
    actual_date = date_from
    ret = []
    while True:
        ret.append((actual_date.year, actual_date.month,
                   actual_date.day, actual_date.weekday() < 5))
        actual_date = actual_date + datetime.timedelta(days=1)
        if requested_period == 'ac_day' or (requested_period == 'ac_month' and date_from.month != actual_date.month) or (requested_period == 'ac_year' and date_from.year != actual_date.year):
            break
    return ret


def _month_belongs_to_period(month_index, month_from, month_to):
    if month_from <= month_to:
        return month_index >= month_from and month_index <= month_to
    else:
        return month_index >= month_from or month_index <= month_to


def _get_solar_system_vep(money_rate_object, aep_output_json, requested_date, requested_period):
    ret = {}
    date_from = datetime.datetime.strptime(requested_date, "%Y-%m-%d")
    rate_structure = money_rate_object.rate_structure
    for (year, month_num, day, is_weekday) in _get_all_requested_days(requested_date, requested_period):
        month_index = month_num - 1
        day_period = [period for period in rate_structure if _month_belongs_to_period(
            month_index, int(period['month_from']), int(period['month_to'])) and ((is_weekday and period['is_weekday']) or (period['is_weekend'] and not is_weekday))][0]
        day_total = 0
        for hour in range(24):
            hour_value = float(day_period['hourly_rate'][str(hour)]) * aep_output_json[str(
                year)].get(str(month_index + 1), {}).get(str(day), {}).get(str(hour), 0) / 1000.
            if not year in ret:
                ret[year] = {}
            if not month_index in ret[year]:
                ret[year][month_index] = {}
            if not day in ret[year][month_index]:
                ret[year][month_index][day] = {}
            ret[year][month_index][day][hour] = hour_value
            day_total += hour_value
        ret[year][month_index][day]['total'] = day_total
    values = []
    if requested_period == 'ac_day':
        values = [ret[year][month_index][day][hour] for hour in range(24)]
    elif requested_period == 'ac_month':
        for day in range(1, DAYS_PER_MONTH[date_from.month - 1] + 1):
            values.append(
                sum(ret[date_from.year][date_from.month - 1].get(day, {}).get(hour, 0) for hour in range(24)))
    elif requested_period == 'ac_year':
        for month in range(12):
            values.append(sum(ret[year][month][day]['total']
                          for day in range(1, DAYS_PER_MONTH[month])))
    return values


def _get_solar_array_expected_production(pvwatts_object, requested_date, period):
    # requested_date 2022-01 or 2022-01-01
    if period == "ac_month":
        return get_month_daily_average(pvwatts_object.output, requested_date)
    elif period == "ac_day":
        return get_day_hourly_average(pvwatts_object.output, requested_date)
    else:
        return get_year_monthly_average(pvwatts_object.output)


def _get_solar_system_expected_production(solar_system, requested_date, period):
    expected_production = {'unit': 'kWh'}
    for inverter in Inverter.objects.filter(system=solar_system):
        for solar_array in SolarArray.objects.filter(inverter=inverter):
            try:
                pvwatts_info = PVWattsArrayInfo.objects.get(
                    pk=solar_array.pvwatts_object_id)
            except:
                continue
            solar_array_values = _get_solar_array_expected_production(pvwatts_info,
                                                                      requested_date, period)
            if not 'values' in expected_production:
                expected_production['values'] = np.array(solar_array_values)
            else:
                expected_production['values'] += np.array(solar_array_values)
    if 'values' in expected_production:
        expected_production['values'] = list(expected_production['values'])
    else:
        expected_production['values'] = []
    return expected_production


def _get_function_to_obtain_historic_production(api):
    if api == "Enphase":
        return obtain_past_hourly_production_enphase
    else:
        return obtain_past_hourly_production_solar_edge


def create_inverters_and_arrays(system, api_name):
    if api_name == "Enphase":
        return create_inverters_and_arrays_from_enphase(system)
    if api_name == "SolarEdge":
        return create_inverters_and_arrays_from_solar_edge(system)


def _get_aep_object(solar_system, api_name, requested_date, period):
    aep_object = SystemActualEnergyProduction.objects.filter(
        solar_system=solar_system)
    if period == "ac_day":
        date_from = datetime.datetime.strptime(requested_date, "%Y-%m-%d")
        date_to = date_from + datetime.timedelta(days=1)
    if period == "ac_month":
        date_from = datetime.datetime.strptime(
            requested_date[:7] + "-01", "%Y-%m-%d")
        date_to = date_from + datetime.timedelta(days=31)
    if period == "ac_year":
        date_from = datetime.datetime.strptime(
            requested_date[:4] + "-01-01", "%Y-%m-%d")
        date_to = date_from + datetime.timedelta(days=365)
    aep_object = store_past_hourly_production(solar_system, date_from=date_from, date_to=date_to,
                                              aep_object=aep_object[0] if aep_object else SystemActualEnergyProduction(
                                                  output={}),
                                              obtain_past_hourly_production=_get_function_to_obtain_historic_production(api_name))
    return aep_object


def _get_solar_system_actual_production_and_output(solar_system, api_name, requested_date, period):
    # requested_date 2022-01 or 2022-01-01
    aep_object = _get_aep_object(
        solar_system, api_name, requested_date, period)
    if period == "ac_month":
        aep_array_values = get_aep_month(aep_object.output, requested_date)
    elif period == "ac_day":
        aep_array_values = get_aep_day(aep_object.output, requested_date)
    else:
        aep_array_values = get_aep_year(aep_object.output, requested_date)
    actual_production = {'unit': 'kWh', 'values': aep_array_values}
    return (actual_production, aep_object.output)


def serialize_solar_system(system, add_output=False, period="ac_day"):
    ret = model_to_dict(system)
    ret["username"] = system.user.username
    ret["location_string"] = ret["location_address"] or ""
    if ret["location_latitude"] is not None and ret["location_longitude"] is not None:
        ret["location_string"] += " ({}, {})".format(
            ret["location_longitude"], ret["location_latitude"])
    ret["api_name"] = system.api_name
    ret["rate"] = str(system.money_rate_object)
    try:
        client_info = ClientInfo.objects.get(user_id=system.monitor_id)
        ret["installation_date"] = str(client_info.installation_date)
        ret["primary_module"] = client_info.primary_module
        ret["status"] = client_info.status
    except:
        pass
    if add_output:
        requested_date_str = datetime.datetime.strftime(
            datetime.datetime.now(), "%Y-%m-%d")
        (aep_json, _output) = _get_solar_system_actual_production_and_output(
            system, ret["api_name"], requested_date_str, period)
        ret["actual_production"] = {period: sum(aep_json["values"])}
        ret["expected_production"] = {period: sum(_get_solar_system_expected_production(system,
                                                                                        requested_date_str,
                                                                                        period)["values"])}
        for other_period in ("ac_day", "ac_month", "ac_year"):
            if other_period != period:
                ret["actual_production"][other_period] = 0
                ret["expected_production"][other_period] = 0
    return ret


def save_solar_system(data, user, system, success_status, automatically_create_inverters_and_arrays=True):
    errors = []
    name = data.get("systemName", "")
    location_address = data.get("systemLocationAddress", "")
    location_longitude = data.get("systemLocationLongitude", "") or None
    location_latitude = data.get("systemLocationLatitude", "") or None
    monitor_id = data.get("systemId", "")
    api_name = data.get("apiName", "")
    if api_name not in ("Enphase", "SolarEdge"):
        errors.append("Unknown api name: {}".format(api_name))
    try:
        rate_object = UtilityRate.objects.get(utility_name=data.get("moneyRateInfo", {}).get("utilityName"),
                                              rate_name=data.get("moneyRateInfo", {}).get("utilityRate"))
    except:
        errors.append("There is no unique rate with that information")

    if len(errors) > 0:
        return HttpResponse(json.dumps({"errors": errors}), status=status.HTTP_400_BAD_REQUEST)
    try:
        system.name = name
        system.location_address = location_address
        system.location_longitude = location_longitude
        system.location_latitude = location_latitude
        system.monitor_id = monitor_id
        system.user = user
        system.money_rate_object = rate_object
        system.api_name = api_name
        system.save()
        if not ClientInfo.objects.filter(user_id=monitor_id):
            try:
                if api_name == "Enphase":
                    site_json = retrieve_one_enphase_user(monitor_id)
                else:
                    site_json = get_site_details(monitor_id)
            except:
                site_json = None
            if site_json:
                client_info_object = ClientInfo()
                store_client_in_db(client_info_object, site_json, api_name)
        if automatically_create_inverters_and_arrays:
            create_inverters_and_arrays(system, api_name)
        aep_object = SystemActualEnergyProduction.objects.filter(
            solar_system=system)
        aep_object = store_past_hourly_production(system,
                                                  aep_object=aep_object[0] if aep_object else SystemActualEnergyProduction(
                                                      output={}),
                                                  obtain_past_hourly_production=_get_function_to_obtain_historic_production(api_name))

    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": ["Error with SolarSystem: {}".format(str(e))]
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_solar_system(system)}), status=success_status)


@ api_view(['GET', 'POST'])
def systems(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        systems_data = SolarSystem.objects.filter(user=request.user)
        systems_data = [serialize_solar_system(
            system) for system in systems_data]
        return HttpResponse(json.dumps({"data": systems_data}), status=status.HTTP_200_OK)

    if request.method == "POST":
        ar = SolarSystem()
        return save_solar_system(request.data, request.user, ar, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['POST'])
def wizard(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "POST":
        monitor_id = request.data.get("system", {}).get("systemId")
        try:
            if request.user.is_staff:
                solar_system_obj = SolarSystem.objects.get(
                    monitor_id=monitor_id)
            else:
                solar_system_obj = SolarSystem.objects.get(
                    monitor_id=monitor_id, user=request.user)
        except ObjectDoesNotExist:
            solar_system_obj = SolarSystem()
        ret = save_solar_system(request.data.get("system", {}), request.user, solar_system_obj, status.HTTP_201_CREATED,
                                automatically_create_inverters_and_arrays=False)
        if ret.status_code != status.HTTP_201_CREATED:
            return ret
        arrays_with_errors = []
        all_inverters_from_request = request.data.get("inverters", [])
        errors = []
        if request.data.get("apiName") == "Enphase":
            inverters_obj = create_inverters_and_arrays_from_enphase(solar_system_obj,
                                                                     avoid_duplicates=True)
            SolarArray.objects.filter(system=solar_system_obj).delete()
            all_arrays = []
            for array_index, array in enumerate(request.data.get("arrays", [])):
                ar = SolarArray()
                solar_array_ret = save_solar_array(
                    array, None, solar_system_obj, ar, status.HTTP_201_CREATED, is_new=True, monitor_id=monitor_id)
                if solar_array_ret.status_code != status.HTTP_201_CREATED:
                    errors.append('Array {}, error: {}'.format(
                        array_index + 1, json.loads(solar_array_ret.content)['errors'][0]))
                else:
                    all_arrays.append(ar)
            if not errors:
                for inverter_index, inverter_object in enumerate(inverters_obj):
                    inverter_json = all_inverters_from_request[inverter_index]
                    array_index = inverter_json.get("assigned_arrays", [])
                    if len(array_index) == 1:
                        inverter_object.array = all_arrays[array_index[0]]
                        inverter_object.save()
                    else:
                        errors.append('Inverter {} should be assigned to exactly one array'.format(
                            inverter_index + 1))
        else:
            inverters_obj = create_inverters_and_arrays_from_solar_edge(solar_system_obj,
                                                                        avoid_duplicates=True)
            for inverter_index, inverter_object in enumerate(inverters_obj):
                inverter_json = all_inverters_from_request[inverter_index]
                SolarArray.objects.filter(inverter=inverter_object).delete()
                for array_index in inverter_json.get("assigned_arrays", []):
                    if array_index in arrays_with_errors:
                        continue
                    array = request.data.get("arrays", [])[array_index]
                    ar = SolarArray()
                    solar_array_ret = save_solar_array(
                        array, inverter_object, solar_system_obj, ar, status.HTTP_201_CREATED, is_new=True)
                    if solar_array_ret.status_code != status.HTTP_201_CREATED:
                        errors.append('Array {}, error: {}'.format(
                            array_index + 1, json.loads(solar_array_ret.content)['errors'][0]))
                        arrays_with_errors.append(array_index)
        if errors:
            return HttpResponse(json.dumps({"errors": errors}), status=status.HTTP_400_BAD_REQUEST)
        return ret

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET', 'PUT', 'DELETE'])
def system(request, system_id):
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
        return HttpResponse(json.dumps({"data": serialize_solar_system(solar_system)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_solar_system(request.data, request.user, solar_system, status.HTTP_200_OK)

    if request.method == "DELETE":
        solar_system.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET'])
def dashboard_view(request, system_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        if request.user.is_staff:
            solar_system = SolarSystem.objects.get(pk=system_id)
        else:
            solar_system = SolarSystem.objects.get(
                user=request.user, pk=system_id)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        # Do API call
        requested_date = request.query_params.get('date_str')
        period = request.query_params.get('period')
        expected_production = _get_solar_system_expected_production(
            solar_system, requested_date, period)
        (actual_production, output_json) = _get_solar_system_actual_production_and_output(
            solar_system, solar_system.api_name, requested_date, period)
        if solar_system.money_rate_object:
            vep_per_hour = _get_solar_system_vep(
                solar_system.money_rate_object, output_json, requested_date, period)
        else:
            vep_per_hour = [0] * len(expected_production['values'])
        system_data = {'expected_production': expected_production,
                       'value_of_energy_produced': vep_per_hour,
                       'actual_production': actual_production}
        return HttpResponse(json.dumps({"data": system_data}), status=status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
