#!/bin/bash
# start-dev.sh

# Make script executable
chmod +x "$0"

echo "Starting development environment..."
docker compose down
docker compose build --no-cache
docker compose up -d

# Wait a moment
sleep 2

# Check if container is running
if [ "$(docker ps -q -f name=gitgrub-dev)" ]; then
  echo "Container is running! Connecting to shell..."
  # Enter the container interactively
  docker exec -it gitgrub-dev sh
else
  echo "ERROR: Container failed to start properly"
  docker logs gitgrub-dev
  exit 1
fi