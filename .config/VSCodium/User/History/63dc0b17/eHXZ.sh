#!/bin/sh
# start-dev.sh

# Export current user ID and group ID for Docker
export UID=$(id -u)
export GID=$(id -g)

# Stop any existing containers
echo "Cleaning up any existing environment..."
docker compose down

# Build and start the development environment
echo "Building and starting development environment..."
docker compose up -d --build

# Wait for container to fully initialize
echo "Waiting for container to initialize..."
sleep 3

# Check if package.json exists, if not create it
if [ ! -f "./package.json" ]; then
  echo "No package.json found. Creating basic npm project..."
  # Create a basic package.json without interactive prompts
  cat > ./package.json <<EOL
{
  "name": "gitgrub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOL
  echo "Created basic package.json"
fi

# Check if container is running
if [ "$(docker ps -q -f name=gitgrub-dev)" ]; then
  # Enter the container with a more useful shell
  echo "Container is running! Opening shell..."
  docker exec -it gitgrub-dev bash || docker exec -it gitgrub-dev sh
else
  echo "ERROR: Container failed to start"
  docker logs gitgrub-dev
  exit 1
fi