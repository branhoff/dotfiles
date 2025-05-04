// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const crypto = require('crypto');

const fileName = 'recipe.md';

const getUserReposPath = (baseDir, username) => path.join(baseDir, username);
const getRepoPath = (baseDir, username, recipeId) => path.join(baseDir, username, recipeId);
const getRecipeFilePath = (baseDir, username, recipeId) => path.join(baseDir, username, recipeId, fileName);

const getAllRecipes = (req, res, { baseDir, dataStore }) => {
  const { username } = req.params;
  
  if (!dataStore.users.find(u => u.username === username)) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const userRecipes = dataStore.recipes[username] || [];
  res.json(userRecipes);
};

const createRecipe = async (req, res, { baseDir, dataStore }) => {
  try {
    const { username } = req.params;
    const { title, content, commitMessage } = req.body;
    
    if (!dataStore.users.find(u => u.username === username)) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const id = crypto.randomUUID();
    
    const userReposPath = getUserReposPath(baseDir, username);
    await fs.ensureDir(userReposPath);
    
    const repoPath = getRepoPath(baseDir, username, id);
    await fs.ensureDir(repoPath);
    
    const git = simpleGit(repoPath);
    await git.init();
    
    await git.addConfig('user.name', username);
    await git.addConfig('user.email', 'poc@example.com');
    
    const filePath = getRecipeFilePath(baseDir, username, id);
    await fs.writeFile(filePath, content);
    
    await git.add('./*');
    await git.commit(commitMessage || 'Initial recipe');
    
    const newRecipe = {
      id,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!dataStore.recipes[username]) {
      dataStore.recipes[username] = [];
    }
    
    dataStore.recipes[username].push(newRecipe);
    
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Failed to create recipe', error: error.message });
  }
};

const getRecipe = async (req, res, { baseDir, dataStore }) => {
  try {
    const { username, id } = req.params;
    
    if (!dataStore.users.find(u => u.username === username)) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRecipes = dataStore.recipes[username] || [];
    const recipe = userRecipes.find(r => r.id === id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const content = await fs.readFile(getRecipeFilePath(baseDir, username, id), 'utf8');
    
    res.json({
      ...recipe,
      content
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Failed to fetch recipe', error: error.message });
  }
};

const updateRecipe = async (req, res, { baseDir, dataStore }) => {
  try {
    const { username, id } = req.params;
    const { title, content, commitMessage } = req.body;
    
    if (!dataStore.users.find(u => u.username === username)) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRecipes = dataStore.recipes[username] || [];
    const recipeIndex = userRecipes.findIndex(r => r.id === id);
    
    if (recipeIndex === -1) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const recipe = userRecipes[recipeIndex];
    const filePath = getRecipeFilePath(baseDir, username, id);
    
    await fs.writeFile(filePath, content);
    
    const git = simpleGit(getRepoPath(baseDir, username, id));
    await git.add('./*');
    await git.commit(commitMessage || 'Update recipe');
    
    const updatedRecipe = {
      ...recipe,
      title,
      updatedAt: new Date().toISOString()
    };
    
    dataStore.recipes[username][recipeIndex] = updatedRecipe;
    
    res.json({
      ...updatedRecipe,
      content
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe', error: error.message });
  }
};

const getRecipeHistory = async (req, res, { baseDir, dataStore }) => {
  try {
    const { username, id } = req.params;
    
    if (!dataStore.users.find(u => u.username === username)) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRecipes = dataStore.recipes[username] || [];
    const recipe = userRecipes.find(r => r.id === id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const git = simpleGit(getRepoPath(baseDir, username, id));
    const logResult = await git.log();
    
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
};

const getRecipeVersion = async (req, res, { baseDir, dataStore }) => {
  try {
    const { username, id, commitHash } = req.params;
    
    if (!dataStore.users.find(u => u.username === username)) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRecipes = dataStore.recipes[username] || [];
    const recipe = userRecipes.find(r => r.id === id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const git = simpleGit(getRepoPath(baseDir, username, id));
    
    try {
      await git.show([commitHash]);
    } catch (error) {
      return res.status(404).json({ message: 'Version not found' });
    }
    
    const showResult = await git.show([`${commitHash}:recipe.md`]);
    
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
};

const setupApp = (config = {}) => {
  const app = express();
  
  // Apply configuration or defaults
  const baseDir = config.reposDir || path.join(__dirname, 'git-repos');
  
  // Create data store
  const dataStore = {
    users: config.inMemoryOnly ? [] : [{
      username: 'demo',
      email: 'demo@example.com'
    }],
    recipes: {}
  };
  
  // Create context object to pass to route handlers
  const context = {
    baseDir,
    dataStore
  };
  
  // Setup middleware
  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
  
  fs.ensureDirSync(baseDir);
  if (!config.inMemoryOnly) {
    fs.ensureDirSync(getUserReposPath(baseDir, 'demo'));
  }
  
  // Setup routes with dependency injection via middleware
  app.get('/api/users/:username/recipes', (req, res) => getAllRecipes(req, res, context));
  app.post('/api/users/:username/recipes', (req, res) => createRecipe(req, res, context));
  app.get('/api/users/:username/recipes/:id', (req, res) => getRecipe(req, res, context));
  app.put('/api/users/:username/recipes/:id', (req, res) => updateRecipe(req, res, context));
  app.get('/api/users/:username/recipes/:id/history', (req, res) => getRecipeHistory(req, res, context));
  app.get('/api/users/:username/recipes/:id/versions/:commitHash', (req, res) => getRecipeVersion(req, res, context));
  
  // Make data accessible for testing
  app.locals.context = context;
  
  return app;
};

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
