from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.models import Spreadsheet, SpreadsheetRow, Ticket
import json
from django_files.settings import MASTER_CSR_DATASET_NAME
from app.all_views import ALL_SUBCATEGORIES_LIST


def serialize_ticket(ticket_obj):
    ticket = {'id': ticket_obj.id}
    ticket['username'] = ticket_obj.user_created.username
    ticket['user_email'] = ticket_obj.user_created.email
    ticket['date_created'] = str(ticket_obj.date_created)
    ticket['company'] = ticket_obj.user_created.company
    ticket['company_role'] = ticket_obj.user_created.company_role
    ticket['ticket_type'] = ticket_obj.ticket_type
    ticket['message'] = ticket_obj.message
    ticket['rows_count'] = ticket_obj.rows_count
    if ticket['ticket_type'] == 'NEW_MESSAGE':
        ticket['dataset_id'] = ticket_obj.spreadsheet.id
    return ticket


@ api_view(['GET'])
def tickets(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        tickets = Ticket.objects.filter(
            user_assigned=request.user, is_pending=True)
        tickets = [serialize_ticket(ticket) for ticket in tickets]
        return HttpResponse(json.dumps({"data": {
            'new_user_tickets': [t for t in tickets if t['ticket_type'] == 'NEW_USER'],
            'message_tickets': [t for t in tickets if t['ticket_type'] == 'NEW_MESSAGE'],
            'rows_pending_approval_tickets': [t for t in tickets if t['ticket_type'] == 'NEW_ROWS_PENDING'],
        }}), status=status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)


@ api_view(['GET', 'DELETE'])
def one_ticket(request, ticket_id):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        try:
            ticket = Ticket.objects.get(pk=ticket_id)
        except:
            return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
        all_rows_jsons = []
        for row_obj in SpreadsheetRow.objects.filter(pending_in_ticket_parent=ticket.ticket_parent):
            all_rows_jsons.append({
                'id': row_obj.id,
                'company': row_obj.company,
                'state': row_obj.state,
                'year': row_obj.year,
                'industry_category_description': row_obj.industry_category_description,
                'ESG_spending_category': row_obj.ESG_spending_category,
                'ESG_subcategory': row_obj.ESG_spending_numerical_category,
                'ESG_subcategory_description': [x for x in ALL_SUBCATEGORIES_LIST if x.category_id == row_obj.ESG_spending_numerical_category][0].category_name,
                'csr': row_obj.csr_spending_amount_millions_USD,
                'ratio': row_obj.rationumbersreported,
            })
        return HttpResponse(json.dumps({"data": {"rows": all_rows_jsons}}), status=status.HTTP_200_OK)

    if request.method == "DELETE":
        try:
            ticket = Ticket.objects.get(pk=ticket_id)
        except:
            return HttpResponse(json.dumps({"detail": "Not found"}), status=status.HTTP_404_NOT_FOUND)
        ticket.ticket_parent.delete()
        return HttpResponse(json.dumps({"success": True, "detail": "Removed"}), status=status.HTTP_410_GONE)


@ api_view(['POST'])
def validate_rows_ticket(request, ticket_id):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
        admin_spreadsheet = Spreadsheet.objects.get(
            name=MASTER_CSR_DATASET_NAME)
    except:
        return HttpResponse(json.dumps({"success": False, "detail": "Incorrect user"}), status=status.HTTP_403_FORBIDDEN)
    rows_count = 0
    previous_rows_count = SpreadsheetRow.objects.filter(
        spreadsheet=admin_spreadsheet).count()
    for row in SpreadsheetRow.objects.filter(pending_in_ticket_parent=ticket.ticket_parent):
        row.spreadsheet = admin_spreadsheet
        row.pending_in_ticket_parent = None
        row.index_in_sheet = previous_rows_count + rows_count + 1
        row.save()
        rows_count += 1
    ticket.ticket_parent.delete()
    return HttpResponse(json.dumps({"data": {"success": True,
                                             'message': '{} rows added in dataset {}'.format(rows_count,
                                                                                             MASTER_CSR_DATASET_NAME
                                                                                             )
                                             }
                                    }), status=status.HTTP_200_OK)


@ api_view(['POST', 'DELETE'])
def ticket_row(request, ticket_id, row_id):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
        admin_spreadsheet = Spreadsheet.objects.get(
            name=MASTER_CSR_DATASET_NAME)
        row_object = SpreadsheetRow.objects.get(
            pk=row_id, pending_in_ticket_parent=ticket.ticket_parent)
    except:
        return HttpResponse(json.dumps({"success": False, "detail": "Incorrect user"}), status=status.HTTP_403_FORBIDDEN)
    if request.method == 'POST':
        previous_rows_count = SpreadsheetRow.objects.filter(
            spreadsheet=admin_spreadsheet).count()
        row_object.spreadsheet = admin_spreadsheet
        row_object.pending_in_ticket_parent = None
        row_object.index_in_sheet = previous_rows_count + 1
        row_object.save()
        ticket.rows_count = ticket.rows_count - 1
        if ticket.rows_count == 0:
            ticket.is_pending = False
        ticket.save()
        return HttpResponse(json.dumps({"data": {
            "success": True,
            'message': 'Row correctly added in dataset {}'.format(
                MASTER_CSR_DATASET_NAME
            )
        }
        }), status=status.HTTP_200_OK)
    if request.method == 'DELETE':
        row_object.delete()
        ticket.rows_count = ticket.rows_count - 1
        if ticket.rows_count == 0:
            ticket.is_pending = False
        ticket.save()
        return HttpResponse(json.dumps({"data": {
            "success": True,
            'message': 'Pending row removed'
        }
        }), status=status.HTTP_410_GONE)
