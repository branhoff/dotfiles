// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Create git-repos directory if it doesn't exist
const REPOS_DIR = path.join(__dirname, 'git-repos');
fs.ensureDirSync(REPOS_DIR);

const getRepoPath = (recipeId) => path.join(REPOS_DIR, recipeId);
const getRecipeFilePath = (recipeId) => path.join(getRepoPath(recipeId), 'recipe.md');

// In-memory storage for recipe metadata (for POC only)
let recipes = [];

// Routes
// Get all recipes
app.get('/api/recipes', (req, res) => {
  res.json(recipes);
});

// Create a new recipe
app.post('/api/recipes', async (req, res) => {
  try {
    const { title, content, commitMessage } = req.body;
    
    // Generate a unique ID
    const id = Date.now().toString();
    
    // Create repository directory
    const repoPath = getRepoPath(id);
    await fs.ensureDir(repoPath);
    
    // Initialize Git repository
    const git = simpleGit(repoPath);
    await git.init();
    
    // Configure Git
    await git.addConfig('user.name', 'POC User');
    await git.addConfig('user.email', 'poc@example.com');
    
    // Create recipe file
    const filePath = getRecipeFilePath(id);
    await fs.writeFile(filePath, content);
    
    // Commit the initial version
    await git.add('./*');
    await git.commit(commitMessage || 'Initial recipe');
    
    // Add to recipes list
    const newRecipe = {
      id,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    recipes.push(newRecipe);
    
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Failed to create recipe' });
  }
});

// Get a specific recipe
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = recipes.find(r => r.id === id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const content = await fs.readFile(getRecipeFilePath(id), 'utf8');
    
    res.json({
      ...recipe,
      content
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Failed to fetch recipe' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});