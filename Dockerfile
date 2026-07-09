# -----------------------------------------------------------------
# CAM-YOLO11 - Production Dockerfile
# Provides: Ubuntu 22.04 + Node.js 20 LTS + Python 3.11
# Deployed as a single service on Railway.
# -----------------------------------------------------------------

FROM ubuntu:22.04

# Prevent interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    python3.11 \
    python3.11-dev \
    python3-pip \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Make python3.11 the default python / python3
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 \
    && update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

# Node.js 20 LTS via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /app

# Python dependencies (layer cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Node dependencies (full install including devDeps for Vite build)
COPY package*.json ./
RUN npm install

# Copy source and build the frontend
COPY . .
RUN npm run build


# Expose port (Railway injects PORT at runtime)
EXPOSE 5000

# Environment defaults
ENV NODE_ENV=production
ENV PYTHON_PATH=python3

# Start the unified Node + Python server
CMD ["npm", "start"]