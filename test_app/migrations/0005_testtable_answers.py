# Generated by Django 4.1.1 on 2022-09-30 11:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("test_app", "0004_testtable_testreport"),
    ]

    operations = [
        migrations.AddField(
            model_name="testtable",
            name="answers",
            field=models.CharField(default="", max_length=500),
            preserve_default=False,
        ),
    ]
