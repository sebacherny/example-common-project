# Generated by Django 3.2.10 on 2023-01-23 04:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_spreadsheetrow_pending_in_ticket'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spreadsheetrow',
            name='number_of_employees',
            field=models.FloatField(null=True),
        ),
    ]