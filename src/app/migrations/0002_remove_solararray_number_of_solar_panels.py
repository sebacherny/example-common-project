# Generated by Django 3.2.10 on 2022-10-21 02:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='solararray',
            name='number_of_solar_panels',
        ),
    ]
