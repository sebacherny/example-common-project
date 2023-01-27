# Generated by Django 3.2.10 on 2022-10-31 20:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0007_auto_20221027_1152'),
    ]

    operations = [
        migrations.DeleteModel(
            name='SolarEdgeOutput',
        ),
        migrations.AlterModelOptions(
            name='customuser',
            options={'ordering': ['id'], 'verbose_name': 'user', 'verbose_name_plural': 'users'},
        ),
        migrations.AlterModelOptions(
            name='inverter',
            options={'ordering': ['id']},
        ),
        migrations.AlterModelOptions(
            name='solarsystem',
            options={'ordering': ['id']},
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='user_type',
        ),
        migrations.AddField(
            model_name='customuser',
            name='role',
            field=models.CharField(default='owner', max_length=100),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='SystemDashboardOutput',
        ),
    ]