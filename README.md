# VelascoSched - Scheduling System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.9+](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/release/python-390/)
[![Django: 5.1+](https://img.shields.io/badge/Django-5.1+-green.svg)](https://www.djangoproject.com/download/)

Welcome to **VelascoSched**, a powerful scheduling system designed to streamline the process of organizing and managing schedules for clients, teachers, and students.

## Table of Contents

1. [About](#about)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Environment Setup](#environment-setup)
6. [Running the Project](#running-the-project)
7. [Technologies Used](#technologies-used)
8. [License](#license)
9. [Contributing](#contributing)
10. [Getting Help](#getting-help)
11. [Development Guidelines](#development-guidelines)

## About

**VelascoSched** is a scheduling system developed to meet the needs of modern educational or organizational scheduling. This project was built with a focus on usability, efficiency, and scalability.

The system provides the ability to:

- Create and manage schedules
- Assign and track events, courses, or meetings
- Handle recurring schedules
- Track user participation and attendance (if needed)

## Features

- User-friendly interface for creating, managing, and viewing schedules
- Authentication and user role management (Admin, Teacher, Student)
- Real-time updates using WebSockets
- Mobile-friendly and responsive design
- Customizable for various use cases

## Installation

To get started with the project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/velascosched.git
   cd velascosched
   ```

2. Set up the virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # For Windows: venv\Scripts\activate
   ```

3. Install required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up your database and apply migrations:

   ```bash
   python manage.py migrate
   ```

5. Create the admin superuser:
   ```bash
   python manage.py createsuperuser
   ```
   When the prompt asks you for "teacher:", simply type 0 and press enter. This sets up the superuser as an admin.

## Environment Setup

### Backend Configuration

In your backend/scheduling_system/scheduling_system/settings.py:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'schedDB',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'your_email@gmail.com'
EMAIL_HOST_PASSWORD = 'your_app_password'
EMAIL_USE_TLS = True

DOMAIN = 'your_ip_address:8000'
SITE_NAME = 'http://your_ip_address:5173/'
```

### Frontend Configuration

Create a .env file in the frontend directory:

```bash
VITE_apiUrl="http://your_ip_address:8000"
VITE_wsUrl="ws://your_ip_address:8000"
```

### React Native Configuration

In app.json:

```json
"extra": {
    "VITE_apiUrl": "http://your_ip_address:8000",
    "VITE_wsUrl": "ws://your_ip_address:8000",
    "eas": {
        "projectId": "your_project_id"
    }
}
```

## Running the Project

1. Start the Django backend:

   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

2. Start the React frontend:

   ```bash
   npm run dev -- --host
   ```

3. Start the React Native app:
   ```bash
   npm start
   ```

## User Activation

Teachers and students will receive an activation email after signing up. They must:

1. Click the activation link in the email
2. Reset their password
3. Log in to the mobile app

Note: Admins manage the system through the web interface.

## Technologies Used

Backend: Django, Python
Frontend: React, HTML, CSS, JavaScript
Database: PostgreSQL
Real-time updates: WebSockets, Django Channels

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Include tests for new functionality

## Getting Help

For questions or issues, please:

1. Check the [issue tracker](https://github.com/your-username/velascosched/issues)
2. Email (jophadalecarlvelasco94@gmail.com)

## Development Guidelines

1. Follow PEP 8 for Python code
2. Use ESLint for JavaScript/React code
3. Write tests for new functionality
4. Document significant changes
5. Keep dependencies up to date

## Redis Setup for Windows

1. Download the redis.zip file from the provided link or your internal server.

2. Extract the contents of the redis.zip file into an empty folder. For example, create a folder named redis_files in your project directory or elsewhere on your system.

3. Set up the environment variable:

   - Right-click on the Start button and select System
   - Click on Advanced system settings
   - Click the Environment Variables button
   - Add a new variable named REDIS_PATH with the path to your Redis folder

4. Run Redis server:

   ```bash
   redis-server
   ```

5. Verify Redis is working:
   ```bash
   redis-cli
   PING
   ```
   Should return: PONG
