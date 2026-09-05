#!/usr/bin/env bash
# CloudVault Backend Runner Script
set -e

if [ -f "backend/jdk-17/bin/java" ]; then
  echo "==> Launching Spring Boot with downloaded JDK 17..."
  exec ./backend/jdk-17/bin/java -jar backend/target/cloud-storage-backend-1.0.0-SNAPSHOT.jar --server.port=${PORT:-8080}
elif [ -f "jdk-17/bin/java" ]; then
  echo "==> Launching Spring Boot with downloaded JDK 17..."
  exec ./jdk-17/bin/java -jar target/cloud-storage-backend-1.0.0-SNAPSHOT.jar --server.port=${PORT:-8080}
else
  echo "==> Launching Spring Boot with system java..."
  exec java -jar backend/target/cloud-storage-backend-1.0.0-SNAPSHOT.jar --server.port=${PORT:-8080}
fi
