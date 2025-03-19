from rest_framework.serializers import ModelSerializer
from accounts.models import *
from .models import *

from rest_framework.serializers import ModelSerializer

class TeacherSerializer(ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class StudentSerializer(ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'
        
class SubjectSerializer(ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class SectionSerializer(ModelSerializer):
    class Meta:
        model = Section
        fields = '__all__'

class CourseSerializer(ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class ClassesSerializer(ModelSerializer):
    class Meta:
        model = Classes
        fields = '__all__'

class QuizSerializer(ModelSerializer):
    class Meta:
        model = Quiz
        fields = '__all__'

class ReportSerializer(ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'

class RecitalSerializer(ModelSerializer):
    class Meta:
        model = Recital
        fields = '__all__'

class AttendanceSerializer(ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'