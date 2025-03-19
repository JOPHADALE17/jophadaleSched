import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from accounts.models import Student
from classes.serializers import *
from channels.db import database_sync_to_async

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from accounts.models import Student

class StudentConsumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def all_student(self):
        students = Student.objects.all()  # Get all student instances
        student_serializer = StudentSerializer(students, many=True)  # Serialize the queryset
        student_data = student_serializer.data  # Get the serialized data
        return student_data
    
    async def connect(self):
        # Global student group
        self.student_group_name = 'student_group'

        # Join global student group
        await self.channel_layer.group_add(
            self.student_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send_Student_data()

    async def disconnect(self, close_code):
        # Leave global student group
        await self.channel_layer.group_discard(
            self.student_group_name,
            self.channel_name
        )
        
    async def send_Student_data(self):
        student = await self.all_student()
        await self.send(json.dumps({"Student": student}))

    async def update(self, event):
        await self.send_Student_data()

