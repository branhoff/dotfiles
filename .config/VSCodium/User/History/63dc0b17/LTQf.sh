#!/bin/sh
# start-dev.sh

echo "Cleaning up any existing environment..."
docker compose down

echo "Building and starting development environment..."
docker compose -f local.docker-compose.yml build  --no-cache
docker compose -f local.docker-compose.yml up -d

echo "Waiting for container to initialize..."
sleep 3

if [ "$(docker ps -q -f name=gitgrub-dev)" ]; then
  echo "Container is running! Opening shell..."
  docker exec -it gitgrub-dev bash || docker exec -it gitgrub-dev sh
  
  echo ""
  echo "You've exited the container. The container is still running."
  echo "To reconnect: docker exec -it gitgrub-dev sh"
  echo "To stop: docker compose -f local.docker-compose.yml down"
else
  echo "ERROR: Container failed to start"
  docker logs gitgrub-dev
  exit 1
fi