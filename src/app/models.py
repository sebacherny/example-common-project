from datetime import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime
from django.contrib import admin
from django_files.settings import MASTER_CSR_DATASET_NAME, ROWS_PENDING_VALIDATION_DATASET_NAME


class CustomUser(AbstractUser):
    address = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    registration_random_code = models.CharField(max_length=100)
    company_role = models.CharField(max_length=100)
    is_sports = models.BooleanField(default=False)

    def __str__(self):
        return "{} - {} {}".format(self.username, self.first_name, self.last_name)

    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'
        ordering = ["id"]


class Spreadsheet(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    date_added = models.DateField()
    last_updated = models.DateField()

    def __str__(self):
        return "Spreadsheet {}".format(self.name)

    class Meta:
        ordering = ["id"]


class TicketParent(models.Model):

    date_created = models.DateField()


class Ticket(models.Model):

    user_created = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, related_name='ticker_user_created')
    user_assigned = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, related_name='ticker_user_assigned')
    spreadsheet = models.ForeignKey(
        Spreadsheet, on_delete=models.CASCADE, null=True)
    message = models.CharField(max_length=1000, blank=True)
    date_created = models.DateField()
    ticket_type = models.CharField(max_length=30)
    ticket_parent = models.ForeignKey(TicketParent, on_delete=models.CASCADE,
                                      default=None, null=True)
    rows_count = models.IntegerField(default=0)
    is_pending = models.BooleanField(default=True)


class SpreadsheetRow(models.Model):
    index_in_sheet = models.IntegerField()
    company_ticker = models.CharField(max_length=100, blank=True)
    year = models.IntegerField()
    company = models.CharField(max_length=100, blank=True)
    cofileinitals = models.CharField(max_length=100, blank=True)
    ESG_spending_numerical_category = models.IntegerField()
    csr_spending_amount_millions_USD = models.FloatField(blank=True, null=True)
    csr_spending_description = models.CharField(max_length=1000, blank=True)
    pledge = models.IntegerField(null=True)
    overmultipleyears = models.IntegerField(null=True)
    rationumbersreported = models.FloatField(null=True)
    rationumbersreportedinUS = models.FloatField(null=True)
    rationumbersreportedGlobal = models.FloatField(null=True)
    state = models.CharField(max_length=100, blank=True)
    number_of_employees = models.FloatField(null=True)
    company_revenue = models.FloatField(blank=True, null=True)
    company_market_value = models.FloatField(blank=True, null=True)
    industry_numerical_subcategory = models.IntegerField(null=True)
    industry_subcategory_description = models.CharField(
        max_length=100, blank=True)
    industry_category = models.CharField(max_length=100, blank=True)
    industry_category_description = models.CharField(
        max_length=100, blank=True)
    ESG_spending_category = models.CharField(max_length=100, blank=True)
    ESG_spending_category_description = models.CharField(
        max_length=100, blank=True)
    company_region = models.CharField(max_length=100, blank=True)
    spreadsheet = models.ForeignKey(Spreadsheet, on_delete=models.CASCADE)
    date_added = models.DateField(auto_now_add=True)
    pending_in_ticket_parent = models.ForeignKey(
        TicketParent, on_delete=models.CASCADE, null=True, default=None)

    def __str__(self):
        return "Row {}".format(self.index_in_sheet)

    class Meta:
        ordering = ["id"]


def convert_row_to_json(row):
    return {
        'company_ticker': row.company_ticker,
        'year': row.year,
        'company': row.company,
        'cofileinitals': row.cofileinitals,
        'ESG_spending_numerical_category': row.ESG_spending_numerical_category,
        'csr_spending_amount_millions_USD': row.csr_spending_amount_millions_USD,
        'csr_spending_description': row.csr_spending_description,
        'pledge': row.pledge,
        'overmultipleyears': row.overmultipleyears,
        'rationumbersreported': row.rationumbersreported,
        'rationumbersreportedinUS': row.rationumbersreportedinUS,
        'rationumbersreportedGlobal': row.rationumbersreportedGlobal,
        'state': row.state,
        'number_of_employees': row.number_of_employees,
        'company_revenue': row.company_revenue,
        'company_market_value': row.company_market_value,
        'industry_numerical_subcategory': row.industry_numerical_subcategory,
        'industry_subcategory_description': row.industry_subcategory_description,
        'industry_category': row.industry_category,
        'industry_category_description': row.industry_category_description,
        'ESG_spending_category': row.ESG_spending_category,
        'ESG_spending_category_description': row.ESG_spending_category_description,
        'company_region': row.company_region
    }


class SpreadsheetUserRelation(models.Model):

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    spreadsheet = models.ForeignKey(Spreadsheet, on_delete=models.CASCADE)

    def __str__(self):
        return "User {}, spreadsheet {}".format(self.user, self.spreadsheet)

    class Meta:
        ordering = ["id"]


class AlumniDataset(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date_added = models.DateField()

    def __str__(self):
        return "Alumni Dataset {}".format(self.id)

    class Meta:
        ordering = ["id"]


class StudentInformation(models.Model):
    index_in_sheet = models.IntegerField()
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    employer = models.CharField(max_length=500, blank=True)
    title = models.CharField(max_length=100, blank=True)
    graduation_year = models.IntegerField(blank=True, null=True)
    major = models.CharField(max_length=200, blank=True)
    college = models.CharField(max_length=200, blank=True)
    linkedin_page = models.CharField(max_length=200, blank=True)
    state = models.CharField(max_length=100, blank=True)
    industry_type = models.CharField(max_length=200, blank=True)
    alumni_dataset = models.ForeignKey(AlumniDataset, on_delete=models.CASCADE)
    date_added = models.DateField()

    def __str__(self):
        return "Alumni Row {}".format(self.index_in_sheet)

    class Meta:
        ordering = ["id"]


admin.site.register(CustomUser)
admin.site.register(Spreadsheet)
admin.site.register(SpreadsheetUserRelation)
admin.site.register(Ticket)
admin.site.register(AlumniDataset)
admin.site.register(StudentInformation)

for admin_name in (ROWS_PENDING_VALIDATION_DATASET_NAME, MASTER_CSR_DATASET_NAME):
    if not Spreadsheet.objects.filter(name=admin_name):
        spreadsheet = Spreadsheet()
        spreadsheet.name = admin_name
        spreadsheet.last_updated = datetime.datetime.now()
        spreadsheet.user = CustomUser.objects.filter(is_staff=True)[0]
        spreadsheet.date_added = datetime.datetime.now()
        spreadsheet.save()
        for admin_user in CustomUser.objects.filter(is_staff=True):
            if admin_user != spreadsheet.user:
                relation = SpreadsheetUserRelation()
                relation.spreadsheet = spreadsheet
                relation.user = admin_user
                relation.save()
