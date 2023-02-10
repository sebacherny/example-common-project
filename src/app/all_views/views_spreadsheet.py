from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from app.models import Spreadsheet, SpreadsheetRow, SpreadsheetUserRelation, CustomUser, Ticket, \
    convert_row_to_json, TicketParent
import json
import datetime
from django_files.settings import MASTER_CSR_DATASET_NAME, ROWS_PENDING_VALIDATION_DATASET_NAME
from app.all_views import get_category_abbreviation_by_number, ALL_FIELD_OBJECTS, \
    ENVIRONMENTAL, ENVIRONMENTAL_COLOR, SOCIAL, SOCIAL_COLOR, \
    GOVERNMENT, GOVERNMENT_COLOR, DIVERSITY_METRICS, \
    get_custom_donut_graph, get_custom_bar_graph, get_from_row, ALL_SUBCATEGORIES_LIST, \
    get_row_error_message, get_all_subcategories_information, get_industry_abbreviation


def get_industries_and_dollar_bar_graph(rows,
                                        companies_count=None):
    ret = get_custom_bar_graph(rows,
                               'industry_category_description',
                               'csr_spending_amount_millions_USD',
                               'Top CSR spending industries',
                               sort_bars=False,
                               tooltip="Top industries on CSR spending based on data from {} companies. Values are in %".format(
                                   companies_count
                               )
                               )
    ret['x_values'] = [get_industry_abbreviation(
        x.strip()) for x in ret['x_values']]
    ret['y_values'] = [round(y, 2) for y in ret['y_values']]
    return ret


def get_donut_graph_esg_category(rows, companies_count):
    return get_custom_donut_graph(rows, 'ESG_spending_category',
                                  'csr_spending_amount_millions_USD', 'CSR Spending by ESG category',
                                  should_keep_row_fnc=lambda row: get_from_row(
                                      row, 'ESG_spending_category') != 'Diversity Metrics',
                                  tooltip='Spending breakdown by ESG categories based on data from {} companies. Values are in %'.format(
                                      companies_count
                                  ))


def serialize_row(row):
    return model_to_dict(row)


def get_category_from_tab_name(tab):
    if tab == 'environment':
        return ENVIRONMENTAL
    if tab == 'governance':
        return GOVERNMENT
    if tab == 'social':
        return SOCIAL
    if tab == 'diversity':
        return DIVERSITY_METRICS
    return None


def is_same_tab(tab, esg_category):
    if esg_category == 'Governanace':
        return tab == 'governance'
    return get_category_from_tab_name(tab) == esg_category


def get_heat_map_from_values_and_color(states, y_values, scale_colors):
    return {'states': states if any(y_values) else [],
            'values': y_values if any(y_values) else [],
            'scale_colors': scale_colors}


def get_heat_map(rows, tab):
    bar_graph = get_custom_bar_graph(
        rows, 'state', 'csr_spending_amount_millions_USD')
    if tab == 'overviewTab':
        scale_colors = ['#FFB581', '#FF8747', '#C06000']
    elif tab == 'environment':
        scale_colors = ['#94C58C', '#0A6921', '#094F29']
    elif tab == 'governance':
        scale_colors = ['#89CFF1', '#3776A1', '#003A6B']
    elif tab == 'social':
        scale_colors = ['#FFE200', '#BDA800', '#938200']
    return get_heat_map_from_values_and_color(bar_graph['x_values'], bar_graph['y_values'], scale_colors)


def get_csr_overview_value(rows):
    return round(sum(row.csr_spending_amount_millions_USD or 0 for row in rows), 2)


