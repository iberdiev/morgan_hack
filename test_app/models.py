from email.policy import default
from enum import unique
from unittest.util import _MAX_LENGTH
from xmlrpc.client import Boolean
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save
from django.forms import BooleanField, CharField
import time 
# Create your models here.
def get_grid_from_test(test):
    return [row.split(',') for row in test.grid.replace(' ', '').split('\r\n')]

class ImageTable(models.Model):
    file = models.ImageField(upload_to ='',  blank=False, null=False)
    filename = models.CharField(max_length=100, blank=True, null=True, unique=True)

    def __str__(self):
        return self.filename

class TestTable(models.Model):
    name = models.CharField(max_length=100, blank=False, null=False, unique=True)
    grid = models.TextField(max_length=200000)
    active = models.BooleanField(default=False)
    answers = models.CharField(max_length=500)
    rows = models.IntegerField()
    cols = models.IntegerField()
    
    def __str__(self):
        return self.name

class TestReport(models.Model):
    user_name = models.CharField(max_length=100, blank=False, null=False,)
    email = models.CharField(max_length=100, blank=False, null=False)
    phone = models.CharField(max_length=100, blank=True, null=True)
    test = models.ForeignKey(TestTable, on_delete=models.SET_NULL, null=True)
    report = models.TextField(max_length=5000, blank=True, null=True)
    date = models.DateField('date_created', auto_now_add = True, null=True)
    gender = models.CharField(max_length=100)
    time_taken = models.CharField(max_length=100)
    
    def __str__(self) -> str:
        return f"{self.user_name} took {self.test} on {self.date}"


@receiver(pre_save, sender=ImageTable)
def pre_save_user(sender, instance, **kwargs):
    instance.filename = instance.file.name

@receiver(pre_save, sender=TestTable)
def pre_save_user(sender, instance, **kwargs):
    valid = True
    grid = get_grid_from_test(instance)
    rows = len(grid)
    cols = len(grid[0])
    for r in grid:
        if len(r) != cols:
            valid = False
            break
    
    for row in grid:
        for filename in row:
            try:
                ImageTable.objects.get(filename=filename)
            except:
                valid = False
                break
    
    answers = instance.answers.replace(' ', '').split(',')
    for filename in answers:
        try:
            ImageTable.objects.get(filename=filename)
        except:
            valid = False
            break

    if not valid:
        raise Exception('OMG')
    
    instance.rows = rows
    instance.cols = cols
    


class TestToken(models.Model):
    test_token = models.CharField(unique=True, blank=False, null=False, max_length=200)
    valid = models.BooleanField(default=True)
    email = models.CharField(max_length=100)
    send_results = models.BooleanField(default=False)
    test = models.ForeignKey(TestTable, on_delete=models.SET_NULL, null=True)
    def __str__(self):
        return f'{self.email} | {"pending" if self.valid else "took"} | {self.test.name if self.test else ""} |{"" if self.send_results else "not " }sending results'
