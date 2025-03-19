from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# Utility to send updates to WebSocket group
def send_group_update(group_name, message_type):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,  # WebSocket group name
        {"type": message_type, "data": True}  # Message payload
    )

# Specific functions for each consumer group
def send_class_update():
    send_group_update("class_group", "update")

def send_report_update():
    send_group_update("report_group", "update")

def send_quiz_update():
    send_group_update("quiz_group", "update")

def send_attendance_update():
    send_group_update("attendance_group", "update")

def send_recital_update():
    send_group_update("recital_group", "update")

def send_section_update():
    send_group_update("section_group", "update")

def send_subject_update():
    send_group_update("subject_group", "update")

def send_course_update():
    send_group_update("course_group", "update")

def send_attendance_update(class_id, student_id):
    send_group_update(f"attendance_class_{class_id}_student_{student_id}", "update")
    send_group_update(f"attendance_class_{class_id}", "update")

def send_quiz_update(id):
    send_group_update(f"quiz_class_{id}", "update")

def send_recital_update(id):
    send_group_update(f"recital_class_{id}", "update")

def send_report_update(id):
    send_group_update(f"report_class_{id}", "update")

