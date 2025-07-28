FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for MuPDF
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libmupdf-dev \
    libfreetype6-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    libtiff5-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories for uploads and processed files
RUN mkdir -p uploads processed

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]