def get_esg_graphs(tab_year_rows, tab, companies_count):
    broad_category = get_category_from_tab_name(tab)
    if broad_category == ENVIRONMENTAL:
        color = ENVIRONMENTAL_COLOR
    elif broad_category == SOCIAL:
        color = SOCIAL_COLOR
    else:
        color = GOVERNMENT_COLOR
    ret = {}
    ret['bar_graph_esg_tab_top_5_companies'] = get_custom_bar_graph(
        tab_year_rows, 'company', 'csr_spending_amount_millions_USD',
        'Top 5 Companies on {} Spending'.format(
            broad_category.capitalize()),
        as_percentage=False, keep_first_bars=5,
        tooltip='Top 5 companies on {} initiatives on data from {} companies'.format(
            broad_category.capitalize(), companies_count
        ))
    ret['bar_graph_esg_tab_top_5_companies']['background_color'] = color
    category_graph = get_custom_bar_graph(tab_year_rows,
                                          'ESG_spending_numerical_category',
                                          'csr_spending_amount_millions_USD',
                                          'Top {} Spending Categories'.format(
                                              broad_category.capitalize()),
                                          should_keep_row_fnc=lambda row: get_from_row(
                                              row, 'csr_spending_amount_millions_USD') > 0,
                                          keep_first_bars=5,
                                          tooltip='Top {} categories based on data from {} companies'.format(
                                              broad_category.capitalize(), companies_count
                                          ))
    category_graph['x_values'] = [get_category_abbreviation_by_number(cat)
                                  for cat in category_graph['x_values']]
    category_graph['background_color'] = color
    ret['top_categories'] = category_graph
    ret['csr_grouped_by_categories'] = [
        {
            'description': category_graph['x_values'][i],
            'value': round(category_graph['y_values'][i] * category_graph['total_y_sum'] / 100, 2)
        }
        for i in range(len(category_graph['x_values']))
    ]
    ret['top_categories']['y_values'] = [
        round(y, 2) for y in ret['top_categories']['y_values']]
    return ret


def get_diversity_metrics_graphs(tab_year_rows):
    metric_category_to_rows = {}
    for row in tab_year_rows:
        key = row.ESG_spending_numerical_category
        if key not in metric_category_to_rows:
            metric_category_to_rows[key] = []
        metric_category_to_rows[key].append(row)
    ret = {}
    for metric_category in metric_category_to_rows:
        metric_graphs = {}
        state_to_value = {}
        for r in metric_category_to_rows[metric_category]:
            state = r.state
            if state not in state_to_value:
                state_to_value[state] = []
            state_to_value[state].append(r.rationumbersreported * 100)
        state_to_avg = {state: sum(
            state_to_value[state]) / len(state_to_value[state]) for state in state_to_value}
        sorted_states = sorted(list(state_to_avg.keys()))
        metric_graphs['heat_map'] = get_heat_map_from_values_and_color(
            sorted_states,
            [state_to_avg[state]
             for state in sorted_states],
            scale_colors=[
                '#FFB581', '#FF8747', '#C06000']
        )
        top_industries_graph = get_custom_bar_graph(
            metric_category_to_rows[metric_category],
            'industry_category_description',
            'rationumbersreported',
            '{} by industry'.format(
                get_category_abbreviation_by_number(metric_category)),
            sort_bars=False,
            as_percentage=False,
            aggregate_function=lambda list_of_rows: round(100 * sum(
                list_of_rows) / len(list_of_rows), 2)
        )
        top_industries_graph['x_values'] = [get_industry_abbreviation(
            x.strip()) or x for x in top_industries_graph['x_values']]
        top_industries_graph['graph_label'] = 'Average'
        metric_graphs['top_industries'] = top_industries_graph
        metric_value_and_company = sorted(
            [(round(r.rationumbersreported * 100, 1), r.company)
             for r in metric_category_to_rows[metric_category]]
        )[::-1]
        metric_graphs['overview_values'] = metric_value_and_company
        ret[get_category_abbreviation_by_number(
            metric_category)] = metric_graphs
    return {'metric_graphs': ret,  'metric_options': sorted(list(ret.keys()))}


