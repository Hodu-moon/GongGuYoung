#=================================================================
# BUILD STAGE 1 - JRE 추출
#=================================================================
FROM amazoncorretto:17-alpine3.18 AS builder-jre

# Step 2: Install binutils
RUN apk add --no-cache binutils

# Step 3: Use jlink to create a minimized JRE
RUN $JAVA_HOME/bin/jlink \
         --module-path "$JAVA_HOME/jmods" \
         --verbose \
         --add-modules ALL-MODULE-PATH \
         --strip-debug \
         --no-man-pages \
         --no-header-files \
         --compress=2 \
         --output /jre

#=================================================================
# BUILD STAGE 2 - Build the application using Gradle
#=================================================================
FROM gradle:8.5-jdk17-alpine AS builder-app

# Copy application files and Gradle wrapper
WORKDIR /workspace
COPY . .

# Build the application
RUN gradle build -x test

#=================================================================
# BUILD STAGE 3 - APP 실행
#=================================================================
FROM alpine:3.18.4

# Environment settings
ENV JAVA_HOME=/jre
ENV PATH="$JAVA_HOME/bin:$PATH"

# Copy the minimal JRE from the previous build stage
COPY --from=builder-jre /jre $JAVA_HOME

# Set working directory
WORKDIR /app

# Copy the built JAR from the Gradle build stage
COPY --from=builder-app /workspace/build/libs/*.jar app.jar

RUN mkdir -p /app/resources && chmod -R 755 /app/resources

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]
