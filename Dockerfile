
# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy dependency files first
COPY requirements.txt /app/requirements.txt
COPY requirements_trello.txt /app/requirements_trello.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements_trello.txt

# Copy the rest of the application code
COPY . /app

# Expose the application port
EXPOSE 5000

# Add a health check
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:5000/health || exit 1

# Command to run the application
CMD ["python", "src/main.py"]