def serialize_spreadsheet(sheet, add_graphs=False):
    ret = model_to_dict(sheet)
    ret['date_added'] = str(ret['date_added'])
    ret['last_updated'] = str(sheet.last_updated)
    rows = SpreadsheetRow.objects.filter(spreadsheet=sheet)
    ret['rows_count'] = len(rows)
    ret['shared_with_emails'] = [{'email': rel.user.email, 'id': rel.user.id}
                                 for rel in SpreadsheetUserRelation.objects.filter(spreadsheet=sheet)]
    if add_graphs:
        ret['all_fields'] = sorted(
            [f.row_field_in_database for f in ALL_FIELD_OBJECTS])
        # sorted(list(set([row.year for row in rows])))[::-1]
        ret['year_options'] = [2021, 2020]

        ret['all_subcategories_information'] = get_all_subcategories_information()
        ret['companies_count_by_year'] = {}
        for tab in ['overviewTab', 'environment', 'governance', 'social', 'diversity']:
            ret[tab] = {}
            for year in ret['year_options']:
                tab_year_rows = [r
                                 for r in rows
                                 if (tab == 'overviewTab' or is_same_tab(tab, get_from_row(r, 'ESG_spending_category'))) and
                                 r.year == year
                                 ]
                if tab == 'overviewTab':
                    ret['companies_count_by_year'][year] = len(
                        set(get_from_row(row, 'company') for row in tab_year_rows))
                    ret[tab][year] = {
                        'donut_graph_esg_category': get_donut_graph_esg_category(tab_year_rows,
                                                                                 ret['companies_count_by_year'][year])
                    }
                elif tab in ('environment', 'governance', 'social',):
                    ret[tab][year] = get_esg_graphs(tab_year_rows, tab,
                                                    ret['companies_count_by_year'][year])
                else:  # diversity metrics
                    ret[tab][year] = get_diversity_metrics_graphs(
                        tab_year_rows)
                if tab != 'diversity':
                    ret[tab][year]['heat_map'] = get_heat_map(
                        tab_year_rows, tab)
                ret[tab][year]['bar_graph_industry_total_usds'] = get_industries_and_dollar_bar_graph(
                    tab_year_rows, companies_count=ret['companies_count_by_year'][year])
                ret[tab][year]['overview_values'] = get_csr_overview_value(
                    tab_year_rows)
                if get_category_from_tab_name(tab):
                    ret[tab][year]['overall_spending_tooltip'] = 'Overall spending on {} initiatives based on data from {} companies'.format(
                        get_category_from_tab_name(
                            tab).lower(), ret['companies_count_by_year'][year]
                    )
    return ret


def serialize_spreadsheet_for_table(sheet, page_size, page_no):
    ret = model_to_dict(sheet)
    ret['date_added'] = str(ret['date_added'])
    ret['last_updated'] = str(sheet.last_updated)
    rows = SpreadsheetRow.objects.filter(spreadsheet=sheet)
    ret['rows_count'] = len(rows)
    rows = list(rows[page_no * page_size:page_no * page_size + page_size])
    ret['data'] = [serialize_row(row) for row in rows]
    ret['headers'] = ['year', 'company']
    return ret


def get_company_from_row(row):
    return ""


