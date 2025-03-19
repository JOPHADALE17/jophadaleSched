from django.shortcuts import render
from .serializers import *
from accounts.serializers import *
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from accounts.models import *
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .utils import *
from accounts.utils import *
from firebase_admin import messaging
from django.conf import settings
from django.core.mail import send_mail
from django.utils.dateformat import DateFormat
from datetime import datetime

host_email = settings.EMAIL_HOST_USER

from django.utils.dateparse import parse_date
from django.utils.dateformat import DateFormat

def send_attendance_email(class_pk, student_id, present, absent, late, date):
    try:
        # Fetch the student and class details
        student = Student.objects.get(id=student_id)
        class_details = Classes.objects.get(id=class_pk)
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        student_name = student.user.get_full_name()
        student_email = student.user.email
        class_name = class_details.subject.name
        
        # Parse the date string to a datetime object
        parsed_date = parse_date(date)  # Convert date string to a date object
        if not parsed_date:
            raise ValueError("Invalid date format.")

        # Format the date
        formatted_date = DateFormat(parsed_date).format('F j, Y')  # Format date as 'Month day, Year'

        # Determine the attendance status (only one will be shown)
        if present:
            attendance_status = "Present"
        elif absent:
            attendance_status = "Absent"
        elif late:
            attendance_status = "Late"
        else:
            attendance_status = "No attendance status available."

        # Build the email content
        subject = f"Attendance Update for {class_name} on {formatted_date}"
        message = f"""
        Dear {student_name},

        Your attendance has been updated for the class: {class_name} on {formatted_date}.
        
        Attendance Status: {attendance_status}
        
        Thank you,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """

        # Send the email
        send_mail(subject, message, host_email, [student_email])

    except Student.DoesNotExist:
        print(f"Student with ID {student_id} not found.")
    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")
    except ValueError as e:
        print(e)  # Log or handle the invalid date format



# Helper function to send email notification to all students in the same class
def send_notification_to_class(class_pk, subject, message):
    try:
        class_details = Classes.objects.get(id=class_pk)
        students = Student.objects.filter(
            course=class_details.course, 
            section=class_details.section, 
            year_level=class_details.year_level
        )
        
        # Collect all student emails
        recipient_list = [student.user.email for student in students]
        
        # Send the email
        send_mail(subject, message, host_email, recipient_list)
        
    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")

# Function to send quiz notification email
def send_quiz_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message
        subject = f"New Quiz Notification for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        A new quiz has been scheduled for your class: {class_name}.
        
        Quiz Topic: {about}
        Date: {formatted_date}
        
        Please prepare accordingly.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")

# Function to send notification email for quiz update
def send_quiz_update_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message for quiz update
        subject = f"Quiz Updated for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        The quiz scheduled for your class {class_name} has been updated.
        
        Updated Quiz Topic: {about}
        Date: {formatted_date}
        
        Please review the changes and prepare accordingly.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")

# Function to send notification email for quiz deletion
def send_quiz_delete_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message for quiz deletion
        subject = f"Quiz Deleted for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        The quiz previously scheduled for your class {class_name} has been deleted.
        
        Quiz Topic: {about}
        Date: {formatted_date}
        
        No further actions are required.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")



# Function to send notification email for report update
def send_report_update_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message for report update
        subject = f"Report Updated for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        The report for your class {class_name} has been updated.
        
        Updated Report Topic: {about}
        Date: {formatted_date}
        
        Please review the changes at your earliest convenience.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")

# Function to send notification email for recital update
def send_recital_update_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message for recital update
        subject = f"Recital Updated for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        The recital scheduled for your class {class_name} has been updated.
        
        Updated Recital Topic: {about}
        Date: {formatted_date}
        
        Please take note of the changes.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")

# Function to send notification email for recital deletion
def send_recital_delete_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message for recital deletion
        subject = f"Recital Deleted for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        The recital previously scheduled for your class {class_name} has been deleted.
        
        Recital Topic: {about}
        Date: {formatted_date}
        
        No further actions are required.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")


# Function to send recital notification email
def send_recital_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message
        subject = f"New Recital Notification for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        A new recital has been scheduled for your class: {class_name}.
        
        Recital Topic: {about}
        Date: {formatted_date}
        
        Please make sure to participate or attend.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")

