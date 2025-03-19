import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from .serializers import *
from .models import *
from accounts.serializers import *
from accounts.models import *

# Base Consumer to handle common WebSocket operations
class BaseConsumer(AsyncWebsocketConsumer):
    group_name = None  # To be defined in subclasses

    async def connect(self):
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_data()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_data(self):
        raise NotImplementedError("Subclasses must implement send_data")

    # Updated `update` method to accept `event` argument
    async def update(self, event):
        await self.send_data()  # Calls the appropriate data sending method



# ClassConsumer to handle Class-related WebSocket connections
class ClassConsumer(BaseConsumer):
    group_name = 'class_group'

    @database_sync_to_async
    def all_classes(self):
        classes = Classes.objects.all()
        class_serializer = Classesrializer(classes, many=True)
        return class_serializer.data

    async def send_data(self):
        classes = await self.all_classes()
        await self.send(json.dumps({"Classes": classes}))

# RecitalConsumer to handle Recital-related WebSocket connections
class RecitalConsumer(BaseConsumer):
    async def connect(self):
        self.class_id = self.scope['url_route']['kwargs']['class_id']
        self.group_name = f'recital_class_{self.class_id}'  # Unique group name per class

        # Call the connect method from BaseConsumer
        await super().connect()

    @database_sync_to_async
    def all_recital(self):
        # Fetch all attendance for the specific class
        recitals = Recital.objects.filter(classes=self.class_id)
        recital_serializer = RecitalSerializer(recitals, many=True)
        return recital_serializer.data

    async def send_data(self):
        recitals = await self.all_recital()
        await self.send(json.dumps({"Recitals": recitals}))


# ReportConsumer to handle Report-related WebSocket connections
class ReportConsumer(BaseConsumer):
    async def connect(self):
        self.class_id = self.scope['url_route']['kwargs']['class_id']
        self.group_name = f'report_class_{self.class_id}'  # Unique group name per class

        # Call the connect method from BaseConsumer
        await super().connect()

    @database_sync_to_async
    def all_report(self):
        # Fetch all attendance for the specific class
        reports = Report.objects.filter(classes=self.class_id)
        report_serializer = ReportSerializer(reports, many=True)
        return report_serializer.data

    async def send_data(self):
        reports = await self.all_report()
        await self.send(json.dumps({"Reports": reports}))


# QuizConsumer to handle Quiz-related WebSocket connections
class QuizConsumer(BaseConsumer):
    async def connect(self):
        self.class_id = self.scope['url_route']['kwargs']['class_id']
        self.group_name = f'quiz_class_{self.class_id}'  # Unique group name per class

        # Call the connect method from BaseConsumer
        await super().connect()

    @database_sync_to_async
    def all_quiz(self):
        # Fetch all attendance for the specific class
        quizes = Quiz.objects.filter(classes=self.class_id)
        quiz_serializer = QuizSerializer(quizes, many=True)
        return quiz_serializer.data

    async def send_data(self):
        quizes = await self.all_quiz()
        await self.send(json.dumps({"Quizes": quizes}))


# AttendanceConsumer to handle Attendance-related WebSocket connections
class AttendanceConsumer(BaseConsumer):
    # Dynamically generate group name based on class_id and student_id
    async def connect(self):
        self.class_id = self.scope['url_route']['kwargs']['class_id']
        self.student_id = self.scope['url_route']['kwargs']['student_id']
        self.group_name = f'attendance_class_{self.class_id}_student_{self.student_id}'  # Unique group name per class and student

        # Call the connect method from BaseConsumer
        await super().connect()

    @database_sync_to_async
    def all_attendance(self):
        # Fetch all attendance for the specific class and student
        attendances = Attendance.objects.filter(classes=self.class_id, student=self.student_id)
        attendance_serializer = AttendanceSerializer(attendances, many=True)
        return attendance_serializer.data

    async def send_data(self):
        attendances = await self.all_attendance()
        await self.send(json.dumps({"Attendances": attendances}))

class AllAttendanceConsumer(BaseConsumer):
    # Dynamically generate group name based on class_id and student_id
    async def connect(self):
        self.class_id = self.scope['url_route']['kwargs']['class_id']
        self.group_name = f'attendance_class_{self.class_id}'  # Unique group name per class and student

        # Call the connect method from BaseConsumer
        await super().connect()

    @database_sync_to_async
    def all_attendance(self):
        # Fetch all attendance for the specific class and student
        attendances = Attendance.objects.filter(classes=self.class_id)
        attendance_serializer = AttendanceSerializer(attendances, many=True)
        return attendance_serializer.data

    async def send_data(self):
        attendances = await self.all_attendance()
        await self.send(json.dumps({"Attendances": attendances}))


# SectionConsumer to handle Section-related WebSocket connections
class SectionConsumer(BaseConsumer):
    group_name = 'section_group'

    @database_sync_to_async
    def all_sections(self):
        sections = Section.objects.all()
        section_serializer = SectionSerializer(sections, many=True)
        return section_serializer.data

    async def send_data(self):
        sections = await self.all_sections()
        await self.send(json.dumps({"Sections": sections}))


# SubjectConsumer to handle Subject-related WebSocket connections
class SubjectConsumer(BaseConsumer):
    group_name = 'subject_group'

    @database_sync_to_async
    def all_subjects(self):
        subjects = Subject.objects.all()
        subject_serializer = SubjectSerializer(subjects, many=True)
        return subject_serializer.data

    async def send_data(self):
        subjects = await self.all_subjects()
        await self.send(json.dumps({"Subjects": subjects}))

    async def update(self, event):
        await self.send_data() 


# CourseConsumer to handle Course-related WebSocket connections
class CourseConsumer(BaseConsumer):
    group_name = 'course_group'

    @database_sync_to_async
    def all_courses(self):
        courses = Course.objects.all()
        course_serializer = CourseSerializer(courses, many=True)
        return course_serializer.data

    async def send_data(self):
        courses = await self.all_courses()
        await self.send(json.dumps({"Courses": courses}))