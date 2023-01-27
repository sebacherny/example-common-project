import unittest
import requests
import os

LOCAL_PVWATTS_API_KEY = None

if __name__ == "__main__":
    LOCAL_PVWATTS_API_KEY = os.environ['PVWATTS_API_KEY']
    MONTHS_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
else:
    from django_files.settings import PVWATTS_API_KEY
    LOCAL_PVWATTS_API_KEY = PVWATTS_API_KEY
    from app.models import ClientInfo
    from django_files.settings import MONTHS_NAMES, DAYS_PER_MONTH


REQUEST_URL = 'https://developer.nrel.gov/api/pvwatts/v6.json'


def get_pvwatts_info(tilt, azimuth, system_capacity,
                     module_type=0, losses=14,
                     array_type=1, address=None,
                     lat=None, lon=None,
                     dataset=None, radius=None, timeframe="hourly",
                     dc_ac=None, inv_eff=None):  # Unused? n_Optimizers,
    params = {
        'api_key': LOCAL_PVWATTS_API_KEY,
        'system_capacity': system_capacity,
        'module_type': module_type,
        'losses': losses,
        'array_type': array_type,
        'tilt': tilt,
        'azimuth': azimuth,
        'timeframe': timeframe,
    }
    if address:
        params['address'] = address
    elif lat is not None and lon is not None:
        params['lat'] = lat
        params['lon'] = lon
    else:
        params['address'] = 'TESTE SEM RETORNO'
    js = requests.get(REQUEST_URL, params=params).json()
    for k in ['inputs', 'errors', 'warnings', 'version', 'ssc_info', 'station_info']:
        print(k, js[k])
    return js


def _get_monthly_json(i, pvwatts_info):
    days_before_1 = sum(DAYS_PER_MONTH[:i])
    ret = {'total': {'unit': 'kWh',
                     'value': pvwatts_info["outputs"]["ac_monthly"][i]}}
    month_total = 0
    for day in range(DAYS_PER_MONTH[i]):
        days_before = days_before_1 + day
        ret[str(day + 1)] = {}
        day_total = 0
        for hh in range(24):
            hour_watts = pvwatts_info["outputs"]['ac'][days_before * 24 + hh]
            if hour_watts:
                ret[str(day+1)][str(hh)] = {'unit': 'Wh', 'value': hour_watts}
                day_total += hour_watts
        ret[str(day + 1)]['total'] = {'unit': 'Wh', 'value': day_total}
        month_total += day_total
    # The added total comes from the sum of every hour of every day and should be equal to the total value
    ret['added_total'] = {'unit': 'kWh', 'value': month_total / 1000.}
    return ret


def get_treated_pvwatts_response(solar_array, address=None, monitor_id=None):
    if address is None:
        try:
            client_info = ClientInfo.objects.get(
                user_id=monitor_id or solar_array.system.monitor_id)
            location_city_or_zip = client_info.location_city or client_info.location_zip_code
            location_state = client_info.location_state
        except:
            location_city_or_zip = solar_array.system.location_city or solar_array.system.location_zip
            location_state = solar_array.system.location_state
        address = "{}, {}".format(location_city_or_zip, location_state)
    pvwatts_info = get_pvwatts_info(solar_array.tilt_angle, solar_array.azimuth,
                                    solar_array.module_capacity * solar_array.number_of_modules,
                                    address=address,
                                    array_type=solar_array.array_type,
                                    module_type=solar_array.module_type,
                                    losses=solar_array.losses)
    if pvwatts_info["errors"]:
        raise Exception(pvwatts_info["errors"][0])
    assert len(pvwatts_info['outputs']['ac']) == 365 * 24
    output_json = {'ac_annual': {'unit': 'kWh', 'value': pvwatts_info["outputs"]["ac_annual"]},
                   'ac_monthly': {MONTHS_NAMES[i]: _get_monthly_json(i, pvwatts_info) for i in range(12)}}
    # The added annual comes from the sum of every month and should be equal to the total value in ac_annual
    output_json['added_annual'] = {'unit': 'kWh', 'value': sum([output_json['ac_monthly'][MONTHS_NAMES[i]]['total']['value']
                                                                for i in range(12)])}
    # assert pvwatts_info['outputs']['ac'][ (sum(DAYS[:9]) + 9) * 24: (sum(DAYS[:9]) + 10) * 24 ]
    return output_json


