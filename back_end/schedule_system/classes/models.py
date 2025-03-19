from django.db import models
from accounts.models import *

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    classes = models.ForeignKey(Classes, on_delete=models.CASCADE)
    date = models.DateField()
    present = models.BooleanField(default=False)
    absent = models.BooleanField(default=False)
    late = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.student} - {self.classes.subject.name} on {self.date}: Attendance'

    class Meta:
        unique_together = ('student', 'classes', 'date')

class Report(models.Model):
    classes = models.ForeignKey(Classes, on_delete=models.CASCADE)
    date = models.DateField()
    about = models.CharField(max_length=100, default="name")

    def __str__(self):
        return f'{self.about} on {self.date}: Report'


class Quiz(models.Model):
    classes = models.ForeignKey(Classes, on_delete=models.CASCADE)
    date = models.DateField()
    about = models.CharField(max_length=100, default="name")

    def __str__(self):
        return f'{self.about} on {self.date}: quiz'

class Recital(models.Model):
    classes = models.ForeignKey(Classes, on_delete=models.CASCADE)
    date = models.DateField()
    about = models.CharField(max_length=100, default="name")


    def __str__(self):
        return f'{self.about} on {self.date}: Recital'
