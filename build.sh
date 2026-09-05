#!/usr/bin/env bash
# Standalone Java 17 & Maven runner for Cloud Deployment (Render Node container compatibility)
set -e

if [ -d "backend" ]; then
  cd backend
fi

# Auto-download OpenJDK 17 if not already downloaded locally
if [ ! -d "jdk-17" ]; then
  echo "==> Downloading OpenJDK 17..."
  curl -sL https://download.java.net/java/GA/jdk17.0.2/df89a773199b40c59c0e0717b0863215/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz | tar -xz
  mv jdk-17* jdk-17
fi

export JAVA_HOME="$(pwd)/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

echo "==> Using Java: $(java -version 2>&1 | head -n 1)"
echo "==> JAVA_HOME set to: $JAVA_HOME"

MAVEN_VERSION=3.9.6
if [ ! -d "apache-maven-${MAVEN_VERSION}" ]; then
  echo "==> Downloading Apache Maven ${MAVEN_VERSION}..."
  curl -sL https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz | tar -xz
fi

export PATH="$(pwd)/apache-maven-${MAVEN_VERSION}/bin:$PATH"

echo "==> Running Maven build with OpenJDK 17..."
mvn clean package -DskipTests

