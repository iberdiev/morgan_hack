# Generated by Django 4.1.1 on 2022-10-01 13:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("test_app", "0006_alter_testreport_email_alter_testreport_user_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="testreport",
            name="email",
            field=models.CharField(max_length=100),
        ),
    ]