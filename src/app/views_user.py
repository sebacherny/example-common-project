import uuid
from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from app.mail_sender import send_mail
from app.models import CustomUser
import json
import datetime
import jwt
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django_files.settings import MAIL_SENDER_USER

@api_view(['GET'])
def user_info(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    return HttpResponse(json.dumps({"data": {"username": request.user.username,
                                    "name": request.user.first_name,
                                    "address": request.user.address,
                                    "payment_type": request.user.payment_type,
                                    "account_balance": request.user.account_balance}}))


@api_view(['POST'])
def ask_question(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
    message = request.data.get("message")
    send_mail(message, "New question from {}".format(request.user.id), MAIL_SENDER_USER)
    return HttpResponse(json.dumps({"data": {"success": True}}), status=status.HTTP_200_OK)


@api_view(['POST'])
def register_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
    name = request.data.get("name")
    payment_type = request.data.get("paymentType")
    account_balance = request.data.get("accountBalance")
    address = request.data.get("address")
    if (not username) or (not password):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password are required"}), status=status.HTTP_400_BAD_REQUEST)
    if (not isinstance(password, str)) or (not isinstance(password, str)):
        return HttpResponse(json.dumps({"success": False, "detail": "Username and password must be strings"}), status=status.HTTP_400_BAD_REQUEST)
    try:
        CustomUser.objects.get(username=username)
        return HttpResponse(json.dumps({"success": False, "detail": "User already exists"}), status=status.HTTP_403_FORBIDDEN)
    except CustomUser.DoesNotExist:
        try:
            CustomUser.objects.get(email=email)
            return HttpResponse(json.dumps({"success": False, "detail": "Email already in use"}), status=status.HTTP_403_FORBIDDEN)
        except CustomUser.DoesNotExist:
            try:
                CustomUser.objects.get(email=username)
                return HttpResponse(json.dumps({"success": False, "detail": "Email from username already in use"}), status=status.HTTP_403_FORBIDDEN)
            except CustomUser.DoesNotExist:
                new_user = CustomUser.objects.create(username=username,
                                                     email=email,
                                                     first_name=name,
                                                     payment_type=payment_type,
                                                     account_balance=account_balance,
                                                     address=address)
                new_user.set_password(password)
                new_user.save()
                new_user_token = TokenObtainPairSerializer.get_token(new_user)
                return HttpResponse(json.dumps({"success": True,
                                                "access": str(new_user_token.access_token),
                                                "refresh": str(new_user_token),
                                                "username": username}), status=status.HTTP_200_OK)