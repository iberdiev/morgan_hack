# Generated by Django 3.2 on 2022-10-06 11:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('test_app', '0014_testtable_prompt'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testtable',
            name='prompt',
            field=models.TextField(max_length=1000),
        ),
    ]
