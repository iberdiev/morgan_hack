import code
from email import message
from tokenize import Token
from django.http import HttpResponse, JsonResponse
from multiprocessing.dummy import active_children
from django.shortcuts import render
from rest_framework.response import Response
from rest_auth.views import APIView
from . models import TestTable, TestReport, TestToken
from . serializers import TestTableSerializer, ImageTableSerializer
from rest_framework.exceptions import NotFound
from . models import get_grid_from_test, ImageTable, TestReport
import io
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import mm

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from morgan_hack.settings import EMAIL_HOST_USER, ORIGIN_IP
import time, json
# Create your views here.
class TestTableView(APIView):
    def get(self, request):
        tests = TestTable.objects.filter(active=True)
        data = TestTableSerializer(tests, many=True).data
        return Response(data)

class TestTableDetailView(APIView):
    def get(self, request):
        try:
            test = TestTable.objects.get(pk=int(self.request.query_params.get('test_id')))
            
        except:
            raise NotFound(detail="Error 404, Test not found", code=404)

        grid = get_grid_from_test(test)
        return Response({"grid": grid, "answers": test.answers.replace(' ', '').split(',')})


class ImageTableView(APIView):
    def get(self, request):
        images = [img.filename for img in ImageTable.objects.all()]
        return Response(images)

def add_report(request):
    data = request.POST

    try:
        test_token = TestToken.objects.get(test_token=data["token"])
        if test_token.valid:
            TestReport(
                user_name = data['user_name'],
                email = data['email'],
                phone = data['phone'],
                report = data['report'],
                test = TestTable.objects.get(id=int(data['test'])),
            ).save()
            test_token.valid = False
            test_token.save()
            if test_token.send_results:
                pass

        return HttpResponse("OK", status=200)

    except Exception as e:
        print(e)
        return HttpResponse("Failed to created", status=400)

def generate_pdf(request):

    report_obj = TestReport.objects.get(pk=int(request.GET['report_id']))
    report_lines = report_obj.report.replace('\r', '').split('\n')
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)
    image = ImageReader('./report_templates/1.png')
    height, width = image.getSize()
    customMargin = -200
    p.drawImage(image,-80, -80, width=760, height=1000,)
    p.drawString(100,800 + customMargin, f"Name: {report_obj.user_name}")
    p.drawString(100,770 + customMargin, f"Email: {report_obj.email}")
    p.drawString(100,740 + customMargin, f"Phone: {report_obj.phone}")
    p.drawString(100,710 + customMargin, f"Date: {report_obj.date}")
    p.drawString(100,680 + customMargin, f"Test: {report_obj.test.name}")
    p.drawString(100,650 + customMargin, "Test results: ")
    curr = 650
    for line in report_lines:
        p.drawString(150,curr + customMargin, line)
        curr -= 10

    p.showPage()
    p.save()
    buffer.seek(0)
    FileResponse()
    return FileResponse(buffer, as_attachment=True, filename='hello.pdf')

def send_email_custom(subject, message, emails):
    send_mail(subject, message, EMAIL_HOST_USER, emails, fail_silently=False)

def generate_test(request):
    try:
        data = request.POST
        participants = data['participants'].split(',')
        test_id = data['test_id']
        test_id = int(test_id[0])
        for user in participants:
            test_token = TestToken.objects.create(
                test_token=str(hash(time.time())),
                email=user.split(),
                test=TestTable.objects.get(pk=test_id)

            )
            send_email_custom(
                "Welcome to Salva Vita",
                f"Your test link: {ORIGIN_IP}salva-vita-test/?token={test_token.test_token}&test_id={test_id}",
                [user.split()],
            )
    except Exception as e:
        print(e)
        return HttpResponse("Failed", status=400)
    return HttpResponse("Done", status=200)

def check_token(request):
    try:
        token = TestToken.objects.get(test_token=request.GET['token'])
        return JsonResponse(json.dumps({"status": "ok" if token.valid else "used"},),  safe=False, status=200)
    except Exception as e:
        print(e)
        return JsonResponse(json.dumps({"status": "notok"},),  safe=False, status=400)
    
