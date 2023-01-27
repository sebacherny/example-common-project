import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_files.settings')
django.setup()


from app.apis.enphase_api import obtain_past_hourly_production_enphase
from app.apis.solar_edge_api import obtain_past_hourly_production_solar_edge
from app.apis import store_past_hourly_production
from app.models import SolarSystem, SystemActualEnergyProduction, ClientInfo
import datetime
import schedule
import time



def _get_function_to_obtain_historic_production(api):
    if api == "Enphase":
        return obtain_past_hourly_production_enphase
    else:
        return obtain_past_hourly_production_solar_edge


def job():
    print("Running daily routine at {}".format(datetime.datetime.now()))
    date_from = datetime.datetime.now() - datetime.timedelta(days=2)
    date_to = datetime.datetime.now()
    for solar_system in SolarSystem.objects.all():
        print("Running for solar system {} at {}".format(
            solar_system, datetime.datetime.now()))
        aep_object = SystemActualEnergyProduction.objects.filter(
            solar_system=solar_system)
        api_name = solar_system.api_name
        store_past_hourly_production(solar_system, date_from=date_from, date_to=date_to,
                                     aep_object=aep_object[0] if aep_object else SystemActualEnergyProduction(
                                         output={}),
                                     obtain_past_hourly_production=_get_function_to_obtain_historic_production(api_name))
    print("Finished running daily jobs at {}".format(datetime.datetime.now()))
    print("-" * 20)


schedule.every(1).days.at("00:02").do(job)

while True:
    schedule.run_pending()
    time.sleep(10)