def get_day_hourly_average(treated_output, requested_date):
    # requested_date yyyy-mm-dd
    month_index = int(requested_date[5:7]) - 1
    month = MONTHS_NAMES[month_index]
    average_hours = [0] * 24
    for (day, day_info) in treated_output['ac_monthly'][month].items():
        if day.isdigit():
            for hour in range(24):
                if str(hour) in day_info:
                    average_hours[hour] += (day_info[str(hour)]['value'] / (
                        1000. if day_info[str(hour)]['unit'] == 'Wh' else 1))
    for hour in range(24):
        average_hours[hour] /= DAYS_PER_MONTH[month_index]
    return average_hours


def get_month_daily_average(treated_output, requested_date):
    # requested_date yyyy-mm-dd
    month_index = int(requested_date[5:7]) - 1
    month = MONTHS_NAMES[month_index]
    average_days = [None] * DAYS_PER_MONTH[month_index]
    for (day, day_info) in treated_output['ac_monthly'][month].items():
        if day.isdigit():
            average_days[int(day) - 1] = (day_info['total']['value'] /
                                          (1000. if day_info['total']['unit'] == 'Wh' else 1))
    return average_days


def get_year_monthly_average(treated_output):
    months_mep = [None] * 12
    for (month, month_info) in treated_output['ac_monthly'].items():
        if month in MONTHS_NAMES:
            month_index = MONTHS_NAMES.index(month)
            months_mep[month_index] = (
                month_info['total']['value'] / (1000. if month_info['total']['unit'] == 'Wh' else 1))
    return months_mep


class Object(object):
    pass


class SolarArrayTest(object):

    def __init__(self, azimuth, tilt, capacity, address, losses):
        inverter = Object()
        inverter.system = Object()
        inverter.system.location_latitude = None
        inverter.system.location_longitude = None
        inverter.system.location_address = "Santa Barbara, CA"
        self.azimuth = azimuth
        self.tilt_angle = tilt
        self.module_capacity = capacity
        self.number_of_modules = 1
        self.inverter = inverter
        self.address = address
        self.losses = losses
        self.array_type = 1
        self.module_type = 0


class PVWattsTest(unittest.TestCase):

    def test_get_day_hourly_average(self):
        output_json = get_treated_pvwatts_response(SolarArrayTest(180, 18, 3 * 26,
                                                                  "Santa Barbara, CA", 14),
                                                   "Santa Barbara, CA")
        print(get_day_hourly_average(output_json, "2022-10-12"))
        print(get_month_daily_average(output_json, "2022-10-12"))
        print(get_year_monthly_average(output_json))

    def test_compare_month_value_with_sum(self):
        AZIMUTHS = [180]
        TILTS = [18]
        CAPACITIES = [8000]
        ADDRESSES = ["Santa Barbara, CA"]
        LOSSES_LIST = [14]
        for azimuth in AZIMUTHS:
            for tilt in TILTS:
                for capacity in CAPACITIES:
                    for address in ADDRESSES:
                        for losses in LOSSES_LIST:
                            output_json = get_treated_pvwatts_response(SolarArrayTest(azimuth, tilt, capacity,
                                                                                      address, losses),
                                                                       "Santa Barbara, CA")
                            self.assertTrue(
                                abs(output_json["added_annual"]["value"] - output_json["ac_annual"]["value"]) < 1)
                            self.assertEqual(
                                output_json["added_annual"]["unit"], output_json["ac_annual"]["unit"])
                            self.assertEqual(
                                output_json["added_annual"]["unit"], "kWh")
                            for i in range(12):
                                self.assertTrue(
                                    abs(output_json["ac_monthly"][MONTHS_NAMES[i]]["added_total"]["value"] -
                                        output_json["ac_monthly"][MONTHS_NAMES[i]]["total"]["value"]) < 1
                                )
                                self.assertEqual(
                                    output_json["ac_monthly"][MONTHS_NAMES[i]]["added_total"]["unit"], "kWh")
                                self.assertEqual(
                                    output_json["ac_monthly"][MONTHS_NAMES[i]]["total"]["unit"], "kWh")
                                self.assertEqual(sorted(list(output_json["ac_monthly"][MONTHS_NAMES[i]].keys())),
                                                 sorted([str(j+1) for j in range(DAYS_PER_MONTH[i])] + ['added_total', 'total']))
                            jan_1_day = get_day_hourly_average(
                                output_json, '2022-01-01')
                            self.assertEqual(len(jan_1_day), 24)
                            self.assertEqual(jan_1_day[0], 0)
                            self.assertEqual(jan_1_day[1], 0)
                            self.assertEqual(jan_1_day[-2], 0)
                            self.assertEqual(jan_1_day[-1], 0)
                            january = get_month_daily_average(
                                output_json, '2022-01-01')
                            self.assertEqual(len(january), 31)
                            february = get_month_daily_average(
                                output_json, '2022-02-01')
                            self.assertEqual(len(february), 28)


if __name__ == "__main__":
    unittest.main()
