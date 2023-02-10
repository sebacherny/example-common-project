from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist
from app.models import AlumniDataset, StudentInformation
import json
import datetime


def serialize_student_row(student_row):
    ret = model_to_dict(student_row)
    ret['date_added'] = None
    return ret


@ api_view(['POST', 'GET'])
def sports_dataset(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "POST":
        if not request.user.is_staff:
            return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)
        try:
            alumni_dataset = AlumniDataset.objects.filter(user=request.user)[0]
        except IndexError:
            alumni_dataset = AlumniDataset(
                user=request.user, date_added=datetime.datetime.now())
            alumni_dataset.save()
        StudentInformation.objects.filter(
            alumni_dataset=alumni_dataset).delete()
        previous_rows_count = 0
        all_rows_to_add = []
        for student_row in request.data.get('jsonData', []):
            row_obj = StudentInformation()
            row_obj.index_in_sheet = previous_rows_count + \
                len(all_rows_to_add) + 1
            row_obj.first_name = student_row.get('First Name') or ''
            row_obj.last_name = student_row.get('Last Name') or ''
            row_obj.employer = student_row.get('Current Employer') or ''
            row_obj.title = student_row.get('Current Title') or ''
            row_obj.graduation_year = int(
                student_row.get('Year Graduated') or '0') or None
            row_obj.major = student_row.get('Major') or ''
            row_obj.college = student_row.get('College') or ''
            row_obj.linkedin_page = student_row.get('LinkedIn Page Link') or ''
            row_obj.state = student_row.get('State') or ''
            row_obj.industry_type = student_row.get('Industry Type') or ''
            row_obj.alumni_dataset = alumni_dataset
            row_obj.date_added = datetime.datetime.now()
            all_rows_to_add.append(row_obj)
        for row in all_rows_to_add:
            row.save()
        return HttpResponse(json.dumps({"success": True, 'rows_added': len(all_rows_to_add)}), status=status.HTTP_200_OK)
    if request.method == "GET":
        return HttpResponse(json.dumps({
            "success": True,
            'rows': [serialize_student_row(student_row) for student_row in StudentInformation.objects.all()]}), status=status.HTTP_200_OK)
