# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libffi-dev \
    libssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install the Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files into the container
COPY . /app/

# Expose the port the app runs on
EXPOSE 8000

# Start the Daphne server
#CMD ["daphne", "-p", "8000", "--bind", "0.0.0.0", "chatapp.asgi:application"]

CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && daphne -p 8000 --bind 0.0.0.0 chatapp.asgi:application"]
