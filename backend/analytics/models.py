from django.db import models
from django.contrib.auth.models import User

class SystemMetrics(models.Model):
    metric_name = models.CharField(max_length=100)
    metric_value = models.FloatField()
    metric_unit = models.CharField(max_length=50, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"{self.metric_name}: {self.metric_value} {self.metric_unit}"

class ResponseTimeLog(models.Model):
    report = models.ForeignKey('sos_reports.SOSReport', on_delete=models.CASCADE)
    response_time_minutes = models.IntegerField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Report {self.report.id}: {self.response_time_minutes} minutes"

class AIAccuracyLog(models.Model):
    report = models.ForeignKey('sos_reports.SOSReport', on_delete=models.CASCADE)
    predicted_priority = models.CharField(max_length=10)
    actual_priority = models.CharField(max_length=10)
    accuracy_score = models.FloatField()
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Report {self.report.id}: {self.accuracy_score}% accuracy"
