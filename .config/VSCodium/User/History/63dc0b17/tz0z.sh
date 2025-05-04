#!/bin/sh
# start-dev.sh

# Start the development environment
docker-compose up -d

# Enter the container
docker exec -it gitgrub-dev sh

# When you're done, you can stop the container with:
# docker-compose down