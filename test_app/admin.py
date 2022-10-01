from django.contrib import admin
from . models import ImageTable, TestReport, TestTable
from django.utils.html import format_html
import io
from django.http import FileResponse
from reportlab.pdfgen import canvas
# Register your models here.


class ImageAdmin(admin.ModelAdmin):
    list_display = ("file", )

class TestReportAdmin(admin.ModelAdmin):
    # readonly_fields = ["user_name", "email", "phone", "test", "report", "date"]
    list_display = ('test_report', 'report_link')

    def test_report(self, obj):
        return str(obj)

    def report_link(self, obj):
        return format_html(f'<a class="btn btn-success" href="/report/?report_id={obj.id}">Download</a>')

        # return '<a href="http://url-to-prepend.com/"> %s </a>' % ('http://url-to-prepend.com/')
    test_report.allow_tags = True
    test_report.short_description = 'Report'

    report_link.allow_tags = True
    report_link.short_description = 'Report Link'
    
    
class TestTableAdmin(admin.ModelAdmin):
    readonly_fields = []



admin.site.register(ImageTable, ImageAdmin)
admin.site.register(TestTable, TestTableAdmin)
admin.site.register(TestReport, TestReportAdmin)