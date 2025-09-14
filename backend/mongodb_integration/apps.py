from django.apps import AppConfig

class MongodbIntegrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mongodb_integration'
    verbose_name = 'MongoDB Integration'