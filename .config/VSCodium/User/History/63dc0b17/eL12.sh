#!/bin/sh
# start-dev.sh

# Start the development environment
echo "Starting development environment..."
docker compose up -d

# Wait a moment for container to stabilize
sleep 2

# Check container status
CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' gitgrub-dev 2>/dev/null)

if [ "$CONTAINER_STATUS" = "running" ]; then
  echo "Container is running! Connecting to shell..."
  # Enter the container interactively
  docker exec -it gitgrub-dev sh
elif [ "$CONTAINER_STATUS" = "restarting" ]; then
  echo "ERROR: Container is in a restart loop. Showing logs:"
  docker logs gitgrub-dev
  echo ""
  echo "Fix the issues and then try again."
  echo "You may need to run 'docker compose down' before restarting."
else
  echo "ERROR: Container is not running properly (status: $CONTAINER_STATUS)"
  docker logs gitgrub-dev
  exit 1
fi
