# Dockerfile for code execution sandbox with Python, C++, and JavaScript support
FROM ubuntu:22.04

LABEL maintainer="CodeQuest Team"
LABEL description="CodeQuest Code Execution Sandbox"

# Set non-interactive mode
ENV DEBIAN_FRONTEND=noninteractive

# Install build tools and programming languages
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build tools
    build-essential \
    cmake \
    git \
    wget \
    curl \
    ca-certificates \
    # Python
    python3.10 \
    python3-pip \
    python3-venv \
    # Node.js / JavaScript
    nodejs \
    npm \
    # Java
    openjdk-17-jdk-headless \
    # C/C++
    gcc \
    g++ \
    gdb \
    # Utilities
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Set Python3.10 as default python
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

# Install useful Python packages
RUN pip install --no-cache-dir \
    numpy \
    pandas \
    requests \
    flask \
    django

# Install useful npm packages globally
RUN npm install -g \
    express \
    lodash \
    axios \
    --no-save

# Set working directory
WORKDIR /sandbox

# Create non-root user with proper permissions
RUN groupadd -g 1000 sandbox && \
    useradd -m -u 1000 -g sandbox sandbox && \
    mkdir -p /sandbox && \
    chown -R sandbox:sandbox /sandbox && \
    chmod 755 /sandbox

# Switch to non-root user
USER sandbox

# Add timeout mechanism
RUN echo '#!/bin/bash\ntimeout ${SANDBOX_TIMEOUT:-5000}ms "$@"' > /tmp/timeout.sh && \
    chmod +x /tmp/timeout.sh

# Default command
CMD ["bash"]
