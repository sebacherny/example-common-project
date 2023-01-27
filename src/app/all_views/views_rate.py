from random import randint
import uuid
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from app.models import UtilityRate
import json


MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December']


def serialize_rate(t):
    ret = model_to_dict(t)
    return ret


def serialize_rate_for_table(r):
    ret = model_to_dict(r)
    ret['utility_name'] = {
        'value': ret['utility_name'], 'redirect_link': '/rate-creation'}
    ret['rate_name'] = {'value': ret['rate_name'],
                        'redirect_link': '/rate-creation'}
    for period_idx in range(3):
        if period_idx < len(r.rate_structure):
            period = r.rate_structure[period_idx]
            ret['period_' + str(period_idx + 1)] = MONTHS[int(period['month_from'])] + \
                ' -> ' + MONTHS[int(period['month_to'])]
        else:
            ret['period_' + str(period_idx + 1)] = ""
    print(ret)
    return ret


def save_rate(data, rate, success_status):
    errors = []
    utility_name = data.get("utilityName", "")
    rate_name = data.get("rateName", "")
    rate_structure = data.get("information", [])
    if utility_name == "":
        errors.append("Field utilityName is required")
    if rate_name == "":
        errors.append("Field rateName is required")
    if not isinstance(rate_structure, list):
        errors.append("Field rate_structure must be a list with periods")
    else:
        months_in_periods_weekdays = [0] * 12
        months_in_periods_weekends = [0] * 12
        for period_idx, period in enumerate(rate_structure):
            if not isinstance(period, dict):
                errors.append(
                    "Period {}: Must be dictionary".format(period_idx + 1))
            elif not "month_from" in period or period.get("month_from") == "null":
                errors.append(
                    "Period {}: Incorrect month_from".format(period_idx + 1))
            elif not "month_to" in period or period.get("month_to") == "null":
                errors.append(
                    "Period {}: Incorrect month_to".format(period_idx + 1))
            else:
                other_period = [p for p_idx, p in enumerate(rate_structure) if p_idx != period_idx and p['month_from'] ==
                                period['month_from'] and p['month_to'] == period['month_to'] and p['is_exception'] != period['is_exception']]
                if other_period:
                    is_weekday = not period['is_exception']
                    is_weekend = period['is_exception']
                else:
                    is_weekday = True
                    is_weekend = True
                    if period['is_exception']:
                        errors.append(
                            "Period {}: if it is an exception, add same period for weekdays".format(period_idx + 1))
                rate_structure[period_idx]['is_weekday'] = is_weekday
                rate_structure[period_idx]['is_weekend'] = is_weekend
                mm = int(period['month_from'])
                while mm <= int(period['month_to']) + (12 if int(period['month_to']) < int(period['month_from']) else 0):
                    if is_weekday:
                        months_in_periods_weekdays[mm % 12] += 1
                    if is_weekend:
                        months_in_periods_weekends[mm % 12] += 1
                    mm += 1
                if sorted(map(int, period.get("hourly_rate", {}).keys())) != list(range(24)):
                    errors.append(
                        "Period {}: All hours must be given for every period".format(period_idx + 1))
                else:
                    bad_values = False
                    for hour in period.get("hourly_rate", {}):
                        try:
                            float(period["hourly_rate"][hour])
                        except:
                            bad_values = True
                    if bad_values:
                        errors.append(
                            "Period {}: All hours must be numeric".format(period_idx + 1))
        if months_in_periods_weekdays != [1] * 12 or months_in_periods_weekends != [1] * 12:
            errors.append(
                "All months must appear in exactly one period, for both weekdays and weekends")

    if len(UtilityRate.objects.filter(utility_name=utility_name,
                                      rate_name=rate_name)) > 0 and not rate.id:
        errors.append(
            "A rate with that utility name and rate name already exists")
    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)
    try:
        rate.utility_name = utility_name
        rate.rate_name = rate_name
        rate.rate_structure = rate_structure
        rate.save()
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": [str(e)]
            }), status=status.HTTP_400_BAD_REQUEST)

    return HttpResponse(json.dumps({"data": serialize_rate(rate)}), status=success_status)


@api_view(['GET', 'POST', 'PUT'])
def rates(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        rates = UtilityRate.objects.all()
        rates = [serialize_rate(rate) for rate in rates]
        return HttpResponse(json.dumps({"data": rates}), status=status.HTTP_200_OK)

    if request.method == "POST":
        rate = UtilityRate()
        return save_rate(request.data, rate, status.HTTP_201_CREATED)
    if request.method == "PUT":
        try:
            rate = UtilityRate.objects.get(utility_name=request.data.get("utilityName", ""),
                                           rate_name=request.data.get("rateName", ""))
        except:
            return HttpResponse(json.dumps({"errors": ["Rate object to edit does not exist"]}), status=status.HTTP_400_BAD_REQUEST)
        return save_rate(request.data, rate, status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET', 'PUT', 'DELETE'])
def rate(request, rate_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        rate_obj = UtilityRate.objects.get(pk=rate_id)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return HttpResponse(json.dumps({"data": serialize_rate(rate_obj)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_rate(request.data, rate_obj, status.HTTP_200_OK)

    if request.method == "DELETE":
        rate_obj.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
