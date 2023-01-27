import datetime
import json
import http.client as _http
import unittest
import os

from app.apis import obtain_past_hourly_production_enphase_or_solar_edge, store_client_in_db

LOCAL_ENPHASE_API_KEY = None
LOCAL_ENPHASE_KEY = None
LOCAL_ENPHASE_PASSWORD = None
LOCAL_ENPHASE_USERNAME = None

if __name__ == "__main__":
    LOCAL_ENPHASE_API_KEY = os.environ['ENPHASE_API_KEY']
    LOCAL_ENPHASE_KEY = os.environ['ENPHASE_KEY']
    LOCAL_ENPHASE_PASSWORD = os.environ['ENPHASE_PASSWORD']
    LOCAL_ENPHASE_USERNAME = os.environ['ENPHASE_USERNAME']
else:
    from django_files.settings import ENPHASE_API_KEY, ENPHASE_KEY, ENPHASE_PASSWORD, ENPHASE_USERNAME
    LOCAL_ENPHASE_API_KEY = ENPHASE_API_KEY
    LOCAL_ENPHASE_KEY = ENPHASE_KEY
    LOCAL_ENPHASE_PASSWORD = ENPHASE_PASSWORD
    LOCAL_ENPHASE_USERNAME = ENPHASE_USERNAME
    from app.models import ClientInfo


ALL_SYSTEMS_PATH = '/api/v4/systems/?key={}'
ONE_SYSTEM_PATH = '/api/v4/systems/{}/?key={}&size=1'
DEVICES_PATH = '/api/v4/systems/{}/devices/?key={}'
MICRO_DATA_PATH = '/api/v4/systems/{}/telemetry/production_micro/?key={}&start_date={}&granularity={}'
MICRO_TELEMETRY_PATH = '/api/v4/systems/{}/devices/micros/{}/telemetry/?key={}&start_date={}&granularity={}'


def get_enphase_conn_object():
    return _http.HTTPSConnection("api.enphaseenergy.com")


def get_enphase_token(conn):
    payload = ''
    header = {'Authorization': 'Basic {}'.format(LOCAL_ENPHASE_API_KEY),
              'Accept': 'application/json'}
    conn.request("POST",
                 "/oauth/token?grant_type=password&username={}&password={}".format(LOCAL_ENPHASE_USERNAME,
                                                                                   LOCAL_ENPHASE_PASSWORD),
                 payload, header)
    res = conn.getresponse()
    data = res.read()
    temp = data.decode('utf-8')
    json_token = json.loads(temp)
    return json_token['access_token']


def get_enphase_user_info(conn, token, user_id):
    payload = ''
    header = {'Authorization': 'Bearer ' + token,
              'Accept': 'application/json'}
    conn.request("GET",
                 ONE_SYSTEM_PATH.format(user_id, LOCAL_ENPHASE_KEY),
                 payload, header)
    res = conn.getresponse()
    data = res.read()
    json_data = json.loads(data.decode('utf-8'))
    return json_data
# {'system_id': 3530328, 'name': 'Mackall', 'public_name': 'Residential System',
# 'timezone': 'US/Pacific', 'address': {'state': 'CA', 'country': 'US', 'postal_code': '93108'},
# 'connection_type': 'wifi', 'status': 'normal', 'last_report_at': 1666865096, 'last_energy_at': 1666864800,
# 'operational_at': 1664577000, 'attachment_type': None, 'interconnect_date': None, 'energy_lifetime': 99551,
# 'energy_today': 0, 'system_size': None}


def get_enphase_all_users_info(conn, token):
    payload = ''
    header = {'Authorization': 'Bearer ' + token,
              'Accept': 'application/json'}
    conn.request("GET",
                 ALL_SYSTEMS_PATH.format(LOCAL_ENPHASE_KEY),
                 payload, header)
    res = conn.getresponse()
    data = res.read()
    json_data = json.loads(data.decode('utf-8'))
    return json_data["systems"]


def retrieve_all_enphase_users():
    conn = get_enphase_conn_object()
    token = get_enphase_token(conn)
    return get_enphase_all_users_info(conn, token)


