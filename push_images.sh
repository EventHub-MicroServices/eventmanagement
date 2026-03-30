#!/bin/bash

# Configuration
REGISTRY="team3kubectl"
TAG="v1.1.1"
SERVICES=(
  "admin-service"
  "ai-service"
  "booking-service"
  "events-service"
  "frontend"
  "notification-service"
  "payment-service"
  "ticket-service"
  "users-service"
)

echo "Starting build and push for version $TAG..."

# Check if logged in to Docker Hub (optional but helpful)
# docker info > /dev/null 2>&1
# if [ $? -ne 0 ]; then
#   echo "Error: Not logged in to Docker Hub or Docker not running."
#   exit 1
# fi

for SERVICE in "${SERVICES[@]}"; do
  echo "--------------------------------------------------------"
  echo "Processing $SERVICE..."
  echo "--------------------------------------------------------"

  # Check if directory exists
  if [ ! -d "$SERVICE" ]; then
    echo "Warning: Directory $SERVICE not found, skipping."
    continue
  fi

  # Build the image
  echo "Building $REGISTRY/$SERVICE:$TAG..."
  docker build -t "$REGISTRY/$SERVICE:$TAG" "./$SERVICE"

  if [ $? -ne 0 ]; then
    echo "Error: Failed to build $SERVICE. Stopping."
    exit 1
  fi

  # Push the image
  echo "Pushing $REGISTRY/$SERVICE:$TAG..."
  docker push "$REGISTRY/$SERVICE:$TAG"

  if [ $? -ne 0 ]; then
    echo "Error: Failed to push $SERVICE. Stopping."
    exit 1
  fi

  echo "Successfully pushed $SERVICE:$TAG"
done

echo "--------------------------------------------------------"
echo "All images built and pushed successfully with tag $TAG!"
echo "--------------------------------------------------------"
