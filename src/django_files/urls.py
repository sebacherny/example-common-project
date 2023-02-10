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
from app.all_views import views_spreadsheet, views_user, views_tickets, views_forms, views_linkedin_scrapper, views_sports
from app import views
from django_files import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

favicon_view = RedirectView.as_view(
    url='/static/images/favicon.webp', permanent=True)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.login_view),
    path('register/', views.register_view),
    path('sports/login/', views.login_sports_view),
    path('sports/register/', views.register_sports_view),
    path('api/register/', views_user.register_user),
    path('api/sports/register/', views_user.register_user_sports),
    path('api/validate/', views_user.validate_user),
    path('api/send_mail/', views_user.resend_mail),
    path('welcome/<str:random_str>/', views.welcome),
    path('api/user_info/', views_user.user_info),
    path('api/token/', CustomAuthToken.as_view()),
    path('favicon.ico/', favicon_view),
    path('', views.login_view),
    path('login/', views.login_view),
    path('profile/', views.profile_view),
    path('api/ask_question/', views_user.ask_question),
    path('datasets', views.datasets_view),
    path('datasets/<int:spreadsheet_id>/', views.dataset_dashboard_view),
    path('datasets/<int:spreadsheet_id>/view-rows/',
         views.dataset_table_view),
    path('api/datasets/', views_spreadsheet.spreadsheets),
    path('api/datasets/<int:spreadsheet_id>/', views_spreadsheet.spreadsheet),
    path('api/datasets/<int:spreadsheet_id>/view-table/',
         views_spreadsheet.table_view),
    path('api/datasets/<int:spreadsheet_id>/rows-as-list/',
         views_spreadsheet.get_rows_as_list),
    path('api/datasets/<int:spreadsheet_id>/custom-graph/',
         views_spreadsheet.custom_graph_json),
    path('api/store_sheet_rows/', views_spreadsheet.store_rows),
    path('api/datasets/<int:spreadsheet_id>/share/',
         views_spreadsheet.share_spreadsheet_with_user),
    path('api/datasets/<int:spreadsheet_id>/user/<int:user_id>/unshare/',
         views_spreadsheet.unshare_spreadsheet_with_user),

    path('api/tickets/', views_tickets.tickets),
    path('api/tickets/<int:ticket_id>/', views_tickets.one_ticket),
    path('api/ticket/<int:ticket_id>/approve-rows/',
         views_tickets.validate_rows_ticket),
    path('tickets/', views.see_tickets),
    path('tickets/<int:ticket_id>/', views.see_one_ticket),
    path('api/tickets/<int:ticket_id>/rows/<int:row_id>/',
         views_tickets.ticket_row),

    path('api/form/', views_spreadsheet.upload_form_data),
    path('add-data/', views.upload_form),
    path('api/form_data/', views_forms.get_form_data),

    path('linkedin-scrapper/', views.linkedin_scrapper_view),
    path('api/linkedin_scrapper/', views_linkedin_scrapper.get_scrapped_data),

    path('sports-dashboard', views.sports_dashboard_view),
    path('api/students-dataset/', views_sports.sports_dataset),

    path('test-url', views.test_url_view),

    path('health/', views.health),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
