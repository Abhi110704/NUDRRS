from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import RegexValidator

class SOSReport(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('FALSE_ALARM', 'False Alarm'),
    ]
    
    DISASTER_TYPES = [
        ('FLOOD', 'Flood'),
        ('EARTHQUAKE', 'Earthquake'),
        ('FIRE', 'Fire'),
        ('CYCLONE', 'Cyclone'),
        ('LANDSLIDE', 'Landslide'),
        ('MEDICAL', 'Medical Emergency'),
        ('ACCIDENT', 'Accident'),
        ('OTHER', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+[1-9]\d{9,14}$',
                message='Enter a valid international phone number (e.g., +919876543210)'
            )
        ]
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField()
    disaster_type = models.CharField(max_length=20, choices=DISASTER_TYPES)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    ai_verified = models.BooleanField(default=False)
    ai_confidence = models.FloatField(default=0.0)
    ai_fraud_score = models.FloatField(default=0.0, help_text='AI fraud detection score (0.0-1.0)')
    ai_analysis_data = models.JSONField(default=dict, blank=True, help_text='Detailed AI analysis results')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_reports')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.disaster_type} - {self.priority} - {self.created_at}"
    
    def get_vote_counts(self):
        """Get vote counts for this report"""
        from django.db.models import Count
        votes = self.votes.values('vote_type').annotate(count=Count('vote_type'))
        vote_counts = {vote['vote_type']: vote['count'] for vote in votes}
        return {
            'still_there': vote_counts.get('STILL_THERE', 0),
            'resolved': vote_counts.get('RESOLVED', 0),
            'fake_report': vote_counts.get('FAKE_REPORT', 0),
            'total': sum(vote_counts.values())
        }
    
    def get_vote_percentages(self):
        """Get vote percentages for this report"""
        counts = self.get_vote_counts()
        total = counts['total']
        if total == 0:
            return {'still_there': 0, 'resolved': 0, 'fake_report': 0}
        
        return {
            'still_there': round((counts['still_there'] / total) * 100, 1),
            'resolved': round((counts['resolved'] / total) * 100, 1),
            'fake_report': round((counts['fake_report'] / total) * 100, 1)
        }
    
    def check_and_update_status(self):
        """Check votes and update status based on 60% criteria or report owner vote"""
        counts = self.get_vote_counts()
        total = counts['total']
        
        if total == 0:
            return
        
        # If report owner votes resolved, automatically resolve
        owner_vote = self.votes.filter(user=self.user, vote_type='RESOLVED').first()
        if owner_vote:
            self.status = 'RESOLVED'
            self.save()
            return
        
        # Check 60% criteria
        resolved_percentage = (counts['resolved'] / total) * 100
        fake_percentage = (counts['fake_report'] / total) * 100
        
        if resolved_percentage >= 60:
            self.status = 'RESOLVED'
            self.save()
        elif fake_percentage >= 60:
            self.status = 'REJECTED'
            self.save()

class ReportMedia(models.Model):
    MEDIA_TYPES = [
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
        ('AUDIO', 'Audio'),
    ]
    
    report = models.ForeignKey(SOSReport, related_name='media', on_delete=models.CASCADE)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    
    # ImageKit fields
    imagekit_file_id = models.CharField(max_length=255, blank=True, null=True, help_text='ImageKit file ID')
    imagekit_url = models.URLField(blank=True, null=True, help_text='ImageKit URL')
    imagekit_name = models.CharField(max_length=255, blank=True, null=True, help_text='Original filename')
    imagekit_size = models.IntegerField(blank=True, null=True, help_text='File size in bytes')
    imagekit_file_type = models.CharField(max_length=50, blank=True, null=True, help_text='MIME type')
    
    # Legacy file field (for backward compatibility)
    file = models.FileField(upload_to='reports/%Y/%m/%d/', blank=True, null=True)
    
    ai_analysis = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.report.id} - {self.media_type}"
    
    @property
    def image_url(self):
        """Get the image URL (ImageKit or local file)"""
        if self.imagekit_url:
            return self.imagekit_url
        elif self.file:
            return self.file.url
        return None
    
    @property
    def thumbnail_url(self):
        """Get thumbnail URL from ImageKit"""
        if self.imagekit_file_id:
            from imagekit_service import imagekit_service
            return imagekit_service.get_thumbnail_url(self.imagekit_file_id, width=300, height=300)
        return self.image_url

class ReportUpdate(models.Model):
    report = models.ForeignKey(SOSReport, related_name='updates', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    status_change = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Update for {self.report.id} by {self.user.username}"

class ReportVote(models.Model):
    VOTE_CHOICES = [
        ('STILL_THERE', 'Still There'),
        ('RESOLVED', 'Resolved'),
        ('FAKE_REPORT', 'Fake Report'),
    ]
    
    report = models.ForeignKey(SOSReport, related_name='votes', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=15, choices=VOTE_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['report', 'user']  # One vote per user per report
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} voted {self.vote_type} on report {self.report.id}"
