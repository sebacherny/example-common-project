import json
from django.http import HttpResponse
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.views import ObtainAuthToken
from app.models import CustomUser, SolarSystem
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


class CustomAuthToken(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        try:
            user_by_mail = CustomUser.objects.get(
                email=request.data["username"])
            request.data["username"] = user_by_mail.username
            if not user_by_mail.is_active:
                return HttpResponse(json.dumps({"success": False, "detail": "Inactive user"}),
                                    status=status.HTTP_401_UNAUTHORIZED)
        except CustomUser.DoesNotExist:
            pass
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError:
            return HttpResponse(json.dumps({"success": False, "detail": "Incorrect credentials"}),
                                status=status.HTTP_401_UNAUTHORIZED)
        user = dict(serializer.validated_data)["user"]
        refresh_token = RefreshToken.for_user(user)
        first_system = SolarSystem.objects.filter(user=user).first()
        return HttpResponse(json.dumps({
            'access': str(refresh_token.access_token),
            'refresh': str(refresh_token),
            'user_id': user.pk,
            'username': user.username,
            'is_admin': user.is_staff,
            'first_system': str(first_system.id) if first_system else None
        }), status=status.HTTP_200_OK)
