"""quiz URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from app.custom_serializer import CustomAuthToken
from app.all_views import views_admin, views_api_calls, views_enphase, views_inverter, views_solar_array, views_solar_edge, views_system, views_user, views_rate
from app import views
from django_files import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView
from app import all_views
from django.views.generic.base import RedirectView

favicon_view = RedirectView.as_view(url='/static/images/favicon.webp', permanent=True)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.login_view),
    path('register/', views.register_view),
    path('api/register/', views_user.register_user),
    path('api/validate/', views_user.validate_user),
    path('api/send_mail/', views_user.resend_mail),
    path('welcome/<str:random_str>/', views.welcome),
    path('api/user_info/', views_user.user_info),
    path('api/token/', CustomAuthToken.as_view()),
    path('api/systems/', views_system.systems),
    path('api/systems/<int:system_id>/', views_system.system),
    path('api/systems/<int:system_id>/inverter/', views_inverter.inverters),
    path('api/systems/<int:system_id>/solar_array/', views_solar_array.solar_arrays),
    path('api/systems/<int:system_id>/inverter/<int:inverter_id>/', views_inverter.inverter),
    path('api/systems/<int:system_id>/solar_array/<int:solar_array_id>/', views_solar_array.solar_array),
    path('api/systems/<int:system_id>/dashboard_info/', views_system.dashboard_view),
    
    path('api/systems/wizard/', views_system.wizard),
    
    path('systems/<int:system_id>/dashboard/', views.dashboard_view),
    path('favicon.ico/', favicon_view),
    path('', views.login_view),
    path('login/', views.login_view),
    path('systems/<int:system_id>/', views.system_information_view),
    path('profile/', views.profile_view),
    path('api/ask_question/', views_user.ask_question),
    path('systems/', views.all_systems_view),
    path('api/admin/dashboard/', views_admin.all_users),
    path('admin-dashboard/', views.admin_dashboard),
    path('admin-dashboard/system/<int:system_id>/', views.dashboard_view),
    path('api/admin/clients-info/', views_admin.clients_info),
    path('clients-info/', views.clients_view),
    path('api/admin/database-info/', views_admin.database_info),
    path('see-database/', views.database_view),
    
    path('api/solar_edge/', views_solar_edge.solar_edge_system),
    path('api/admin/solar-edge/', views_api_calls.solar_edge_all_users),
    
    path('api/solar_edge/inventory/<int:site_id>/', views_solar_edge.site_inventory),
    path('api/enphase/inventory/<int:site_id>/', views_enphase.site_inventory),
    
    path('api/enphase/', views_enphase.enphase_system),
    path('api/admin/enphase/', views_api_calls.enphase_all_users),
    
    path('api/json-view/solar-array/<int:solar_array_id>/pvwatts-info/', views_solar_array.pvwatts_info_view),
    path('api/json-view/solar-arrays/', views_solar_array.json_all_arrays_view),
    path('api/json-view/pvwatts-info/<int:object_id>/', views_api_calls.pvwatts_info),
    path('api/json-view/solar-edge/<int:object_id>/', views_api_calls.solar_edge_info),

    path('rate-creation/', views.rate_creation_view),
    path('api/money_rates/', views_rate.rates),
    
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

