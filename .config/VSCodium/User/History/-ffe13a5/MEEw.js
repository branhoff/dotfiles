// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

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
const getRecipeFilePath = (username, recipeId) => path.join(getRepoPath(username, recipeId), 'recipe.md');

// In-memory storage for user and recipe metadata (for POC only)
let users = [{
  username: 'demo',
  email: 'demo@example.com'
}];

let recipes = {};

// For POC: Ensure the default user directory exists
fs.ensureDirSync(getUserReposPath('demo'));

// Routes
// Get all recipes for a user
app.get('/api/users/:username/recipes', (req, res) => {
  const { username } = req.params;
  const userRecipes = recipes[username] || [];
  res.json(userRecipes);
});

// Create a new recipe
app.post('/api/users/:username/recipes', async (req, res) => {
  try {
    const { username } = req.params;
    const { title, content, commitMessage } = req.body;
    
    // Validate user exists (simple check for POC)
    if (!users.find(u => u.username === username)) {
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
    
    if (!recipes[username]) {
      recipes[username] = [];
    }
    
    recipes[username].push(newRecipe);
    
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
    
    if (!users.find(u => u.username === username)) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRecipes = recipes[username] || [];
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});