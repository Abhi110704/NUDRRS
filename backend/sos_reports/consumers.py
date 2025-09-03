import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import SOSReport

class ReportConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'reports'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'report_message',
                'message': message
            }
        )
    
    async def report_message(self, event):
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
    
    async def new_report(self, event):
        # Send new report notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_report',
            'report': event['report']
        }))
    
    async def report_update(self, event):
        # Send report update notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'report_update',
            'report': event['report']
        }))
