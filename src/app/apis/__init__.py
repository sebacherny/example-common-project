import datetime
from django_files.settings import DAYS_PER_MONTH


def add_individual_values_to_json(ret,
                                  values_list,
                                  get_date_obj_from_value,
                                  get_energy_from_value):
    for value in values_list:
        if not get_energy_from_value(value):
            continue
        date_obj = get_date_obj_from_value(value)
        year = str(date_obj.year)
        month = str(date_obj.month)
        day = str(date_obj.day)
        hour = str(date_obj.hour)
        if not year in ret:
            ret[year] = {}
        if not month in ret[year]:
            ret[year][month] = {}
        if not day in ret[year][month]:
            ret[year][month][day] = {}
        if not hour in ret[year][month][day]:
            ret[year][month][day][hour] = 0
        energy = get_energy_from_value(value)
        ret[year][month][day][hour] += energy

        if not 'total' in ret[year]:
            ret[year]['total'] = 0
        if not 'total' in ret[year][month]:
            ret[year][month]['total'] = 0
        if not 'total' in ret[year][month][day]:
            ret[year][month][day]['total'] = 0
        ret[year]['total'] += energy
        ret[year][month]['total'] += energy
        ret[year][month][day]['total'] += energy


def get_aep_day(treated_output, requested_date):
    # requested_date yyyy-mm-dd
    year = (requested_date[:4])
    month = str(int(requested_date[5:7]))
    day = str(int(requested_date[8:]))
    hours_array = [0] * 24
    day_json = treated_output.get(year, {}).get(month, {}).get(day, {})
    for hour in range(24):
        if str(hour) in day_json:
            hours_array[hour] = day_json[str(hour)] / 1000.
    return hours_array


def get_aep_month(treated_output, requested_date):
    # requested_date yyyy-mm-dd
    year = (requested_date[:4])
    month = str(int(requested_date[5:7]))
    month_json = treated_output.get(year, {}).get(month, {})
    days_array = [0] * DAYS_PER_MONTH[int(month) - 1]
    if month == "2" and int(year) % 4 == 0 and int(year) % 400 != 0:
        days_array.append(0)
    for day in month_json:
        if day.isdigit():
            days_array[int(day) - 1] = month_json[day]['total'] / 1000.
    return days_array


def get_aep_year(treated_output, requested_date):
    months_array = [0] * 12
    year = (requested_date[:4])
    year_json = treated_output.get(year, {})
    for month in year_json:
        if month.isdigit():
            months_array[int(month) - 1] = year_json[month]['total'] / 1000.
    return months_array


def store_past_hourly_production(solar_system, date_from=None, date_to=None, aep_object=None, obtain_past_hourly_production=None):
    site_id = solar_system.monitor_id
    past_hourly_production = obtain_past_hourly_production(site_id, date_from=date_from, date_to=date_to,
                                                           initial_json=aep_object.output)
    aep_object.solar_system = solar_system
    aep_object.output = past_hourly_production
    aep_object.save()
    return aep_object


def map_contains_date(ret, date_obj):
    return str(date_obj.day) in ret.get(str(date_obj.year), {}).get(str(date_obj.month), {})


def obtain_past_hourly_production_enphase_or_solar_edge(site_id, date_from=None, date_to=None, initial_json=None,
                                                        get_installation_date_from_api=None,
                                                        get_energy_values=None,
                                                        days_window=None,
                                                        get_date_obj_from_value=None, get_energy_from_value=None):
    ret = initial_json or {}
    if not site_id:
        return ret
    conn, token = None, None
    installation_date = datetime.datetime.strptime(
        get_installation_date_from_api(site_id, conn, token), '%Y-%m-%d')
    starting_date = datetime.datetime(installation_date.year,
                                      installation_date.month,
                                      installation_date.day)
    if date_from:
        starting_date = max(date_from, installation_date)
    if date_to:
        ending_date = date_to
    else:
        ending_date = datetime.datetime.now()
    iterative_date = starting_date
    print("START", iterative_date)
    print("END", ending_date)
    energy_unit = None
    while iterative_date <= ending_date:
        while iterative_date <= ending_date and map_contains_date(ret, iterative_date):
            iterative_date = iterative_date + datetime.timedelta(days=1)
        print(iterative_date)
        if iterative_date > ending_date:
            break
        # assert energy["energyDetails"]["meters"][0]["type"] == "Production", energy["energyDetails"]["meters"][0]["type"]
        (unit, energy_values, new_conn, new_token) = get_energy_values(
            site_id, iterative_date, conn, token)
        conn = new_conn
        token = new_token
        if energy_unit:
            assert energy_unit == unit
        else:
            energy_unit = unit
        add_individual_values_to_json(
            ret, energy_values, get_date_obj_from_value, get_energy_from_value)
        iterative_date += datetime.timedelta(days=days_window)
    if ret:
        ret['unit'] = energy_unit
    if conn is not None:
        conn.close()
    return ret


def store_client_in_db(client_info_object, site, api_name):
    assert api_name in ("Enphase", "SolarEdge")
    client_info_object.date_added = datetime.datetime.now()
    client_info_object.name = site["name"]
    if api_name == "Enphase":
        client_info_object.account_id = 0
        client_info_object.user_id = site["system_id"]
        client_info_object.installation_date = datetime.datetime.fromtimestamp(
            site["operational_at"])
        address_json = site["address"]
        client_info_object.location_zip_code = address_json["postal_code"]
    else:
        client_info_object.account_id = site["accountId"]
        client_info_object.user_id = site["id"]
        client_info_object.installation_date = site["installationDate"]
        address_json = site["location"]
        client_info_object.location_zip_code = address_json["zip"]
    client_info_object.location_country = address_json["country"]
    client_info_object.location_state = address_json["state"]
    client_info_object.location_city = address_json.get("city", "")
    client_info_object.location_address = address_json.get(
        "address", "")
    client_info_object.api_name = api_name
    client_info_object.status = site["status"]
    client_info_object.primary_module = site.get("primaryModule", {})
    client_info_object.save()
    return client_info_object
