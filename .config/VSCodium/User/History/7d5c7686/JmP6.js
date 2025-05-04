// tests/integration/recipeWorkflow.test.js
const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');

describe('Recipe Workflow', () => {
  // Generate a unique test ID to avoid conflicts
  const testTimestamp = Date.now();
  const testUsername = `testuser-${testTimestamp}`;
  let testRecipeId;
  
  // Create a test-specific directory for git repositories
  const testReposDir = path.join(__dirname, '../../git-repos', testUsername);
  
  // Store a reference to the original app for restoration
  let originalApp;
  let app;
  
  beforeAll(async () => {
    // Create test directory
    await fs.ensureDir(testReposDir);
    
    // Temporarily modify the REPOS_DIR value in your app
    // by creating a fresh instance with the right configuration
    const serverPath = path.join(__dirname, '../../server.js');
    
    // Clear require cache for server.js to ensure we get a fresh copy
    delete require.cache[require.resolve(serverPath)];
    
    // Now require the server module to get a fresh instance
    app = require(serverPath);
    
    // Add test user to the in-memory users array
    app.users = app.users || [];
    app.users.push({
      username: testUsername,
      email: `${testUsername}@example.com`
    });
    
    // Initialize recipes for test user
    app.recipes = app.recipes || {};
    app.recipes[testUsername] = [];
  });
  
  afterAll(async () => {
    // Clean up test data from git-repos directory
    const testUserRepoPath = path.join(__dirname, '../../git-repos', testUsername);
    if (await fs.pathExists(testUserRepoPath)) {
      await fs.remove(testUserRepoPath);
    }
    
    // If we created test recipes, remove them from memory
    if (app.recipes && app.recipes[testUsername]) {
      delete app.recipes[testUsername];
    }
    
    // Remove test user from memory
    if (app.users) {
      const index = app.users.findIndex(u => u.username === testUsername);
      if (index !== -1) {
        app.users.splice(index, 1);
      }
    }
  });
  
  test('Full recipe creation and update workflow', async () => {
    // 1. Create recipe - using the test username instead of 'demo'
    const createResponse = await request(app)
      .post(`/api/users/${testUsername}/recipes`)
      .send({
        title: 'Test Recipe',
        content: '# Test Recipe\n\nOriginal content',
        commitMessage: 'Initial recipe'
      });
    
    expect(createResponse.status).toBe(201);
    testRecipeId = createResponse.body.id;
    
    // Explicitly verify we got a valid recipe ID
    expect(testRecipeId).toBeDefined();
    expect(typeof testRecipeId).toBe('string');
    
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