#!/bin/sh
# start-dev.sh

# Start the development environment
echo "Starting development environment..."
docker compose up -d

if [ $(docker ps -q -f name=gitgrub-dev) ]; then
  echo "Container is running! Connecting to shell..."
  docker exec -it gitgrub-dev sh
else
  echo "Error: Container 'gitgrub-dev' failed to start. Check logs with 'docker compose logs'"
  exit 1
fi
