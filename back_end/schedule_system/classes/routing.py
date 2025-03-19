from django.urls import path
from .consumers import *

websocket_urlpatterns = [
    path('ws/class/', ClassConsumer.as_asgi()),
    path('ws/quiz/<int:class_id>/', QuizConsumer.as_asgi()),
    path('ws/attendance/<int:class_id>/<int:student_id>/', AttendanceConsumer.as_asgi()),
    path('ws/allattendance/<int:class_id>/', AllAttendanceConsumer.as_asgi()),
    path('ws/recital/<int:class_id>/', RecitalConsumer.as_asgi()),
    path('ws/report/<int:class_id>/', ReportConsumer.as_asgi()),
    path('ws/course/', CourseConsumer.as_asgi()),
    path('ws/section/', SectionConsumer.as_asgi()),
    path('ws/subject/', SubjectConsumer.as_asgi()),
]
