# gitgrub

## Vision Statement

GitGrub is a social recipe management platform that brings the power of
version control to cooking. By applying software development principles
to recipe creation and sharing, GitGrub enables cooks and enthusiasts to track recipe evolution, collaborate on
improvements, and build upon each other's recipes. GitGrub makes recipe iteration visible, traceable, and social.

## Problem Statement

Current recipe management solutions face several limitations:
- No structured way to track recipe changes over time
- Difficulty collaborating on recipe improvements
- No clear lineage of how recipes evolve and branch into variants
- Limited ability to merge improvements back into original recipes
- Social sharing focuses on final products rather than the creative
  process

## Setup

### Prerequisites

- Docker
- Docker Compose

### Development Environment

GitGrub uses Docker for local development to ensure a consistent environment across all developer machines.

#### Initial Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:GitGrubOfficial/gitgrub.git
   cd gitgrub
   ```

2. Make the startup script executable:
   ```bash
   chmod +x start-dev.sh
   ```

3. Start the development environment:
   ```bash
   ./start-dev.sh
   ```

This will:
- Build the Docker container
- Start the development environment
- Connect you to an interactive shell inside the container

#### Development Workflow

Once inside the container:

1. Install dependencies (first time only):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application:
   - Frontend (Vite): http://localhost:5173
   - Backend API: http://localhost:3001

#### Useful Commands

- Reconnect to a running container:
  ```bash
  docker exec -it gitgrub-dev bash
  ```

- Stop the development environment:
  ```bash
  docker compose -f local.docker-compose.yml down
  ```

- View container logs:
  ```bash
  docker logs gitgrub-dev
  ```

### File Structure

All files in the project root are mounted bidirectionally into the container, allowing you to:
- Edit files using your preferred IDE on your local machine
- Run build commands inside the container
- See changes reflected in both environments in real time

The `node_modules` directory uses a Docker volume to avoid performance issues and system-specific dependencies.

## Running in Production

For production deployment, use the production Docker Compose file:

```bash
docker compose -f docker-compose.yml up -d
```

This will build and start the application in production mode. Access the application at:
- Frontend: http://localhost (or your configured domain)
- API: http://localhost/api (or your configured endpoint)

## Troubleshooting

### Permission Issues

If you encounter permission problems:

```bash
# Inside the container
mkdir -p node_modules

# On your host machine
sudo chown -R $USER:$USER .
```

### Container Restart Loops

If the container constantly restarts:

1. Check the logs:
   ```bash
   docker logs gitgrub-dev
   ```

2. Ensure your package.json exists and is valid
3. Verify that the node_modules volume is properly mounted

For more troubleshooting information, please check the [Wiki](https://github.com/your-username/gitgrub/wiki/Troubleshooting) or open an issue.

## Viewing Mermaid UML Diagrams
We use Mermaid UML for diagramming. It should be visible in GitHub by default. There are a number of add-ons in JetBrains and VS Code that will let you visualize the charts in preview mode.

You can also make use of Mermaid's diagram editing tool: https://mermaid.live/