# Function to send report notification email
def send_report_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message
        subject = f"New Report Notification for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        A new report has been added for your class: {class_name}.
        
        Report Topic: {about}
        Date: {formatted_date}
        
        Please review the report at your earliest convenience.

        Best regards,
        Your teacher {class_teacher_first_name} {class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")


# Function to send notification email for report deletion
def send_report_delete_email(class_pk, date, about):
    try:
        class_details = Classes.objects.get(id=class_pk)
        class_name = class_details.subject.name
        class_teacher_first_name = class_details.teacher.first_name
        class_teacher_last_name = class_details.teacher.last_name
        formatted_date = DateFormat(date).format('F j, Y')  # Format date as 'Month day, Year'
  # Format date as 'Month day, Year'
        
        # Customize email subject and message for report deletion
        subject = f"Report Deleted for {class_name} on {formatted_date}"
        message = f"""
        Dear Students,

        The report previously scheduled for your class {class_name} has been deleted.
        
        Report Topic: {about}
        Date: {formatted_date}
        
        No further actions are required.

        Best regards,
        Your teacher {class_teacher_first_name} { class_teacher_last_name}
        """
        
        # Send notification to all students in the class
        send_notification_to_class(class_pk, subject, message)

    except Classes.DoesNotExist:
        print(f"Class with ID {class_pk} not found.")


# useraccount views________________________________________________________________________________
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetUserListView(request):
    user_details = UserAccount.objects.all()
    serializers = UserCreateSerializer(user_details, many=True)
    return Response(serializers.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteUserView(request, pk):
    user_details = UserAccount.objects.get(id=pk)
    user_details.delete()
    return Response('User has been deleted')


# teacher views________________________________________________________________________________
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetTeacherListView(request):
    teacher_details = Teacher.objects.all()
    serializers = TeacherSerializer(teacher_details, many=True)
    return Response(serializers.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetTeacherDetailsView(request, pk):
    teacher_details = Teacher.objects.get(id=pk)
    serializers = TeacherSerializer(teacher_details, many=False)
    return Response(serializers.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateTeacherView(request, user_id):
    data = request.data
    
    # Get the user account instance
    try:
        user = UserAccount.objects.get(id=user_id)
    except UserAccount.DoesNotExist:
        return Response({"error": "UserAccount not found."}, status=status.HTTP_404_NOT_FOUND)

    # Create the Teacher instance
    teacher_details = Teacher.objects.create(
        user=user,
        birthDate=data['birthDate'],
        phone_num=data['phone_num'],
    )
    
    # Serialize and return the teacher data
    serializer = TeacherSerializer(teacher_details, many=False)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateTeacherView(request, pk):

    teacher_details = Teacher.objects.get(id=pk)
    serializer = TeacherSerializer(teacher_details, data=request.data)

    if serializer.is_valid():
        serializer.save()
        # print(request.data)

    return Response(serializer.data)

# student views________________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateStudentView(request, pk):
    data = request.data
    
    # Get the user account instance
    try:
        user = UserAccount.objects.get(id=pk)
    except UserAccount.DoesNotExist:
        return Response({"error": "UserAccount not found."}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        course = Course.objects.get(id=data['course'])
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        section = Section.objects.get(id=data['section'])
    except Section.DoesNotExist:
        return Response({"error": "Section not found."}, status=status.HTTP_404_NOT_FOUND)



    # Create the Student instance
    student_details = Student.objects.create(
        user=user,
        course=course,
        year_level=data['yearLevel'],
        section=section,
    )
    
    # Serialize and return the student data
    serializer = StudentSerializer(student_details, many=False)
    send_student_update()
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateStudentView(request, pk):

    student_details = Student.objects.get(id=pk)
    serializer = StudentSerializer(student_details, data=request.data)

    if serializer.is_valid():
        serializer.save()
        # print(request.data)
    send_student_update()
    return Response(serializer.data)

# class views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateClassView(request):
    data = request.data

    # Get the user account instance
    try:
        user = UserAccount.objects.get(id=data['teacher'])
    except UserAccount.DoesNotExist:
        return Response({"error": "UserAccount not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        course = Course.objects.get(id=data['course'])
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        subject = Subject.objects.get(id=data['subject'])
    except Subject.DoesNotExist:
        return Response({"error": "Subject not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        section = Section.objects.get(id=data['section'])
    except Section.DoesNotExist:
        return Response({"error": "Section not found."}, status=status.HTTP_404_NOT_FOUND)
    
    class_details = Classes.objects.create(
        teacher=user,
        course=course,
        subject=subject,
        year_level=data['yearLevel'],
        section=section,
        start_time=data['startTime'],
        end_time=data['endTime'],
        is_monday=data['mon'],
		is_tuesday=data['tue'],
		is_wednesday=data['wed'],
		is_thursday=data['thu'],
		is_friday=data['fri'],
		is_saturday=data['sat'],
    )

    serializer = ClassesSerializer(class_details, many=False)
    send_class_update()
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateClassView(request, pk):

    class_details = Classes.objects.get(id=pk)
    serializer = ClassesSerializer(class_details, data=request.data)

    if serializer.is_valid():
        serializer.save()
        # print(request.data)
    send_class_update()
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteClassView(request, pk):
    class_details = Classes.objects.get(id=pk)
    class_details.delete()
    send_class_update()
    return Response('Que has been deleted')

# section views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateSectionView(request):
    data = request.data

    section_details = Section.objects.create(
        name=data['name'],
    )
    serializer = SectionSerializer(section_details, many=False)
    send_section_update()
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateSectionView(request, pk):

    section_details = Section.objects.get(id=pk)
    serializer = SectionSerializer(section_details, data=request.data)

    if serializer.is_valid():
        serializer.save()
        # print(request.data)
    send_section_update()
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteSectionView(request, pk):
    section_details = Section.objects.get(id=pk)
    section_details.delete()
    send_section_update()
    return Response('Que has been deleted')


# subject views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateSubjectView(request):
    data = request.data

    subject_details = Subject.objects.create(
        name=data['name'],
    )
    serializer = SubjectSerializer(subject_details, many=False)
    send_subject_update()
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateSubjectView(request, pk):

    subject_details = Subject.objects.get(id=pk)
    serializer = SubjectSerializer(subject_details, data=request.data)

    if serializer.is_valid():
        serializer.save()
        # print(request.data)
    send_subject_update()
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteSubjectView(request, pk):
    subject_details = Subject.objects.get(id=pk)
    subject_details.delete()
    send_subject_update()
    return Response('Que has been deleted')


# course views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateCourseView(request):
    data = request.data

    course_details = Course.objects.create(
        name=data['name'],
    )
    serializer = CourseSerializer(course_details, many=False)
    send_course_update()
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateCourseView(request, pk):

    course_details = Course.objects.get(id=pk)
    serializer = CourseSerializer(course_details, data=request.data)

    if serializer.is_valid():
        serializer.save()
        # print(request.data)
    send_course_update()
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteCourseView(request, pk):
    course_details = Course.objects.get(id=pk)
    course_details.delete()
    send_course_update()
    return Response('Que has been deleted')


# Attendance views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateAttendanceView(request, class_pk):
    data = request.data
    
    try:
        student = Student.objects.get(id=data['student'])
    except Student.DoesNotExist:
        return Response({"error": f"Student with id {data['student']} not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        classes = Classes.objects.get(id=data['classes'])
    except Classes.DoesNotExist:
        return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

    # Create the attendance record
    attendance_details = Attendance.objects.create(
        student=student,  # Use the student instance directly
        classes=classes,
        date=data['date'],
        present=data.get('present', False),  # Defaults to False if not provided
        absent=data.get('absent', False),
        late=data.get('late', False),
    )

    # Initialize the serializer with the attendance record
    serializer = AttendanceSerializer(attendance_details)

    # Send notifications before sending the email
    send_attendance_update(class_pk, data['student'])

    # Send email with attendance details
    send_attendance_email(
        class_pk,
        student_id=data['student'],
        present=attendance_details.present,
        absent=attendance_details.absent,
        late=attendance_details.late,
        date=attendance_details.date
    )
    
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateAttendanceView(request, pk, class_pk):
    try:
        attendance_details = Attendance.objects.get(id=pk)
    except Attendance.DoesNotExist:
        return Response({"error": "Attendance record not found"}, status=status.HTTP_404_NOT_FOUND)

    # Create a serializer with the existing instance and the new data
    serializer = AttendanceSerializer(attendance_details, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()  # Save the updated attendance record
        student_id = request.data.get('student', attendance_details.student.id)  # Default to existing student if not provided

        # Send attendance update notification
        send_attendance_update(class_pk, student_id)

        # Send email with updated attendance details
        send_attendance_email(
            class_pk,
            student_id=student_id,
            present=serializer.validated_data.get('present', attendance_details.present),
            absent=serializer.validated_data.get('absent', attendance_details.absent),
            late=serializer.validated_data.get('late', attendance_details.late),
            date=attendance_details.date
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Quiz views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateQuizView(request, class_pk):
    data = request.data
    try:
        classes = Classes.objects.get(id=data['classes'])
    except Classes.DoesNotExist:
        return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

    # Create a serializer instance
    serializer = QuizSerializer(data=request.data)

    # Validate the serializer
    if serializer.is_valid():
        # Once valid, create the Quiz instance
        quiz_details = Quiz.objects.create(
            classes=classes,
            date=serializer.validated_data['date'],  # Now valid, so we can access it
            about=serializer.validated_data['about'],
        )

        # Serialize the created quiz details
        response_serializer = QuizSerializer(quiz_details, many=False)

        # Send quiz notifications and emails
        send_quiz_update(class_pk)
        send_quiz_email(
            class_pk,
            date=serializer.validated_data['date'],  # Sending date and about data
            about=serializer.validated_data['about']
        )

        return Response(response_serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateQuizView(request, pk, class_pk):
    try:
        quiz_details = Quiz.objects.get(id=pk)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz record not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = QuizSerializer(quiz_details, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

        # Send quiz update notifications
        send_quiz_update(class_pk)
        send_quiz_update_email(
            class_pk,
            date=serializer.validated_data.get('date'),
            about=serializer.validated_data.get('about')
        )
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteQuizView(request, pk, class_pk):
    try:
        # Fetch the quiz details before deletion
        quiz_details = Quiz.objects.get(id=pk)
        quiz_date = quiz_details.date
        quiz_about = quiz_details.about
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)

    # Delete the quiz
    quiz_details.delete()

    # Send delete email notification
    send_quiz_delete_email(class_pk, quiz_date, quiz_about)
    send_quiz_update(class_pk)

    return Response('Quiz has been deleted')



# Recital views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateRecitalView(request, class_pk):
    # Get the class object and handle missing class
    try:
        classes = Classes.objects.get(id=class_pk)
    except Classes.DoesNotExist:
        return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

    # Use the RecitalSerializer for data validation
    serializer = RecitalSerializer(data=request.data)

    # Check if the data is valid
    if serializer.is_valid():
        # Create the recital object
        serializer.save(classes=classes)

        # Send recital creation notification
        send_recital_update(class_pk)
        send_recital_email(
            class_pk,
            date=serializer.validated_data['date'],  # Use validated data
            about=serializer.validated_data['about']
        )

        # Return the serialized recital data
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # If validation fails, return the errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateRecitalView(request, pk, class_pk):
    try:
        recital_details = Recital.objects.get(id=pk)
    except Recital.DoesNotExist:
        return Response({"error": "Recital record not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = RecitalSerializer(recital_details, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

        # Send recital update notification
        send_recital_update(class_pk)
        send_recital_update_email(
            class_pk,
            date=serializer.validated_data.get('date'),
            about=serializer.validated_data.get('about')
        )
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteRecitalView(request, pk, class_pk):
    try:
        recital_details = Recital.objects.get(id=pk)
        recital_date = recital_details.date
        recital_about = recital_details.about
    except Recital.DoesNotExist:
        return Response({"error": "Recital not found"}, status=404)

    recital_details.delete()
    send_recital_delete_email(class_pk, recital_date, recital_about)
    send_recital_update(class_pk)

    return Response('Recital has been deleted')
# report views_______________________________________________________________________________
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateReportView(request, class_pk):
    # Get the class object and handle missing class
    try:
        classes = Classes.objects.get(id=class_pk)  # Using class_pk directly
    except Classes.DoesNotExist:
        return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

    # Create a serializer instance for data validation
    serializer = ReportSerializer(data=request.data)

    # Validate the serializer
    if serializer.is_valid():
        # Create the report object using validated data
        report_details = Report.objects.create(
            classes=classes,
            date=serializer.validated_data['date'],  # Access validated data
            about=serializer.validated_data['about']
        )

        # Serialize the created report details
        response_serializer = ReportSerializer(report_details)

        # Send report creation notification first
        send_report_update(class_pk)

        # Then send the report creation email
        send_report_email(
            class_pk,
            date=serializer.validated_data['date'],  # Use validated data
            about=serializer.validated_data['about']
        )

        # Return the serialized report data
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    # If validation fails, return the errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateReportView(request, pk, class_pk):
    try:
        # Fetch the attendance record by ID
        report_details = Report.objects.get(id=pk)
    except Report.DoesNotExist:
        return Response({"error": "Recital record not found"}, status=404)

    # Create a serializer with the existing instance and the new data
    serializer = ReportSerializer(report_details, data=request.data)

    if serializer.is_valid():
        serializer.save()  # Save the updated attendance record

        # Send report update notification first
        send_report_update(class_pk)

        # Then send the report update email
        send_report_update_email(
            class_pk,
            date=serializer.validated_data['date'],
            about=serializer.validated_data['about']
        )
        
        return Response(serializer.data)  # Return the updated data
    else:
        return Response(serializer.errors, status=400)  # Return errors if validation fails


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteReportView(request, pk, class_pk):
    try:
        report_details = Report.objects.get(id=pk)
        report_date = report_details.date
        report_about = report_details.about
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)

    report_details.delete()

    # Then send the report update notification
    send_report_update(class_pk)
    # Send the report deletion email first
    send_report_delete_email(class_pk, report_date, report_about)
    
    return Response('Recital has been deleted')
