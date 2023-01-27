from django.db import models
from django.contrib.auth.models import AbstractUser

from django.contrib import admin


class CustomUser(AbstractUser):
    role = models.CharField(max_length=100)
    payment_type = models.CharField(max_length=100)
    account_balance = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip = models.CharField(max_length=100)
    registration_random_code = models.CharField(max_length=100)

    def __str__(self):
        return "{}{}".format(self.username, " ({} {})".format(self.first_name, self.last_name) if self.first_name or self.last_name else "")

    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'
        ordering = ["id"]


class UtilityRate(models.Model):
    utility_name = models.CharField(max_length=100, blank=False)
    rate_name = models.CharField(max_length=100, blank=False)
    rate_structure = models.JSONField(null=True)

    def __str__(self):
        return "{} - {}".format(
            self.utility_name, self.rate_name
        )

    class Meta:
        ordering = ["id"]


class SolarSystem(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date_added = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=100, blank=True)
    location_address = models.CharField(max_length=100, blank=True)
    location_longitude = models.FloatField(blank=True, null=True)
    location_latitude = models.FloatField(blank=True, null=True)
    location_city = models.FloatField(blank=True, null=True)
    location_state = models.FloatField(blank=True, null=True)
    location_zip = models.FloatField(blank=True, null=True)
    monitor_id = models.CharField(max_length=100, blank=True)
    total_capacity = models.IntegerField(default=0)
    inverters_count = models.IntegerField(default=0)
    arrays_count = models.IntegerField(default=0)
    money_rate_object = models.ForeignKey(
        UtilityRate, on_delete=models.RESTRICT, null=True, default=None)
    api_name = models.CharField(max_length=100, blank=False)

    def __str__(self):
        return "System {} (monitor {})".format(self.id, self.monitor_id)

    class Meta:
        ordering = ["id"]


class Inverter(models.Model):
    date_added = models.DateField(auto_now_add=True)
    make = models.CharField(max_length=100, blank=False)
    model = models.CharField(max_length=100, blank=False)
    serial_number = models.CharField(max_length=100, blank=False, default="")
    capacity = models.IntegerField(default=0)
    connected_optimizers = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, blank=False, default="")
    part_number = models.CharField(max_length=100, blank=False, default="")
    active = models.BooleanField(default=True)
    system = models.ForeignKey(SolarSystem, on_delete=models.CASCADE)
    arrays_count = models.IntegerField(default=0)

    def __str__(self):
        return "{} {}".format(self.serial_number, self.make)

    class Meta:
        ordering = ["id"]


class SolarArray(models.Model):
    date_added = models.DateField(auto_now_add=True)
    panel_make = models.CharField(max_length=100, blank=False)
    panel_model = models.CharField(max_length=100, blank=True)
    module_capacity = models.IntegerField()
    azimuth = models.IntegerField()
    tilt_angle = models.IntegerField()
    losses = models.IntegerField(default=0)
    module_type = models.IntegerField(default=1)
    array_type = models.IntegerField(default=1)
    number_of_modules = models.IntegerField(default=1)
    shaded_conditions = models.BooleanField(default=False)
    note = models.CharField(max_length=100, blank=False)
    inverter = models.ForeignKey(
        Inverter, on_delete=models.CASCADE, null=True, default=None)
    system = models.ForeignKey(
        SolarSystem, on_delete=models.CASCADE, default=None, null=True)
    last_pvwatts_call = models.DateField(blank=True)
    pvwatts_object_id = models.IntegerField(default=0, blank=True)

    def __str__(self):
        return "{} ({} - {})".format(
            self.id, self.panel_make, self.panel_model
        )

    class Meta:
        ordering = ["id"]


class MicroInverter(models.Model):
    date_added = models.DateField(auto_now_add=True)
    make = models.CharField(max_length=100, blank=False)
    model = models.CharField(max_length=100, blank=False)
    serial_number = models.CharField(max_length=100, blank=False, default="")
    capacity = models.IntegerField(default=0)
    connected_optimizers = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, blank=False, default="")
    part_number = models.CharField(max_length=100, blank=False, default="")
    active = models.BooleanField(default=True)
    system = models.ForeignKey(SolarSystem, on_delete=models.CASCADE)
    array = models.ForeignKey(SolarArray, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return "{} {}".format(self.serial_number, self.make)

    class Meta:
        ordering = ["id"]


class PVWattsArrayInfo(models.Model):
    date_added = models.DateField(auto_now_add=True)
    solar_array = models.ForeignKey(SolarArray, on_delete=models.CASCADE)
    # {ac_annual, ac_monthly: {1: {total, ac_hourly: {0: {unit, value}}}}}
    output = models.JSONField()

    def __str__(self):
        return "Info for Array {}".format(self.solar_array)

    class Meta:
        ordering = ["id"]


class SystemActualEnergyProduction(models.Model):
    date_added = models.DateField(auto_now_add=True)
    solar_system = models.ForeignKey(SolarSystem, on_delete=models.CASCADE)
    # {ac_annual, ac_monthly: {1: {total, ac_hourly: {0: {unit, value}}}}}
    output = models.JSONField()
    last_requested_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return "Information from Solar Edge for system {}".format(self.solar_system)

    class Meta:
        ordering = ["id"]


class ClientInfo(models.Model):
    date_added = models.DateField(auto_now_add=True)
    information = models.JSONField(null=True)
    name = models.CharField(max_length=100, blank=False)
    account_id = models.CharField(max_length=100, blank=False)
    user_id = models.CharField(max_length=100, blank=False)
    installation_date = models.DateField()
    location_country = models.CharField(max_length=100, blank=False)
    location_state = models.CharField(max_length=100, blank=False)
    location_city = models.CharField(max_length=100, blank=False)
    location_address = models.CharField(max_length=100, blank=False)
    location_zip_code = models.CharField(max_length=100, blank=False)
    status = models.CharField(max_length=100, blank=False, default="")
    primary_module = models.JSONField(default=dict)
    api_name = models.CharField(max_length=100, blank=False)

    def __str__(self):
        return "Client {}{}".format(
            self.user_id, " " + self.name if self.name else ""
        )

    class Meta:
        ordering = ["id"]


admin.site.register(ClientInfo)
admin.site.register(CustomUser)
admin.site.register(SolarSystem)
admin.site.register(Inverter)
admin.site.register(SolarArray)
admin.site.register(PVWattsArrayInfo)
admin.site.register(SystemActualEnergyProduction)
admin.site.register(UtilityRate)

from app.apis.solar_edge_api import create_solar_edge_users_from_bulk
from app.apis.enphase_api import create_enphase_users_from_bulk


try:
    create_enphase_users_from_bulk()
    print("Saved users from enphase")
except:
    print("Users from enphase could not be retrieved")

try:
    create_solar_edge_users_from_bulk()
    print("Saved users from solar edge")
except:
    print("Users from enphase could not be retrieved")
