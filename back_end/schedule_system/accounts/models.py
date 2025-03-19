from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.exceptions import ValidationError

YEAR_LEVELS = [
    ('1', 'First Year'),
    ('2', 'Second Year'),
    ('3', 'Third Year'),
    ('4', 'Fourth Year'),
]

class Course(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class UserAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

class UserAccount(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_teacher = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'is_teacher']

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

    def get_short_name(self):
        return self.first_name

    def __str__(self):
        return self.email

class Subject(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Section(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
    
class Teacher(models.Model):  # Inherits from UserAccount for common fields
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE)  # Use Teacher instead of UserAccount
    birth_date = models.DateField(null=True, blank=True)

class Student(models.Model):
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    year_level = models.CharField(max_length=1, choices=YEAR_LEVELS, default='1')
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    # Temporarily allow null for the new id field
    # id = models.AutoField(default=1)  # This will let migrations pass

class Classes(models.Model):
    teacher = models.ForeignKey(UserAccount, on_delete=models.CASCADE)  # Use Teacher instead of UserAccount
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    year_level = models.CharField(max_length=1, choices=YEAR_LEVELS, default='1')
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_monday = models.BooleanField(default=False)
    is_tuesday = models.BooleanField(default=False)
    is_wednesday = models.BooleanField(default=False)
    is_thursday = models.BooleanField(default=False)
    is_friday = models.BooleanField(default=False)
    is_saturday = models.BooleanField(default=False)
