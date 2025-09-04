from django.contrib import admin
from .models import ResourceRequest, ResourceAllocation, ResourceInventory, AllocationHistory


@admin.register(ResourceRequest)
class ResourceRequestAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'requested_by', 'resource_type', 'quantity_requested',
        'priority', 'status', 'requested_at', 'required_by'
    ]
    list_filter = [
        'resource_type', 'priority', 'status', 'requested_at'
    ]
    search_fields = [
        'title', 'description', 'requested_by__email', 'destination_address'
    ]
    readonly_fields = ['requested_at']


@admin.register(ResourceAllocation)
class ResourceAllocationAdmin(admin.ModelAdmin):
    list_display = [
        'request', 'allocated_resource', 'allocated_quantity',
        'allocated_by', 'allocated_at', 'is_delivered'
    ]
    list_filter = ['allocated_at', 'is_delivered']
    search_fields = ['request__title', 'allocated_resource__name']


@admin.register(ResourceInventory)
class ResourceInventoryAdmin(admin.ModelAdmin):
    list_display = [
        'resource', 'current_stock', 'available_stock',
        'is_low_stock', 'last_updated'
    ]
    list_filter = ['is_low_stock', 'last_updated']
    search_fields = ['resource__name']


@admin.register(AllocationHistory)
class AllocationHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'allocation', 'status', 'updated_by', 'updated_at'
    ]
    list_filter = ['status', 'updated_at']
    search_fields = ['allocation__request__title']
