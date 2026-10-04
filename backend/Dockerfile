# Multi-stage Dockerfile for CODE3D AI Spring Boot Backend
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and pre-fetch dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src/ src/
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/code3d-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080 10000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
