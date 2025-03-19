from django.urls import path, include
from django.views.generic import View 
from .views import *

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    # path('', include(router.urls)),
    # teacher urls_____________________________________________
    path('usersList', GetUserListView),
    path('<int:pk>/usersDelete', DeleteUserView),
    # teacher urls_____________________________________________
    path('<int:pk>/teacherCreate', CreateTeacherView),
    path('<int:pk>/teacherUpdate', UpdateTeacherView),

    # Student urls_____________________________________________
    path('<int:pk>/studentCreate', CreateStudentView),
    path('<int:pk>/studentUpdate', UpdateStudentView),

    # class urls_____________________________________________
    path('classCreate', CreateClassView),
    path('<int:pk>/classUpdate', UpdateClassView),
    path('<int:pk>/classDelete', DeleteClassView),

    # section urls_____________________________________________
    path('sectionCreate', CreateSectionView),
    path('<int:pk>/sectionUpdate', UpdateSectionView),
    path('<int:pk>/sectionDelete', DeleteSectionView),

    # Subject urls_____________________________________________
    path('subjectCreate', CreateSubjectView),
    path('<int:pk>/subjectUpdate', UpdateSubjectView),
    path('<int:pk>/subjectDelete', DeleteSubjectView),

    # course urls_____________________________________________
    path('courseCreate', CreateCourseView),
    path('<int:pk>/courseUpdate', UpdateCourseView),
    path('<int:pk>/courseDelete', DeleteCourseView),
    
    # attendance urls_____________________________________________
    path('<int:class_pk>/attendanceCreate', CreateAttendanceView),
    path('<int:pk>/<int:class_pk>/attendanceUpdate', UpdateAttendanceView),

    # quiz urls_____________________________________________
    path('<int:class_pk>/quiz', CreateQuizView),
    path('<int:pk>/<int:class_pk>/quizUpdate', updateQuizView),
    path('<int:pk>/<int:class_pk>/quizDelete', DeleteQuizView),

    # recital urls_____________________________________________
    path('<int:class_pk>/recital', CreateRecitalView),
    path('<int:pk>/<int:class_pk>/recitalUpdate', updateRecitalView),
    path('<int:pk>/<int:class_pk>/recitalDelete', DeleteRecitalView),

    # report urls_____________________________________________
    path('<int:class_pk>/report', CreateReportView),
    path('<int:pk>/<int:class_pk>/reportUpdate', updateReportView),
    path('<int:pk>/<int:class_pk>/reportDelete', DeleteReportView),

]