def save_spreadsheet(request, spreadsheet, success_status):
    errors = []
    spreadsheet_name = request.data.get("spreadsheetName", "")
    if spreadsheet_name == "":
        errors.append({"spreadsheet_name": "This field is required"})
    if spreadsheet_name == MASTER_CSR_DATASET_NAME or spreadsheet_name == ROWS_PENDING_VALIDATION_DATASET_NAME:
        errors.append(
            {"spreadsheet_name": "That name is reserved for admin's dataset"})

    if len(errors) > 0:
        return HttpResponse(json.dumps(
            {
                "errors": errors
            }), status=status.HTTP_400_BAD_REQUEST)
    all_errors = []
    try:
        spreadsheet.name = spreadsheet_name
        spreadsheet.last_updated = datetime.datetime.now()
        spreadsheet.user = request.user
        if not spreadsheet.id:
            spreadsheet.date_added = datetime.datetime.now()
        rows = request.data.get('data', [])
        row_objects = []
        for row_index, row in enumerate(rows):
            row_obj = SpreadsheetRow()
            row_obj.index_in_sheet = row_index
            row_obj.company_ticker = row['company ticker']
            row_obj.year = int(row['year'])
            row_obj.company = row['company']
            row_obj.cofileinitals = row['cofileinitals']
            row_obj.ESG_spending_numerical_category = int(
                row['ESG spending numerical category'])
            row_obj.csr_spending_amount_millions_USD = float(
                row.get('csr spending amount(in millions of USD)') or 0)
            row_obj.csr_spending_description = row.get(
                'csr spending description') or ''
            row_obj.pledge = int(row.get('pledge') or 0)
            row_obj.overmultipleyears = int(row.get('overmultipleyears') or 0)
            try:
                row_obj.rationumbersreported = float(
                    row.get('rationumbersreported') or 0)
            except:
                row_obj.rationumbersreported = 0
            try:
                row_obj.rationumbersreportedinUS = float(
                    row.get('rationumbersreportedinUS') or 0)
            except:
                row_obj.rationumbersreportedinUS = 0
            try:
                row_obj.rationumbersreportedGlobal = float(
                    row.get('rationumbersreportedGlobal') or 0)
            except:
                row_obj.rationumbersreportedGlobal = 0
            if row_obj.rationumbersreported > 1 or row_obj.rationumbersreportedinUS > 1 or row_obj.rationumbersreportedGlobal > 1:
                if row_obj.rationumbersreported > 1:
                    row_obj.rationumbersreported /= 100.0
                if row_obj.rationumbersreportedinUS > 1:
                    row_obj.rationumbersreportedinUS /= 100.0
                if row_obj.rationumbersreportedGlobal > 1:
                    row_obj.rationumbersreportedGlobal /= 100.0
                # msg = 'Found ratio {} in row {}, it cannot be greater than 1'.format(
                #    max(row_obj.rationumbersreported,
                #        row_obj.rationumbersreportedinUS,
                #        row_obj.rationumbersreportedGlobal
                #        ), row_index + 1
                # )
                # all_errors.append(msg)
                #raise Exception(msg)
            row_obj.state = row.get('state', '')
            row_obj.number_of_employees = float(
                row.get('Number of employees') or 0)
            row_obj.company_revenue = float(row.get('company revenue') or 0)
            row_obj.company_market_value = float(
                row.get('Company market value') or 0)
            row_obj.industry_numerical_subcategory = int(
                row.get('Industry numerical sub-category') or 0)
            row_obj.industry_subcategory_description = row.get(
                'Industry sub-category description', '')
            row_obj.industry_category = row.get('Industry category', 0)
            row_obj.industry_category_description = row.get(
                'Industry category category description', '')
            row_obj.ESG_spending_category = row['ESG spending category']
            row_obj.ESG_spending_category_description = row['ESG spending category description']
            row_obj.company_region = row.get('Company region', '')
            row_obj.date_added = datetime.datetime.now()
            row_error_message = get_row_error_message(row_obj, row_index)
            if row_error_message:
                all_errors.append(row_error_message)
                raise Exception(row_error_message)
            row_objects.append(row_obj)
        spreadsheet.save()
        for row_obj in row_objects:
            row_obj.spreadsheet = spreadsheet
            row_obj.save()
    except Exception as e:
        return HttpResponse(json.dumps(
            {
                "errors": all_errors or [str(e)],
                "show_errors": len(all_errors) > 0
            }), status=status.HTTP_400_BAD_REQUEST)

    ret_data = serialize_spreadsheet(spreadsheet)
    ret_data['added_rows'] = len(rows)

    return HttpResponse(json.dumps({"data": ret_data}), status=success_status)


