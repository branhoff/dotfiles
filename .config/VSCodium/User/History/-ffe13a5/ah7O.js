// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const crypto = require('crypto');

/**
 * Setup Express app with configuration
 * @param {Object} config - Configuration options
 * @param {string} config.reposDir - Directory for git repositories
 * @param {boolean} config.inMemoryOnly - Whether to use only in-memory storage
 * @returns {Express.Application} Configured Express app
 */
const setupApp = (config = {}) => {
  const app = express();
  const recipeFileName = 'recipe.md';
  
  // Apply configuration or defaults
  const REPOS_DIR = config.reposDir || path.join(__dirname, 'git-repos');
  
  app.use(cors());
  app.use(express.json());
  
  // Add logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
  
  // Create git-repos directory if it doesn't exist
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
  app.locals.users = config.inMemoryOnly ? [] : [{
    username: 'demo',
    email: 'demo@example.com'
  }];
  
  app.locals.recipes = {};
  
  // For POC: Ensure the default user directory exists
  if (!config.inMemoryOnly) {
    fs.ensureDirSync(getUserReposPath('demo'));
  }
  
  // Routes
  // Get all recipes for a user
  app.get('/api/users/:username/recipes', (req, res) => {
    const { username } = req.params;
    
    // Validate user exists
    if (!app.locals.users.find(u => u.username === username)) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRecipes = app.locals.recipes[username] || [];
    res.json(userRecipes);
  });
  
  // Create a new recipe
  app.post('/api/users/:username/recipes', async (req, res) => {
    try {
      const { username } = req.params;
      const { title, content, commitMessage } = req.body;
      
      // Validate user exists
      if (!app.locals.users.find(u => u.username === username)) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const id = crypto.randomUUID();
      
      const userReposPath = getUserReposPath(username);
      await fs.ensureDir(userReposPath);
      
      const repoPath = getRepoPath(username, id);
      await fs.ensureDir(repoPath);
      
      const git = simpleGit(repoPath);
      await git.init();
      
      await git.addConfig('user.name', username);
      await git.addConfig('user.email', 'poc@example.com');
      
      const filePath = getRecipeFilePath(username, id);
      await fs.writeFile(filePath, content);
      
      await git.add('./*');
      await git.commit(commitMessage || 'Initial recipe');
      
      const newRecipe = {
        id,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (!app.locals.recipes[username]) {
        app.locals.recipes[username] = [];
      }
      
      app.locals.recipes[username].push(newRecipe);
      
      res.status(201).json(newRecipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ message: 'Failed to create recipe', error: error.message });
    }
  });
  
  // Get a specific recipe
  app.get('/api/users/:username/recipes/:id', async (req, res) => {
    try {
      const { username, id } = req.params;
      
      if (!app.locals.users.find(u => u.username === username)) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userRecipes = app.locals.recipes[username] || [];
      const recipe = userRecipes.find(r => r.id === id);
      
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      
      const content = await fs.readFile(getRecipeFilePath(username, id), 'utf8');
      
      res.json({
        ...recipe,
        content
      });
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ message: 'Failed to fetch recipe', error: error.message });
    }
  });
  
  // Update a specific recipe
  app.put('/api/users/:username/recipes/:id', async (req, res) => {
    try {
      const { username, id } = req.params;
      const { title, content, commitMessage } = req.body;
      
      // Validate user exists
      if (!app.locals.users.find(u => u.username === username)) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Find recipe
      const userRecipes = app.locals.recipes[username] || [];
      const recipeIndex = userRecipes.findIndex(r => r.id === id);
      
      if (recipeIndex === -1) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      
      const recipe = userRecipes[recipeIndex];
      const repoPath = getRepoPath(username, id);
      const filePath = getRecipeFilePath(username, id);
      
      // Update file
      await fs.writeFile(filePath, content);
      
      // Commit changes
      const git = simpleGit(repoPath);
      await git.add('./*');
      await git.commit(commitMessage || 'Update recipe');
      
      // Update recipe metadata
      const updatedRecipe = {
        ...recipe,
        title,
        updatedAt: new Date().toISOString()
      };
      
      app.locals.recipes[username][recipeIndex] = updatedRecipe;
      
      res.json({
        ...updatedRecipe,
        content
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ message: 'Failed to update recipe', error: error.message });
    }
  });
  
  // Get recipe version history
  app.get('/api/users/:username/recipes/:id/history', async (req, res) => {
    try {
      const { username, id } = req.params;
      
      // Validate user exists
      if (!app.locals.users.find(u => u.username === username)) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Find recipe
      const userRecipes = app.locals.recipes[username] || [];
      const recipe = userRecipes.find(r => r.id === id);
      
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      
      const repoPath = getRepoPath(username, id);
      const git = simpleGit(repoPath);
      
      // Get commit history
      const logResult = await git.log();
      
      // Transform log to desired format
      const history = logResult.all.map(commit => ({
        hash: commit.hash,
        author: commit.author_name,
        date: commit.date,
        message: commit.message
      }));
      
      res.json(history);
    } catch (error) {
      console.error('Error fetching recipe history:', error);
      res.status(500).json({ message: 'Failed to fetch recipe history', error: error.message });
    }
  });
  
  // Get a specific version of a recipe
  app.get('/api/users/:username/recipes/:id/versions/:commitHash', async (req, res) => {
    try {
      const { username, id, commitHash } = req.params;
      
      // Validate user exists
      if (!app.locals.users.find(u => u.username === username)) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Find recipe
      const userRecipes = app.locals.recipes[username] || [];
      const recipe = userRecipes.find(r => r.id === id);
      
      if (!recipe) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      
      const repoPath = getRepoPath(username, id);
      const git = simpleGit(repoPath);
      
      // Check if commit exists
      try {
        await git.show([commitHash]);
      } catch (error) {
        return res.status(404).json({ message: 'Version not found' });
      }
      
      // Get content at that commit
      const showResult = await git.show([`${commitHash}:${recipeFileName}`]);
      
      res.json({
        id: recipe.id,
        title: recipe.title,
        commitHash,
        content: showResult
      });
    } catch (error) {
      console.error('Error fetching recipe version:', error);
      res.status(500).json({ message: 'Failed to fetch recipe version', error: error.message });
    }
  });
  
  return app;
};

// Create the app with default configuration
const app = setupApp();

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = setupApp;