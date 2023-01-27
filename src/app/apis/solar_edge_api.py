import datetime
import os
import unittest
import requests
# import matplotlib.pyplot as plt
from app.apis import obtain_past_hourly_production_enphase_or_solar_edge, store_client_in_db

LOCAL_SOLAR_EDGE_API_KEY = None

if __name__ == "__main__":
    LOCAL_SOLAR_EDGE_API_KEY = os.environ['SOLAR_EDGE_API_KEY']
else:
    from django_files.settings import SOLAR_EDGE_API_KEY
    LOCAL_SOLAR_EDGE_API_KEY = SOLAR_EDGE_API_KEY
    from app.models import ClientInfo


BASE_URL = 'https://monitoringapi.solaredge.com'

ALL_SITES_PATH = '/sites/list?&sortProperty=Name&sortOrder=ASC&api_key={}'
SITE_OVERVIEW_PATH = '/site/{}/overview?api_key={}'
SITE_DETAILS_PATH = '/site/{}/details?api_key={}'
SITE_POWER_PATH = '/site/{}/power?startTime={}&endTime={}&api_key={}'
ENERGY_POWER_PATH = '/site/{}/energy?timeUnit={}&startDate={}&endDate={}&api_key={}'
INVENTORY_PATH = '/site/{}/inventory?api_key={}'
SITE_ENERGY_DETAILS_PATH = '/site/{}/energyDetails?startTime={}&endTime={}&meters={}&timeUnit={}&api_key={}'
SITE_POWER_DETAILS_PATH = '/site/{}/powerDetails?startTime={}&endTime={}&meters={}&timeUnit={}&api_key={}'


def get_all_sites_info():
    js = requests.get(
        BASE_URL + ALL_SITES_PATH.format(LOCAL_SOLAR_EDGE_API_KEY)).json()
    return js["sites"]["site"]


"""
List of:
{'id': 318866, 'name': 'Name Surname', 'accountId': 87453,
'status': 'Active', 'peakPower': 18.3, 'lastUpdateTime': '2022-10-17',
'installationDate': '2016-10-21', 'ptoDate': None, 'notes': '',
'type': 'Optimizers & Inverters',
'location': {'country': 'United States', 'state': 'California',
'city': 'City', 'address': 'Street No 1234', 'address2': '',
'zip': '12345', 'timeZone': 'America/Los_Angeles', 'countryCode': 'US', 'stateCode': 'CA'},
'alertQuantity': 4, 'highestImpact': 2,
'primaryModule': {'manufacturerName': 'LG Solar', 'modelName': 'LG300N1K-G4', 'maximumPower': 300.0},
'uris': {'SITE_IMAGE': '/site/318866/siteImage/finallayout.JPG',
'DATA_PERIOD': '/site/318866/dataPeriod', 'DETAILS': '/site/318866/details',
'OVERVIEW': '/site/318866/overview'},
'publicSettings': {'isPublic': False}}
"""


def get_site_overview(site_id):
    js = requests.get(
        BASE_URL + SITE_OVERVIEW_PATH.format(site_id, LOCAL_SOLAR_EDGE_API_KEY)).json()
    return js["overview"]


"""
{'lastUpdateTime': '2022-10-17 22:00:59',
'lifeTimeData': {'energy': 177290608.0},
'lastYearData': {'energy': 24970120.0},
'lastMonthData': {'energy': 1188214.0},
'lastDayData': {'energy': 71444.92},
'currentPower': {'power': 0.0},
'measuredBy': 'INVERTER'}
"""


def get_site_details(site_id):
    js = requests.get(
        BASE_URL + SITE_DETAILS_PATH.format(site_id, LOCAL_SOLAR_EDGE_API_KEY)).json()
    return js["details"]  # Same individual object as in all sites info


def get_site_power(site_id, date_start, date_end):
    js = requests.get(BASE_URL + SITE_POWER_PATH.format(site_id, date_start.strftime("%Y-%m-%d %H:%M:%S"),
                                                        date_end.strftime("%Y-%m-%d %H:%M:%S"), LOCAL_SOLAR_EDGE_API_KEY)).json()
    return js["power"]
# {'timeUnit': 'QUARTER_OF_AN_HOUR', 'unit': 'W', 'measuredBy': 'INVERTER',
# 'values': [{'date': '2022-09-18 02:30:00', 'value': None}], ...}


def get_site_energy_details(site_id, date_start, end_date, meters="Production", time_unit="HOUR"):
    url = BASE_URL + SITE_ENERGY_DETAILS_PATH.format(site_id,
                                                     date_start.strftime(
                                                         "%Y-%m-%d %H:%M:%S"),
                                                     end_date.strftime(
                                                         "%Y-%m-%d %H:%M:%S"),
                                                     meters, time_unit, LOCAL_SOLAR_EDGE_API_KEY)
    js = requests.get(url).json()
    return js


def get_site_power_details(site_id, date_start, end_date, meters="Production", time_unit="HOUR"):
    js = requests.get(BASE_URL + SITE_POWER_DETAILS_PATH.format(site_id,
                                                                date_start.strftime(
                                                                    "%Y-%m-%d %H:%M:%S"),
                                                                end_date.strftime(
                                                                    "%Y-%m-%d %H:%M:%S"),
                                                                meters, time_unit, LOCAL_SOLAR_EDGE_API_KEY)).json()
    return js


def get_site_energy(site_id, date_start, end_date, time_unit='HOUR'):
    # time_unit: QUARTER_OF_AN_HOUR, HOUR, DAY, WEEK, MONTH, YEAR
    js = requests.get(BASE_URL + ENERGY_POWER_PATH.format(site_id, time_unit,
                                                          date_start.strftime(
                                                              "%Y-%m-%d"),
                                                          end_date.strftime("%Y-%m-%d"), LOCAL_SOLAR_EDGE_API_KEY)).json()
    return js["energy"]