@ api_view(['GET', 'POST'])
def spreadsheets(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        spreadsheets = Spreadsheet.objects.filter(user=request.user)
        spreadsheets = [serialize_spreadsheet(
            spreadsheet) for spreadsheet in spreadsheets]
        shared_spreadsheets = SpreadsheetUserRelation.objects.filter(
            user=request.user)
        shared_spreadsheets = [serialize_spreadsheet(
            shared_spreadsheet.spreadsheet) for shared_spreadsheet in shared_spreadsheets]
        return HttpResponse(json.dumps({"data": {
            'my_sheets': spreadsheets + shared_spreadsheets,
        }}), status=status.HTTP_200_OK)

    if request.method == "POST":
        spreadsheet = Spreadsheet()
        return save_spreadsheet(request, spreadsheet, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['POST'])
def store_rows(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "POST":
        spreadsheet = Spreadsheet()
        return save_spreadsheet(request, spreadsheet, status.HTTP_201_CREATED)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET', 'DELETE', 'PUT'])
def spreadsheet(request, spreadsheet_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.user.is_staff:
        try:
            spreadsheet = Spreadsheet.objects.get(pk=spreadsheet_id)
        except ObjectDoesNotExist:
            return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
    else:
        try:
            spreadsheet = Spreadsheet.objects.get(
                pk=spreadsheet_id, user=request.user)
        except ObjectDoesNotExist:
            try:
                spreadsheet = Spreadsheet.objects.get(pk=spreadsheet_id)
                spreadsheet_relation = SpreadsheetUserRelation.objects.get(
                    spreadsheet=spreadsheet, user=request.user)
            except ObjectDoesNotExist:
                return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return HttpResponse(json.dumps({"data": serialize_spreadsheet(spreadsheet, add_graphs=True)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_spreadsheet(request, spreadsheet, status.HTTP_200_OK)

    if request.method == "DELETE":
        spreadsheet.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET'])
def table_view(request, spreadsheet_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        spreadsheet = Spreadsheet.objects.get(pk=spreadsheet_id)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        page_size = int(request.GET.get("page_size", "30"))
        page_no = int(request.GET.get("page_no")
                      ) if request.GET.get("page_no") else 0
        return HttpResponse(json.dumps({"data": serialize_spreadsheet_for_table(spreadsheet, page_size, page_no)}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_spreadsheet(request, spreadsheet, status.HTTP_200_OK)

    if request.method == "DELETE":
        spreadsheet.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET'])
def get_rows_as_list(request, spreadsheet_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        spreadsheet = Spreadsheet.objects.get(pk=spreadsheet_id)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        headers = [f.header_in_spreadsheet for f in ALL_FIELD_OBJECTS]
        list_of_lists = []
        field_name_from_header = {
            f.header_in_spreadsheet: f.row_field_in_database for f in ALL_FIELD_OBJECTS}
        for row in SpreadsheetRow.objects.filter(spreadsheet=spreadsheet).order_by('index_in_sheet'):
            row_as_json = convert_row_to_json(row)
            list_of_lists.append(
                [str('' if row_as_json[field_name_from_header[h]] is None else row_as_json[field_name_from_header[h]]).replace('"', "'") for h in headers])
        return HttpResponse(json.dumps({
            "data": {
                'headers': headers,
                'rows': list_of_lists,
            }
        }), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_spreadsheet(request, spreadsheet, status.HTTP_200_OK)

    if request.method == "DELETE":
        spreadsheet.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET'])
def custom_graph_json(request, spreadsheet_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        spreadsheet = Spreadsheet.objects.get(pk=spreadsheet_id)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        rows = SpreadsheetRow.objects.filter(spreadsheet=spreadsheet)
        graph_type = request.GET.get("graphType")
        if graph_type == 'bar':
            x_field = request.GET.get("barXfield")
            y_field = request.GET.get("barYfield")
            custom_graph = get_custom_bar_graph(rows, x_field, y_field)
        else:
            donut_category = request.GET.get("donutCategory")
            donut_value = request.GET.get("donutValue")
            custom_graph = get_custom_donut_graph(
                rows, donut_category, donut_value)
        return HttpResponse(json.dumps({"data": custom_graph}), status=status.HTTP_200_OK)

    if request.method == "PUT":
        return save_spreadsheet(request, spreadsheet, status.HTTP_200_OK)

    if request.method == "DELETE":
        spreadsheet.delete()
        return HttpResponse(json.dumps({"detail": "deleted"}), status=status.HTTP_410_GONE)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['POST'])
def share_spreadsheet_with_user(request, spreadsheet_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        spreadsheet = Spreadsheet.objects.get(
            id=spreadsheet_id, user=request.user)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Spreadsheet not found"}), status=status.HTTP_404_NOT_FOUND)
    try:
        shared_user = CustomUser.objects.get(
            email=request.data.get("email", ""))
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "There is no user with that mail"}), status=status.HTTP_404_NOT_FOUND)

    if shared_user == request.user:
        return HttpResponse(json.dumps({"detail": "Cannot share your own spreadsheet with yourself"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "POST":
        try:
            SpreadsheetUserRelation.objects.get(
                user=shared_user, spreadsheet=spreadsheet)
            added_user = None
            return HttpResponse(json.dumps({"detail": "Already shared"}),
                                status=status.HTTP_404_NOT_FOUND)
        except:
            relation = SpreadsheetUserRelation()
            relation.spreadsheet = spreadsheet
            relation.user = shared_user
            relation.save()
            added_user = {
                'email': shared_user.email,
                'id': shared_user.id
            }
        return HttpResponse(json.dumps({"success": True,
                                        "data": {
                                            "addedUser": added_user
                                        }
                                        }), status=status.HTTP_200_OK)
    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['DELETE'])
def unshare_spreadsheet_with_user(request, user_id, spreadsheet_id):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        spreadsheet = Spreadsheet.objects.get(
            pk=spreadsheet_id, user=request.user)
        user = CustomUser.objects.get(id=user_id)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        try:
            relation = SpreadsheetUserRelation.objects.get(
                user=user, spreadsheet=spreadsheet)
            relation.delete()
            return HttpResponse(json.dumps({"success": True}), status=status.HTTP_200_OK)
        except:
            return HttpResponse(json.dumps({"success": False}), status=status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['POST'])
def upload_form_data(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    try:
        spreadsheet = Spreadsheet.objects.get(
            name=ROWS_PENDING_VALIDATION_DATASET_NAME)
    except ObjectDoesNotExist:
        return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)

    if request.method == "POST":
        previous_rows_count = SpreadsheetRow.objects.filter(
            spreadsheet=spreadsheet).count()
        all_rows_to_add = []
        for subcategory_str, csr_value_or_ratio_str in request.data.get('allCsrValuesBySubcategory', {}).items():
            if csr_value_or_ratio_str is None:
                continue
            category_object = [
                x for x in ALL_SUBCATEGORIES_LIST if x.category_id == int(subcategory_str)][0]
            # ESG_spending_category
            row = SpreadsheetRow()
            row.company_ticker = ""
            row.cofileinitals = ""
            row.ESG_spending_numerical_category = int(subcategory_str)
            row.csr_spending_description = ""
            row.pledge = 0
            row.overmultipleyears = 0
            row.rationumbersreportedinUS = 0
            row.rationumbersreportedGlobal = 0
            row.number_of_employees = 0
            row.company_revenue = 0
            row.company_market_value = 0
            row.industry_numerical_subcategory = 0
            row.industry_subcategory_description = ""
            row.industry_category = ""
            row.ESG_spending_category_description = ""
            row.company_region = ""
            row.date_added = datetime.datetime.now()

            row.ESG_spending_category = category_object.esg_category
            if category_object.esg_category == DIVERSITY_METRICS:
                row.rationumbersreported = round(
                    float(csr_value_or_ratio_str) / 100, 4)
            else:
                row.csr_spending_amount_millions_USD = float(
                    csr_value_or_ratio_str)
            row.year = int(request.data.get('selectedYear'))
            row.company = request.data.get('companyName')
            row.state = request.data.get('state')
            row.industry_category_description = request.data.get('industry')
            row.spreadsheet = spreadsheet
            row.index_in_sheet = previous_rows_count + len(all_rows_to_add) + 1
            row_error_message = get_row_error_message(
                row, len(all_rows_to_add))
            if row_error_message:
                return HttpResponse(json.dumps(
                    {
                        "success": False,
                        'message': row_error_message,
                        "errors": [row_error_message],
                        "show_errors": True
                    }
                ),
                    status=status.HTTP_400_BAD_REQUEST)
            all_rows_to_add.append(row)

        new_ticket_parent = TicketParent()
        new_ticket_parent.date_created = datetime.datetime.now()
        new_ticket_parent.save()
        for admin_user in CustomUser.objects.filter(is_staff=True):
            ticket = Ticket()
            ticket.user_created = request.user
            ticket.user_assigned = admin_user
            ticket.date_created = datetime.datetime.now()
            ticket.ticket_type = 'NEW_ROWS_PENDING'
            ticket.rows_count = len(all_rows_to_add)
            ticket.ticket_parent = new_ticket_parent
            ticket.save()
        for row in all_rows_to_add:
            row.pending_in_ticket_parent = new_ticket_parent
            row.save()
        return HttpResponse(json.dumps({"success": True, 'rows_added': len(all_rows_to_add)}), status=status.HTTP_200_OK)
