// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const crypto = require('crypto');

// Setup Express app
const setupApp = () => {
  const app = express();
  const recipeFileName = 'recipe.md';
  
  app.use(cors());
  app.use(express.json());
  
  // Add logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
  
  // Create git-repos directory if it doesn't exist
  const REPOS_DIR = path.join(__dirname, 'git-repos');
  fs.ensureDirSync(REPOS_DIR);
  
  // Helper functions
  const getUserReposPath = (username) => path.join(REPOS_DIR, username);
  const getRepoPath = (username, recipeId) => path.join(getUserReposPath(username), recipeId);
  const getRecipeFilePath = (username, recipeId) => path.join(getRepoPath(username, recipeId), recipeFileName);
  
  // Make these accessible to routes
  app.locals.REPOS_DIR = REPOS_DIR;
  app.locals.getUserReposPath = getUserReposPath;
  app.locals.getRepoPath = getRepoPath;
  app.locals.getRecipeFilePath = getRecipeFilePath;
  
  // In-memory storage for user and recipe metadata (for POC only)
  app.locals.users = [{
    username: 'demo',
    email: 'demo@example.com'
  }];
  
  app.locals.recipes = {};
  
  // For POC: Ensure the default user directory exists
  fs.ensureDirSync(getUserReposPath('demo'));
  
  // Define routes here...
  // ...

  // Return the configured app
  return app;
};

// Create the app
const app = setupApp();

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = app;