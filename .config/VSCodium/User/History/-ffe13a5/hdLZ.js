// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const crypto = require('crypto');

const getUserReposPath = (baseDir, username) => path.join(baseDir, username);
const getRepoPath = (baseDir, username, recipeId) => path.join(baseDir, username, recipeId);
const getRecipeFilePath = (baseDir, username, recipeId) => path.join(baseDir, username, recipeId, 'recipe.md');

// Update the extractTitleFromContent function in server.js
const extractTitleFromContent = (content, fallbackId = null) => {
  if (!content) return fallbackId;
  
  // Look for Markdown H1 title (#)
  const lines = content.split('\n');
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  
  // If no H1 found, look for the first non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed;
    }
  }
  
  return fallbackId;
};

const getRepoMetadata = async (repoPath, recipeId) => {
  try {
    const git = simpleGit(repoPath);
    
    if (!(await git.checkIsRepo())) {
      return null;
    }
    
    const recipeFile = path.join(repoPath, 'recipe.md');
    if (!(await fs.pathExists(recipeFile))) {
      return null;
    }
    
    const content = await fs.readFile(recipeFile, 'utf8');
    
    const title = extractTitleFromContent(content, recipeId);
    
    const latestLog = await git.log({ maxCount: 1 });
    const updatedAt = latestLog.latest ? latestLog.latest.date : new Date().toISOString();
    
    const firstLog = await git.log({ maxCount: 1, '--reverse': null });
    const createdAt = firstLog.latest ? firstLog.latest.date : updatedAt;
    
    return {
      title,
      createdAt,
      updatedAt
    };
  } catch (error) {
    console.error(`Error getting repo metadata for ${repoPath}:`, error);
    return null;
  }
};

// Get all recipes for a user
const getAllRecipes = async (req, res, { baseDir }) => {
  try {
    const { username } = req.params;
    const userPath = getUserReposPath(baseDir, username);
    
    // Check if user directory exists
    if (!(await fs.pathExists(userPath))) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Read all recipe directories for this user
    const recipeDirs = await fs.readdir(userPath);
    const recipes = [];
    
    // Process each recipe directory
    for (const recipeId of recipeDirs) {
      const repoPath = getRepoPath(baseDir, username, recipeId);
      
      // Skip if not a directory
      if (!(await fs.stat(repoPath)).isDirectory()) continue;
      
      // Get metadata from git repository
      const metadata = await getRepoMetadata(repoPath, recipeId);
      
      if (metadata) {
        recipes.push({
          id: recipeId,
          ...metadata
        });
      }
    }
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes', error: error.message });
  }
};

