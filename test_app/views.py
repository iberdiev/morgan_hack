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
import io, math
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import mm

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from morgan_hack.settings import EMAIL_HOST_USER, ORIGIN_IP, FRONTEND_IP
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
        return Response({"grid": grid, "prompt": test.prompt, "answers": test.answers.replace(' ', '').split(',')})


class ImageTableView(APIView):
    def get(self, request):
        images = [img.filename for img in ImageTable.objects.all()]
        return Response(images)

def add_report(request):
    data = request.POST.dict()
    time_taken = eval(data['timeFinished'])
    # try:
    test_token = TestToken.objects.get(test_token=data["token"])
    if test_token.valid:
        test_report = TestReport(
            user_name = data['name'],
            gender = data['gender'],
            email = data['email'],
            time_taken = f"{time_taken['minute']} min {time_taken['second']} sec",
            phone = data['phone1'],
            test = TestTable.objects.get(id=int(data['test_id'])),
        )

        test_data = eval(data['testData'])
        report = ''
        total_errors = 0
        pictures_revised_total = 0
        pictures_revised_per_minute_list = []
        if test_report.test.name == 'Chair-lamp (Visio-perceptual abilities)':
            for i in range(6):
                if str(i) not in test_data: break
                curr_errors = test_data[str(i)]['incorrect_selected']+test_data[str(i)]['missed']
                total_errors += curr_errors
                revised = int(test_data[str(i)]['current_max_revised']['row']) * test_report.test.cols + int(test_data[str(i)]['current_max_revised']['col'])
                pictures_revised_per_minute = revised - pictures_revised_total
                pictures_revised_per_minute_list += [pictures_revised_per_minute]
                pictures_revised_total = max(pictures_revised_total, revised)
                report += f"Minute: {i}; Revised: {revised}; Errors: {curr_errors}; QualOfAttent: {curr_errors/pictures_revised_per_minute * 100}"
            report += f"\nQualOfAttentTotal: {total_errors/pictures_revised_total * 100}"
            report += f"\nExtentOfAttention: {max(pictures_revised_per_minute_list)-min(pictures_revised_per_minute_list)}"
            performance_score = (pictures_revised_total-total_errors)/pictures_revised_total*100
            report += f"\nPerformance: {performance_score}%; Verdict: "
            if performance_score >=97: report += 'OK'
            elif performance_score >= 95: report += 'Under the average'
            else: report += 'attention disorder'
            
            avgPicPerMinRev = sum(pictures_revised_per_minute_list) / len(pictures_revised_per_minute_list)
            avgDistNOfPicRevPerMin = sum([abs(n-avgPicPerMinRev) for n in pictures_revised_per_minute_list]) / len(pictures_revised_per_minute_list)
            report += f'\nThe average difference between the number of revised \npictures/each minute is: {avgDistNOfPicRevPerMin} pieces\n'
            report += '\nIf the differences between the minute results are \nhigher than 20, it reflects a fluctuating attention\n'
            report += '\nIf the last minute performance is very good, it refers\n to a strong motivation and desire to conform\n'
            report += '\nIf the last minute performance is very poor, it refersto fatigue'
            
        elif test_report.test.name == 'Toulouse-Piéron Cancelation Test (Visio-perceptual)':
            pictures_revised_total = int(test_data[str(0)]['current_max_revised']['row']) * test_report.test.cols + int(test_data[str(0)]['current_max_revised']['col'])
            total_errors = int(test_data[str(0)]['missed']) + int(test_data['0']['incorrect_selected'])
            performance_score = (pictures_revised_total-total_errors)/pictures_revised_total*100
            report += f"\nPerformance: {performance_score}%; Verdict: "
            if performance_score >=97: report += 'OK'
            elif performance_score >= 95: report += 'Under the average'
            else: report += 'attention disorder'

        elif test_report.test.name == 'Bourdon (Visio-perceptual)':
            t = test_data['timeFinished'] ## seconds
            N = test_data['current_max_revised']['row'] * test_report.test.cols + test_data['current_max_revised']['col']
            C = test_data['current_max_revised']['row'] + 1
            n = test_data['correct'] + test_data['missed']
            M = test_data['correct'] + test_data['incorrect_selected']
            S = test_data['correct']
            P = test_data['missed']
            O = test_data['incorrect_selected']

            A = N / t
            T1 = M/n
            T2 = S/n
            T3 = (M-O)/(M+P)
            E = N*T2
            Au = (N/t)*((M-(O+P))/n)
            K = ((M-O)*100)/n
            Ku = C*(C/(P+O+(0 if (P+O) else 1)))
            V = 0.5936*N
            Q=(V-2.807*(P+Q))/t
            report += f'Attention Level: {Q}'
            report += f'\nStability of concentration of attention: {Ku}; '
            if Ku >= 172: report += 'Very high'
            elif Ku >= 96.1: report += 'High'
            elif Ku >= 50.7: report += 'Average'
            else: report += 'Low'

        
        test_report.report = report
        test_report.save()

        test_token.valid = False
        test_token.save()
        if test_token.send_results:
            send_email_custom("Salva Vita Test Results", report, [test_report.email.split()])

    return JsonResponse(json.dumps({"status": "ok"}), status=200, safe=False)

    # except Exception as e:
    #     print(e)
    #     return JsonResponse(json.dumps({"status": "bad"}), status=400, safe=False)

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
    curr = 630
    for line in report_lines:
        p.drawString(100,curr + customMargin, line)
        curr -= 20

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
                f"Your test link: {FRONTEND_IP}html/test_page.html/?token={test_token.test_token}&test_id={test_id}",
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
    
