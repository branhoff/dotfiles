// tests/integration/recipeWorkflow.test.js
const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const app = require('../../server');

describe('Recipe Workflow', () => {
  // Generate a unique test ID to avoid conflicts
  const testTimestamp = Date.now();
  const testUsername = `testuser-${testTimestamp}`;
  let testRecipeId;
  
  // Create a separate test directory for git repositories
  const testBaseDir = path.join(__dirname, '../../test-git-repos');
  const testReposDir = path.join(testBaseDir, testUsername);
  
  // Store the original REPOS_DIR value
  const originalReposDir = process.env.REPOS_DIR;
  
  beforeAll(async () => {
    // Create test directories
    await fs.ensureDir(testReposDir);
    
    // Set environment variable to override the git repos location
    process.env.REPOS_DIR = testBaseDir;
    
    // Add test user to the in-memory database
    if (app.users) {
      app.users.push({
        username: testUsername,
        email: `${testUsername}@example.com`
      });
    }
  });
  
  afterAll(async () => {
    // Restore original REPOS_DIR
    if (originalReposDir) {
      process.env.REPOS_DIR = originalReposDir;
    } else {
      delete process.env.REPOS_DIR;
    }
    
    // Clean up test directories
    if (await fs.pathExists(testBaseDir)) {
      await fs.remove(testBaseDir);
    }
    
    // Remove test user from in-memory database
    if (app.users) {
      const index = app.users.findIndex(u => u.username === testUsername);
      if (index !== -1) {
        app.users.splice(index, 1);
      }
    }
    
    // Clear test recipes from in-memory database
    if (app.recipes && app.recipes[testUsername]) {
      delete app.recipes[testUsername];
    }
  });
  
  test('Full recipe creation and update workflow', async () => {
    // 1. Create recipe
    const createResponse = await request(app)
      .post(`/api/users/${testUsername}/recipes`)
      .send({
        title: 'Test Recipe',
        content: '# Test Recipe\n\nOriginal content',
        commitMessage: 'Initial recipe'
      });
    
    expect(createResponse.status).toBe(201);
    testRecipeId = createResponse.body.id;
    expect(testRecipeId).toBeDefined();
    
    // 2. Verify recipe was created in git
    const repoPath = path.join(testReposDir, testRecipeId);
    expect(await fs.pathExists(repoPath)).toBe(true);
    
    // 3. Update recipe
    const updateResponse = await request(app)
      .put(`/api/users/${testUsername}/recipes/${testRecipeId}`)
      .send({
        title: 'Updated Recipe',
        content: '# Updated Recipe\n\nNew content',
        commitMessage: 'Update recipe'
      });
    
    expect(updateResponse.status).toBe(200);
    
    // 4. Verify git history shows branching and merging
    const git = simpleGit(repoPath);
    const log = await git.log();
    expect(log.total).toBeGreaterThan(1);
    
    // 5. Verify content was updated
    const content = await fs.readFile(
      path.join(repoPath, 'recipe.md'), 
      'utf8'
    );
    expect(content).toBe('# Updated Recipe\n\nNew content');
  });
});