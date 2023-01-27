import uuid
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from app.mail_sender import send_mail
from app.models import CustomUser
import json
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny

from django_files.settings import MAIL_SENDER_USER, SEND_MAIL_NEW_USER, URL_PREFIX_FOR_LINK

def serialize_user(user):
    return {
        "username": user.username,
        "name": user.first_name,
        "address": user.address,
        "payment_type": user.payment_type,
        "account_balance": user.account_balance,
        "is_admin": user.is_staff,
        "is_active": user.is_active
    }

@api_view(['GET'])
@permission_classes([AllowAny])
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
    send_mail(_get_new_user_mail_content(user.registration_random_code), "Welcome to SEN", request_mail)
    return HttpResponse(json.dumps({"success": True}), status=status.HTTP_200_OK)

@api_view(['POST'])
def ask_question(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    message = request.data.get("message")
    send_mail(message, "New question from {}".format(request.user.id), MAIL_SENDER_USER)
    return HttpResponse(json.dumps({"data": {"success": True}}), status=status.HTTP_200_OK)

def _get_new_user_mail_content(random_str):
    link = "{}/welcome/{}".format(URL_PREFIX_FOR_LINK, random_str)
    return """<h2>Congratulations!</h2>
You have registered your mail in our system.
To upload the last details and start monitoring your solar systems, click <a href='{}'>here</a>

""".format(link)

@api_view(['POST'])
def register_user(request):
    password = request.data.get("password")
    email = request.data.get("email")
    username = email
    if (not username) or (not password):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password are required"}), status=status.HTTP_400_BAD_REQUEST)
    if (not isinstance(password, str)) or (not isinstance(password, str)):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password must be strings"}), status=status.HTTP_400_BAD_REQUEST)
    try:
        CustomUser.objects.get(email=email)
        return HttpResponse(json.dumps({"success": False, "detail": "Email already exists"}), status=status.HTTP_403_FORBIDDEN)
    except CustomUser.DoesNotExist:
        random_str = str(uuid.uuid4())
        new_user = CustomUser.objects.create(username=username,
                                             email=email,
                                             is_active=False,
                                             registration_random_code=random_str)
        new_user.set_password(password)
        new_user.save()
        if SEND_MAIL_NEW_USER:
            send_mail(_get_new_user_mail_content(random_str), "Welcome to SEN", email)
        return HttpResponse(json.dumps({"success": True,
                                        "registration_random_code": random_str}), status=status.HTTP_200_OK)

@api_view(['POST'])
def validate_user(request):
    try:
        user = CustomUser.objects.get(username=request.data.get("username"))
    except:
        return HttpResponse(json.dumps({"success": False, "detail": "Incorrect user"}), status=status.HTTP_403_FORBIDDEN)
    first_name = request.data.get("name")
    last_name = request.data.get("lastName") or ""
    role = request.data.get("role")
    payment_type = request.data.get("paymentType")
    account_balance = request.data.get("accountBalance")
    address = request.data.get("address")
    state = request.data.get("state")
    city = request.data.get("city")
    zip_code = request.data.get("zipCode")
    user.first_name = first_name
    user.last_name = last_name
    user.role = role
    user.payment_type = payment_type
    user.account_balance = account_balance
    user.address = address
    user.state = state
    user.city = city
    user.zip = zip_code
    user.is_active = True
    user.save()
    new_user_token = TokenObtainPairSerializer.get_token(user)
    return HttpResponse(json.dumps({"success": True,
                                    "access": str(new_user_token.access_token),
                                    "refresh": str(new_user_token),
                                    "username": user.username,
                                    'is_admin': user.is_staff,
                                    }), status=status.HTTP_200_OK)