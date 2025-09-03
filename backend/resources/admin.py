from django.contrib import admin
from .models import ResourceType, Resource, ResourceDeployment

@admin.register(ResourceType)
class ResourceTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name', 'description']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'resource_type', 'status', 'capacity', 'contact_number']
    list_filter = ['resource_type', 'status', 'created_at']
    search_fields = ['name', 'address', 'contact_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'resource_type', 'latitude', 'longitude', 'address')
        }),
        ('Details', {
            'fields': ('capacity', 'status', 'contact_number', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(ResourceDeployment)
class ResourceDeploymentAdmin(admin.ModelAdmin):
    list_display = ['resource', 'report', 'deployed_by', 'status', 'deployed_at']
    list_filter = ['status', 'deployed_at']
    readonly_fields = ['deployed_at']
