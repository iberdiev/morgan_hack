
from turtle import done
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from . import views

urlpatterns = [
    path('tests/', views.TestTableView.as_view()),
    path('images/', views.ImageTableView.as_view()),
    path('test_detail/', views.TestTableDetailView.as_view()),
    path('report/', views.generate_pdf, ),
    path('add_report/', views.add_report, ),
    path('generate_test/', views.generate_test, ),
    path('check_token/', views.check_token, ),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



