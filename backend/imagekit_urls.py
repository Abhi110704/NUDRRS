from django.urls import path
import imagekit_views

urlpatterns = [
    path('upload/', imagekit_views.upload_image, name='imagekit_upload'),
    path('upload-base64/', imagekit_views.upload_base64_image, name='imagekit_upload_base64'),
    path('delete/<str:file_id>/', imagekit_views.delete_image, name='imagekit_delete'),
    path('details/<str:file_id>/', imagekit_views.get_image_details, name='imagekit_details'),
    path('thumbnail/<str:file_id>/', imagekit_views.get_thumbnail_url, name='imagekit_thumbnail'),
    path('optimized/<str:file_id>/', imagekit_views.get_optimized_url, name='imagekit_optimized'),
    path('status/', imagekit_views.imagekit_status, name='imagekit_status'),
]