// Create a new recipe
const createRecipe = async (req, res, { baseDir }) => {
  try {
    const { username } = req.params;
    const { title, content, commitMessage } = req.body;
    
    // Ensure user directory exists
    const userPath = getUserReposPath(baseDir, username);
    await fs.ensureDir(userPath);
    
    // Generate unique ID
    const id = crypto.randomUUID();
    
    // Create repository directory
    const repoPath = getRepoPath(baseDir, username, id);
    await fs.ensureDir(repoPath);
    
    // Initialize git repository
    const git = simpleGit(repoPath);
    await git.init();
    await git.addConfig('user.name', username);
    await git.addConfig('user.email', 'poc@example.com');
    
    // Write recipe file
    const filePath = getRecipeFilePath(baseDir, username, id);
    await fs.writeFile(filePath, content);
    
    // Commit changes
    await git.add('./*');
    await git.commit(commitMessage || 'Initial recipe');
    
    // Get repo metadata
    const metadata = await getRepoMetadata(repoPath, id);
    
    // Return new recipe info
    res.status(201).json({
      id,
      ...metadata
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Failed to create recipe', error: error.message });
  }
};

// Get a specific recipe
const getRecipe = async (req, res, { baseDir }) => {
  try {
    const { username, id } = req.params;
    
    // Check if repository exists
    const repoPath = getRepoPath(baseDir, username, id);
    if (!(await fs.pathExists(repoPath))) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Read recipe content
    const filePath = getRecipeFilePath(baseDir, username, id);
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ message: 'Recipe file not found' });
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    
    // Get metadata from git repository
    const metadata = await getRepoMetadata(repoPath, id);
    
    // Return recipe with content
    res.json({
      id,
      ...metadata,
      content
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Failed to fetch recipe', error: error.message });
  }
};

// Update a recipe
const updateRecipe = async (req, res, { baseDir }) => {
  try {
    const { username, id } = req.params;
    const { title, content, commitMessage } = req.body;
    
    // Check if repository exists
    const repoPath = getRepoPath(baseDir, username, id);
    if (!(await fs.pathExists(repoPath))) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Update recipe file
    const filePath = getRecipeFilePath(baseDir, username, id);
    await fs.writeFile(filePath, content);
    
    // Commit changes
    const git = simpleGit(repoPath);
    await git.add('./*');
    await git.commit(commitMessage || 'Update recipe');
    
    // Get updated metadata
    const metadata = await getRepoMetadata(repoPath, id);
    
    // Return updated recipe
    res.json({
      id,
      ...metadata,
      content
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Failed to update recipe', error: error.message });
  }
};

// Get recipe version history
const getRecipeHistory = async (req, res, { baseDir }) => {
  try {
    const { username, id } = req.params;
    
    // Check if repository exists
    const repoPath = getRepoPath(baseDir, username, id);
    if (!(await fs.pathExists(repoPath))) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Get commit history
    const git = simpleGit(repoPath);
    const logResult = await git.log();
    
    // Format history
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

// Get a specific version of a recipe
const getRecipeVersion = async (req, res, { baseDir }) => {
  try {
    const { username, id, commitHash } = req.params;
    
    // Check if repository exists
    const repoPath = getRepoPath(baseDir, username, id);
    if (!(await fs.pathExists(repoPath))) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const git = simpleGit(repoPath);
    
    // Check if commit exists
    try {
      await git.show([commitHash]);
    } catch (error) {
      return res.status(404).json({ message: 'Version not found' });
    }
    
    // Get recipe content at that commit
    const content = await git.show([`${commitHash}:recipe.md`]);
    
    // Get commit info
    const commitInfo = await git.show([
      '--no-patch',
      '--format=%H%n%an%n%ad%n%s',
      commitHash
    ]);
    
    const [hash, author, date, message] = commitInfo.trim().split('\n');
    
    // Extract title from content
    const title = extractTitleFromContent(content) || id;
    
    res.json({
      id,
      title,
      commitHash,
      author,
      date,
      message,
      content
    });
  } catch (error) {
    console.error('Error fetching recipe version:', error);
    res.status(500).json({ message: 'Failed to fetch recipe version', error: error.message });
  }
};

// Clean setupApp function with no in-memory concepts
const setupApp = (config = {}) => {
  const app = express();
  
  // Apply configuration or defaults
  const baseDir = config.reposDir || path.join(__dirname, 'git-repos');
  
  // Setup middleware
  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
  
  // Ensure base directory exists
  fs.ensureDirSync(baseDir);
  
  // Create context object with only what's needed
  const context = { baseDir };
  
  // Setup routes
  app.get('/api/users/:username/recipes', (req, res) => getAllRecipes(req, res, context));
  app.post('/api/users/:username/recipes', (req, res) => createRecipe(req, res, context));
  app.get('/api/users/:username/recipes/:id', (req, res) => getRecipe(req, res, context));
  app.put('/api/users/:username/recipes/:id', (req, res) => updateRecipe(req, res, context));
  app.get('/api/users/:username/recipes/:id/history', (req, res) => getRecipeHistory(req, res, context));
  app.get('/api/users/:username/recipes/:id/versions/:commitHash', (req, res) => getRecipeVersion(req, res, context));
  
  // Make context accessible for testing
  app.locals.context = context;
  
  // Create demo user directory (not needed for testing since tests create their own user)
  // Only do this in non-test environments to avoid test interference
  if (process.env.NODE_ENV !== 'test') {
    const demoUserPath = getUserReposPath(baseDir, 'demo');
    fs.ensureDirSync(demoUserPath);
  }
  
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
