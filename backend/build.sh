#!/usr/bin/env bash
# Standalone Maven runner for Cloud Deployment (Render Node container compatibility)
set -e

MAVEN_VERSION=3.9.6
if [ ! -d "apache-maven-${MAVEN_VERSION}" ]; then
  echo "==> Downloading Apache Maven ${MAVEN_VERSION}..."
  curl -sL https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz | tar -xz
fi

export PATH="$(pwd)/apache-maven-${MAVEN_VERSION}/bin:$PATH"

echo "==> Running Maven build with Java..."
mvn clean package -DskipTests
