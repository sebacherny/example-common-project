from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
import json
from app.linkedin_scrapper import scrap_data


@ api_view(['GET'])
def get_scrapped_data(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        scrapped_data = scrap_data(
            'sebascherny@gmail.com', 'JustForLinkedin12')
        return HttpResponse(json.dumps({"data": scrapped_data}), status=status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
