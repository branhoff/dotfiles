#!/bin/bash
# start-dev.sh

# Stop any existing containers
echo "Cleaning up any existing environment..."
docker compose down

# Build and start the development environment
echo "Building and starting development environment..."
docker compose build --no-cache
docker compose up -d

# Wait for container to fully initialize
echo "Waiting for container to initialize..."
sleep 3

# Check if container is running
if [ "$(docker ps -q -f name=gitgrub-dev)" ]; then
  # Enter the container
  echo "Container is running! Opening shell..."
  docker exec -it gitgrub-dev bash || docker exec -it gitgrub-dev sh
  
  # After exiting container, show helpful message
  echo ""
  echo "You've exited the container. The container is still running."
  echo "To reconnect: docker exec -it gitgrub-dev bash"
  echo "To stop: docker compose down"
else
  echo "ERROR: Container failed to start"
  docker logs gitgrub-dev
  exit 1
fi