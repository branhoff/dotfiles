# gitgrub

## Vision Statement

GitGrub is a social recipe management platform that brings the power of version control to cooking. By applying software development principles to recipe creation and sharing, GitGrub enables cooks and enthusiasts to track recipe evolution, collaborate on improvements, and build upon each other's recipes. GitGrub makes recipe iteration visible, traceable, and social.

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

## Development Workflow

Once inside the container:

1. Install dependencies (first time only):
   ```bash
   npm install
   ```

2. Start the development servers:
   
   **Option 1: Run in separate terminals**
   
   In the first terminal (already connected via start-dev.sh):
   ```bash
   # Start the frontend
   npm run dev
   ```
   
   In a second terminal:
   ```bash
   # Connect to the running container
   docker exec -it gitgrub-dev bash
   
   # Start the backend
   npm run server
   ```
   
   **Option 2: Run in a single terminal with background processes**
   ```bash
   # Start backend in background
   npm run server &
   
   # Start frontend
   npm run dev
   
   # To stop background processes when done
   # List processes and kill by PID
   ps aux
   kill [PID]
   ```
   
   **Option 3 (untested): Use a process manager**
   ```bash
   # If not already installed
   npm install -g concurrently
   
   # Run both services
   concurrently "npm run server" "npm run dev"
   ```

3. Access the application:
   - Frontend (Vite): http://localhost:5173
   - Backend API: http://localhost:3001

### File Structure

All files in the project root are mounted bidirectionally into the container, allowing you to:
- Edit files using your preferred IDE on your local machine
- Run build commands inside the container
- See changes reflected in both environments in real time

## Viewing Mermaid UML Diagrams
We use Mermaid UML for diagramming. It should be visible in GitHub by default. There are a number of add-ons in JetBrains and VS Code that will let you visualize the charts in preview mode.

You can also make use of Mermaid's diagram editing tool: https://mermaid.live/