def retrieve_one_enphase_user(user_id):
    conn = get_enphase_conn_object()
    token = get_enphase_token(conn)
    return get_enphase_user_info(conn, token, user_id)


def get_enphase_user_devices(conn, token, user_id):
    payload = ''
    header = {'Authorization': 'Bearer ' + token,
              'Accept': 'application/json'}
    conn.request("GET",
                 DEVICES_PATH.format(user_id, LOCAL_ENPHASE_KEY),
                 payload, header)
    res = conn.getresponse()
    data = res.read()
    json_data = json.loads(data.decode('utf-8'))
    return json_data.get("devices", {})


def get_week_micro_data(conn, token, system_id, start_date, granularity="week"):
    # start_date like 2022-10-20
    payload = ''
    headers = {
        'Authorization':  'Bearer ' + token,
        'Accept': 'application/json'
    }
    conn.request("GET", MICRO_DATA_PATH.format(system_id, LOCAL_ENPHASE_KEY, str(start_date), granularity),
                 payload, headers)
    res = conn.getresponse()
    data = res.read()
    temp = data.decode('utf-8')
    json_prod_micro = json.loads(temp)
    return json_prod_micro


def get_device_telemetry(conn, token, system_id, serial_number, start_date, granularity='day'):
    # start_at like 2022-10-20
    payload = ''
    headers = {
        'Authorization':  'Bearer ' + token,
        'Accept': 'application/json'
    }
    conn.request("GET", MICRO_TELEMETRY_PATH.format(system_id, serial_number, LOCAL_ENPHASE_KEY, str(start_date), granularity),
                 payload, headers)
    res = conn.getresponse()
    data = res.read()
    temp = data.decode('utf-8')
    json_prod_micro = json.loads(temp)
    return json_prod_micro

# get the last two years data of energy production for a specific account


def get_user_inverters(user_id):
    conn = get_enphase_conn_object()
    token = get_enphase_token(conn)
    devices = get_enphase_user_devices(conn, token, user_id)
    return devices.get("micros", [])


def get_user_inventory(user_id):
    conn = get_enphase_conn_object()
    token = get_enphase_token(conn)
    return get_enphase_user_devices(conn, token, user_id)


def create_enphase_users_from_bulk():
    sites = retrieve_all_enphase_users()
    for site in sites:
        try:
            client_info_object = ClientInfo.objects.filter(
                user_id=site["system_id"])[0]
        except IndexError:
            client_info_object = ClientInfo()
        store_client_in_db(client_info_object, site, "Enphase")


def obtain_past_hourly_production_enphase(site_id, date_from=None, date_to=None, initial_json=None):
    def get_installation_date_from_api(site_id, conn, token):
        try:
            return datetime.datetime.strftime(ClientInfo.objects.get(
                user_id=site_id).installation_date, '%Y-%m-%d')
        except:
            if conn is None:
                conn = get_enphase_conn_object()
            if token is None:
                token = get_enphase_token(conn)
            return datetime.datetime.strftime(
                datetime.datetime.fromtimestamp(
                    get_enphase_user_info(conn, token, site_id)['operational_at']), '%Y-%m-%d')

    def get_energy_values(user_id, iterative_date, conn, token):
        if conn is None:
            conn = get_enphase_conn_object()
        if token is None:
            token = get_enphase_token(conn)
        micro_data = get_week_micro_data(
            conn, token, user_id, iterative_date.strftime("%Y-%m-%d"))
        return ('Wh', micro_data.get("intervals", []), conn, token)

    def get_date_obj_from_value(value):
        return datetime.datetime.fromtimestamp(value["end_at"])

    def get_energy_from_value(value):
        return value['enwh']

    days_window = 7
    return obtain_past_hourly_production_enphase_or_solar_edge(site_id, date_from, date_to, initial_json,
                                                               get_installation_date_from_api,
                                                               get_energy_values,
                                                               days_window,
                                                               get_date_obj_from_value, get_energy_from_value)


