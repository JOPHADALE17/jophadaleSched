from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(UserAccount)
admin.site.register(Teacher)
admin.site.register(Student)
admin.site.register(Classes)
admin.site.register(Subject)
admin.site.register(Course)
admin.site.register(Section)