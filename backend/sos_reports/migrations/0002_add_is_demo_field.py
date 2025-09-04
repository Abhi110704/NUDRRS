from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('sos_reports', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sosreport',
            name='is_demo',
            field=models.BooleanField(default=False, help_text='Whether this is a demo report'),
        ),
    ]
