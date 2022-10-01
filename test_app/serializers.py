from rest_framework import serializers
from . models import TestTable, ImageTable


class TestTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestTable
        fields = ('pk', 'name',)

class ImageTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageTable
        fields = ('filename',)


