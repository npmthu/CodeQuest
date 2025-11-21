# Dockerfile for code execution sandbox
FROM ubuntu:22.04

# Install common programming languages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nodejs \
    npm \
    openjdk-17-jdk \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /sandbox

# Security: Run as non-root user
RUN useradd -m -u 1000 sandbox
USER sandbox

# Command will be overridden at runtime
CMD ["bash"]
