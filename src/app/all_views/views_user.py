import datetime
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from app.mail_sender import send_mail
from app.models import CustomUser, Ticket, Spreadsheet, TicketParent
from app.custom_serializer import get_token_for_validated_user
import json

from django_files.settings import MAIL_SENDER_USER, SEND_MAIL_NEW_USER, URL_PREFIX_FOR_LINK, USER_REGISTRATION_VALIDATION


def serialize_user(user):
    ret = {
        "username": user.username,
        "email": user.email,
        "name": user.first_name,
        "address": user.address,
        "is_admin": user.is_staff,
        "is_active": user.is_active,
        "tickets_count": len(Ticket.objects.filter(user_assigned=user, is_pending=True)),
        "is_client_admin": user.company_role == 'company_admin',
        "is_sports": user.is_sports
    }
    if ret['is_admin']:
        ret['existingMails'] = sorted(
            [u.email for u in CustomUser.objects.all() if u.is_staff or u.company_role == 'company_admin'])
    return ret


@api_view(['GET'])
def user_info(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    return HttpResponse(json.dumps({"data": serialize_user(request.user)}))


@api_view(['POST'])
def resend_mail(request):
    request_mail = request.data.get("email")
    try:
        user = CustomUser.objects.get(email=request_mail)
    except:
        return HttpResponse(json.dumps({"success": False, "detail": "Incorrect user"}), status=status.HTTP_403_FORBIDDEN)
    send_mail(_get_new_user_mail_content(
        user.registration_random_code), "Welcome to Cinc Labs", request_mail)
    return HttpResponse(json.dumps({"success": True}), status=status.HTTP_200_OK)


@api_view(['POST'])
def ask_question(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    message = request.data.get("message")
    dataset_id = request.data.get("datasetId")
    new_parent_ticket = TicketParent()
    new_parent_ticket.date_created = datetime.datetime.now()
    new_parent_ticket.save()
    for admin_user in CustomUser.objects.filter(is_staff=True):
        new_ticket = Ticket()
        new_ticket.user_created = request.user
        new_ticket.user_assigned = admin_user
        new_ticket.spreadsheet = Spreadsheet.objects.get(pk=dataset_id)
        new_ticket.message = message
        new_ticket.date_created = datetime.datetime.now()
        new_ticket.ticket_type = 'NEW_MESSAGE'
        new_ticket.ticket_parent = new_parent_ticket
        new_ticket.save()
    return HttpResponse(json.dumps({"data": {"success": True}}), status=status.HTTP_200_OK)


def _get_new_user_mail_content():
    return """<h2>Congratulations!</h2>
You have registered your mail in our system.
You will receive an email when your account is verified and ready to use.

"""


def _get_validated_user_mail_content():
    link = "{}/login".format(URL_PREFIX_FOR_LINK)
    return """<h2>Congratulations!</h2>

Your account was successfully verified. You can start uploading your company's information, just log into our system: {}

""".format(link)


@api_view(['POST'])
def register_user_sports(request):
    return register_common_user(request, True)


@api_view(['POST'])
def register_user(request):
    return register_common_user(request, False)


def register_common_user(request, is_sports):
    password = request.data.get("password")
    email = request.data.get("email")
    username = request.data.get("username")
    if (not username) or (not password):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password are required"}), status=status.HTTP_400_BAD_REQUEST)
    if (not isinstance(password, str)) or (not isinstance(password, str)):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password must be strings"}), status=status.HTTP_400_BAD_REQUEST)
    try:
        CustomUser.objects.get(email=email)
        return HttpResponse(json.dumps({"success": False, "detail": "Email already exists"}), status=status.HTTP_403_FORBIDDEN)
    except CustomUser.DoesNotExist:
        try:
            CustomUser.objects.get(username=username)
            return HttpResponse(json.dumps({"success": False, "detail": "Username already exists"}), status=status.HTTP_403_FORBIDDEN)
        except CustomUser.DoesNotExist:
            new_user = CustomUser.objects.create(username=username,
                                                 email=email,
                                                 is_active=False)
            new_user.set_password(password)
            first_name = request.data.get("name")
            last_name = request.data.get("lastName") or ""
            address = request.data.get("address")
            state = request.data.get("state")
            city = request.data.get("city")
            zip_code = request.data.get("zipCode")
            new_user.first_name = first_name
            new_user.last_name = last_name
            new_user.address = address
            new_user.state = state
            new_user.city = city
            new_user.zip = zip_code
            new_user.is_sports = is_sports
            new_user.company = request.data.get("company") or ''
            new_user.company_role = request.data.get("companyRole") or ''
            new_user.save()
            if USER_REGISTRATION_VALIDATION:
                new_parent_ticket = TicketParent()
                new_parent_ticket.date_created = datetime.datetime.now()
                new_parent_ticket.save()
                for admin_user in CustomUser.objects.filter(is_staff=True):
                    new_ticket_for_admin = Ticket()
                    new_ticket_for_admin.user_created = new_user
                    new_ticket_for_admin.user_assigned = admin_user
                    new_ticket_for_admin.spreadsheet = None
                    new_ticket_for_admin.message = ''
                    new_ticket_for_admin.ticket_type = 'NEW_USER'
                    new_ticket_for_admin.date_created = datetime.datetime.now()
                    new_ticket_for_admin.ticket_parent = new_parent_ticket
                    new_ticket_for_admin.save()
                json_ret = {
                    "success": True,
                    'pending_validation': True
                }
            else:
                validate_user_and_get_message(
                    new_user, None if is_sports else new_user.company_role, None)
                json_ret = get_token_for_validated_user(new_user)
                json_ret['pending_validation'] = False
                json_ret["success"] = True
            if SEND_MAIL_NEW_USER:
                send_mail(_get_new_user_mail_content(),
                          "Welcome to Cinc Labs", email)
            return HttpResponse(json.dumps(json_ret), status=status.HTTP_200_OK)


@api_view(['POST'])
def validate_user(request):
    if request.user.is_anonymous or not request.user.is_staff:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    try:
        user_to_validate = CustomUser.objects.get(
            username=request.data.get("username"))
    except:
        return HttpResponse(json.dumps({"success": False, "detail": "Incorrect user"}), status=status.HTTP_403_FORBIDDEN)
    message = validate_user_and_get_message(user_to_validate, request.data.get("company_role"),
                                            request.user)
    return HttpResponse(json.dumps({"data": {"success": True, 'message': message}}), status=status.HTTP_200_OK)


def validate_user_and_get_message(user_to_validate, company_role, user_validating):
    user_to_validate.is_active = True
    if company_role:
        user_to_validate.company_role = company_role
    user_to_validate.save()
    message = 'User {} validated'.format(user_to_validate.username)
    if SEND_MAIL_NEW_USER:
        try:
            send_mail(_get_validated_user_mail_content(),
                      "Cinc Labs: Account verified!", user_to_validate.email)
            message += ', email sent.'
        except:
            message += ', but email could not be sent. Validate again'
    else:
        message += ', but email was not sent. Check configurations to send mail automatically.'
    if user_validating:
        Ticket.objects.filter(user_created=user_to_validate,
                              ticket_type='NEW_USER').delete()