# {'values': [{'date': '2022-09-18 00:00:00', 'value': 85780.06}, ...],
# {'timeUnit': 'DAY', 'unit': 'Wh', 'measuredBy': 'INVERTER'} }


def get_site_inventory(site_id):
    js = requests.get(BASE_URL + INVENTORY_PATH.format(site_id,
                      LOCAL_SOLAR_EDGE_API_KEY)).json()
    return js["Inventory"]
# {'meters': [], 'sensors': [], 'gateways': [], 'batteries': [],
# 'inverters': [{'name': 'Inverter 1', 'manufacturer': 'SolarEdge',
# 'model': 'SE7600A-US002NNU2', 'communicationMethod': 'ETHERNET',
# 'dsp1Version': '1.210.787', 'dsp2Version': '2.52.154',
# 'cpuVersion': '3.1651.0', 'SN': '7F150B4B-EA', 'connectedOptimizers': 30},
# {'name': 'Inverter 2', 'manufacturer': 'SolarEdge', 'model': 'RSE7600A-US',
# 'communicationMethod': 'ETHERNET', 'dsp1Version': '1.210.1428', 'dsp2Version': '2.52.507',
# 'cpuVersion': '3.2525.0', 'SN': 'BF105FD3-01', 'connectedOptimizers': 31}]}


def get_site_array_data(site_id, inverter_serial_number):
    # URL: /equipment/{siteId} /{serialNumber}/data
    pass


def create_solar_edge_users_from_bulk():
    sites = get_all_sites_info()
    for site in sites:
        try:
            client_info_object = ClientInfo.objects.filter(user_id=site["id"])[
                0]
        except IndexError:
            client_info_object = ClientInfo()
        store_client_in_db(client_info_object, site, "SolarEdge")


def obtain_past_hourly_production_solar_edge(site_id, date_from=None, date_to=None, initial_json=None):
    def get_installation_date_from_api(site_id, _conn, _token):
        try:
            return datetime.datetime.strftime(
                ClientInfo.objects.get(user_id=site_id).installation_date, '%Y-%m-%d')
        except:
            return get_site_details(site_id)['installationDate']

    def get_energy_values(site_id, iterative_date, conn, token):
        energy = get_site_energy(
            site_id, iterative_date, iterative_date + datetime.timedelta(days=30))
        return (energy['unit'], energy['values'], conn, token)
    days_window = 31

    def get_date_obj_from_value(value):
        return datetime.datetime.strptime(value['date'], '%Y-%m-%d %H:%M:%S')

    def get_energy_from_value(value):
        return value.get('value')
    return obtain_past_hourly_production_enphase_or_solar_edge(site_id, date_from, date_to, initial_json,
                                                               get_installation_date_from_api,
                                                               get_energy_values,
                                                               days_window,
                                                               get_date_obj_from_value, get_energy_from_value)


class SolarEdgeTest(unittest.TestCase):

    def test_obtain_treated_aep(self):
        print(get_site_energy_details(3125744,
                                      datetime.datetime.now() - datetime.timedelta(days=1),
                                      datetime.datetime.now()))
        print(get_site_power_details(3125744,
                                     datetime.datetime.now() - datetime.timedelta(days=10),
                                     datetime.datetime.now()))
        # print(get_site_power(2493150, datetime.datetime.now() - datetime.timedelta(days=10), datetime.datetime.now()))
        js = obtain_past_hourly_production_solar_edge(
            3125744, date_from=datetime.datetime.now() - datetime.timedelta(days=65))
        self.assertEqual(js["unit"], "Wh")
        print(js["2022"]["10"]["30"])
        # xs = []
        # ys = []
        # for h, v in js["2022"]["10"]["30"].items():
        #    if h.isdigit():
        #        xs.append(int(h))
        #        ys.append(v)
        # plt.plot(xs, ys)
        # plt.show()
        # print(js)

    def test_request(self):
        print(get_all_sites_info())
        # print(get_site_details(1413416))
        print("Start test request")
        for site_id in [2493150]:
            print("TEST FOR SITE ID", site_id)
            print(get_site_details(site_id))
            print(get_site_inventory(site_id))
            print("-" * 20)
            datetime_now = datetime.datetime.now()
            for date_from in [None, datetime_now, datetime_now - datetime.timedelta(days=10)]:
                for date_to in ([None, datetime_now, datetime_now - datetime.timedelta(days=10)] if date_from else [None]):
                    initial_jsons = [None]
                    if date_from:
                        initial_jsons.append({})
                        initial_jsons.append(
                            {str(date_from.year): {str(date_from.month): {str(date_from.day): {'0': 10}}}})
                    for initial_json in initial_jsons:
                        production_json = obtain_past_hourly_production_solar_edge(site_id, date_from=date_from,
                                                                                   date_to=date_to, initial_json=initial_json)
                        print("Date from = {}, date to = {}, initial_json = {}".format(
                            date_from, date_to, initial_json))
                        if date_from:
                            if (date_to and date_to < date_from) or date_from == datetime_now:
                                self.assertEqual(
                                    production_json, initial_json or {})
                            else:
                                print(production_json[str(date_from.year)][str(
                                    date_from.month)][str(date_from.day)])
                        else:
                            print(production_json['2022'])
        energy = get_site_energy(1413416,
                                 datetime.datetime.strptime(
                                     '2020-12-30', '%Y-%m-%d'),
                                 datetime.datetime.strptime('2021-01-10', '%Y-%m-%d'),)
        # print(energy)
        # print(info)


if __name__ == "__main__":
    unittest.main()