class EphaseTest(unittest.TestCase):

    def test_request(self):
        conn = get_enphase_conn_object()
        token = get_enphase_token(conn)
        all_users = get_enphase_all_users_info(conn, token)
        print("Information for one user FROM BULK:")
        print(all_users[0])
        print("---------")
        print("---------")
        user_id = 162814
        user = get_enphase_user_info(conn, token, user_id)
        print("Information for just one user ({})".format(user_id))
        print(user)
        print("---------")
        print("---------")
        print("ALL DEVICES for user {}".format(user_id))
        devices = get_enphase_user_devices(conn, token, user_id)
        print(devices)
        print("---------")
        print("---------")
        # print("---------")
        for granularity in ["week", "day", "15mins"]:
            print("GETTING INFORMATION WITH GRANULARITY={}".format(granularity))
            micro_data = get_week_micro_data(
                conn, token, user_id, start_date="2022-12-01", granularity=granularity)
            print("Telemetry production micro for system {} (total of {} intervals). Start date {}, end date {}".format(
                user_id, len(micro_data['intervals']),
                micro_data['start_date'], micro_data['end_date']))
            print(micro_data)
            print("---------")
            print("---------")
            serial_number = "121249000855"
            telemetry_for_device = get_device_telemetry(
                conn, token, user_id, serial_number, start_date="2022-12-01", granularity=granularity)
            if telemetry_for_device.get('code') != 422:
                print("Telemetry for system {}, device {} (total of {} intervals). Start date {}, end date {}".format(
                    user_id, serial_number, len(
                        telemetry_for_device.get('intervals', [])),
                    telemetry_for_device['start_date'], telemetry_for_device['end_date']
                ))
            print(telemetry_for_device)
            print("---------")
            print("---------")
        conn.close()

    def test_get_historic_data(self):
        site_id = 162814
        datetime_now = datetime.datetime.now()
        for date_from in [None, datetime_now, datetime_now - datetime.timedelta(days=10)]:
            for date_to in ([None, datetime_now, datetime_now - datetime.timedelta(days=10)] if date_from else [None]):
                initial_jsons = [None]
                if date_from:
                    initial_jsons.append({})
                    initial_jsons.append(
                        {str(date_from.year): {str(date_from.month): {str(date_from.day): {'0': 10}}}})
                for initial_json in initial_jsons:
                    production_json = obtain_past_hourly_production_enphase(site_id, date_from=date_from,
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

    def test_two_requests_start_at(self):
        conn = get_enphase_conn_object()
        token = get_enphase_token(conn)
        user_id = 162814
        payload = ''
        headers = {
            'Authorization':  'Bearer ' + token,
            'Accept': 'application/json'
        }
        production_micro_path = '/api/v4/systems/{}/telemetry/production_micro/?key={}&start_at={}&granularity={}'
        telemetry_path = '/api/v4/systems/{}/devices/micros/{}/telemetry/?key={}&start_at={}&granularity={}'
        production_micro_start_at = datetime.datetime(
            2022, 12, 5, 9, 12).strftime('%s')
        serial_no = 121249000408
        telemetry_start_at = datetime.datetime(
            2022, 12, 4, 10, 27).strftime('%s')
        conn.request("GET", production_micro_path.format(user_id, LOCAL_ENPHASE_KEY, str(production_micro_start_at), "day"),
                     payload, headers)
        res = conn.getresponse()
        data = res.read()
        temp = data.decode('utf-8')
        json_prod_micro = json.loads(temp)
        print(json_prod_micro)
        print("-----------------------------------\n" * 5)
        conn.request("GET", telemetry_path.format(user_id, serial_no, LOCAL_ENPHASE_KEY, str(telemetry_start_at), "day"),
                     payload, headers)
        res = conn.getresponse()
        data = res.read()
        temp = data.decode('utf-8')
        json_telemetry = json.loads(temp)
        print(json_telemetry)
        print("-----------------------------------\n" * 5)
        conn.close()


if __name__ == "__main__":
    unittest.main(defaultTest="EphaseTest.test_two_requests_start_at")
