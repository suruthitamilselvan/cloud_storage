#!/usr/bin/env bash
# Standalone Java 17 & Maven runner for Cloud Deployment (Render Node container compatibility)
set -e

# Download OpenJDK 17 (Adoptium Temurin)
if [ ! -d "jdk-17" ]; then
  echo "==> Downloading OpenJDK 17 (Adoptium Temurin)..."
  curl -fsSL "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_x64_linux_hotspot_17.0.10_7.tar.gz" -o jdk17.tar.gz
  tar -xzf jdk17.tar.gz
  mv jdk-17* jdk-17 || true
  rm -f jdk17.tar.gz
fi

export JAVA_HOME="$(pwd)/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

echo "==> Using Java: $($JAVA_HOME/bin/java -version 2>&1 | head -n 1)"
echo "==> JAVA_HOME set to: $JAVA_HOME"

MAVEN_VERSION=3.9.6
if [ ! -d "apache-maven-${MAVEN_VERSION}" ]; then
  echo "==> Downloading Apache Maven ${MAVEN_VERSION}..."
  curl -fsSL "https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" -o maven.tar.gz
  tar -xzf maven.tar.gz
  rm -f maven.tar.gz
fi

export PATH="$(pwd)/apache-maven-${MAVEN_VERSION}/bin:$PATH"

echo "==> Running Maven build with OpenJDK 17..."
mvn clean package -DskipTests


