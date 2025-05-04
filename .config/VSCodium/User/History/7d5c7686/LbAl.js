// tests/integration/recipeWorkflow.test.js
const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');

const setupApp = require('../../server');

describe('Recipe Workflow Integration', () => {
  let app;
  const TEST_REPOS_DIR = path.join(__dirname, 'git-repos-test');
  const USERNAME = 'testuser';
  let recipeId;

  beforeAll(async () => {
    await fs.remove(TEST_REPOS_DIR);
    await fs.ensureDir(TEST_REPOS_DIR);
    
    app = setupApp({
      reposDir: TEST_REPOS_DIR,
      inMemoryOnly: true
    });
    
    // Add test user - need to access through the context object
    app.locals.context.dataStore.users.push({
      username: USERNAME,
      email: 'test@example.com'
    });
    
    await fs.ensureDir(path.join(TEST_REPOS_DIR, USERNAME));
  });

  afterAll(async () => {
    await fs.remove(TEST_REPOS_DIR);
  });

  // Test creating a new recipe
  test('should create a new recipe', async () => {
    const recipeData = {
      title: 'Test Recipe',
      content: '# Test Recipe\n\nThis is a test recipe content.',
      commitMessage: 'Initial recipe creation'
    };

    const response = await request(app)
      .post(`/api/users/${USERNAME}/recipes`)
      .send(recipeData)
      .expect(201);

    // Save recipe ID for subsequent tests
    recipeId = response.body.id;

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title', recipeData.title);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');

    const repoPath = path.join(TEST_REPOS_DIR, USERNAME, recipeId);
    const filePath = path.join(repoPath, 'recipe.md');
    
    expect(await fs.pathExists(filePath)).toBe(true);
    
    // Verify git repository was initialized
    const git = simpleGit(repoPath);
    const isRepo = await git.checkIsRepo();
    expect(isRepo).toBe(true);
    
    // Verify commit was made
    const log = await git.log();
    expect(log.total).toBe(1);
    expect(log.latest.message).toBe(recipeData.commitMessage);
  });

  // Test getting all recipes
  test('should get all recipes for a user', async () => {
    const response = await request(app)
      .get(`/api/users/${USERNAME}/recipes`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty('id', recipeId);
  });

  // Test getting a specific recipe
  test('should get a specific recipe', async () => {
    const response = await request(app)
      .get(`/api/users/${USERNAME}/recipes/${recipeId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', recipeId);
    expect(response.body).toHaveProperty('title', 'Test Recipe');
    expect(response.body).toHaveProperty('content', '# Test Recipe\n\nThis is a test recipe content.');
  });

  // Test updating a recipe
  test('should update a recipe', async () => {
    const updateData = {
      title: 'Updated Test Recipe',
      content: '# Updated Test Recipe\n\nThis content has been updated.',
      commitMessage: 'Update recipe content'
    };

    const response = await request(app)
      .put(`/api/users/${USERNAME}/recipes/${recipeId}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('title', updateData.title);
    expect(response.body).toHaveProperty('content', updateData.content);
    
    // Verify file was updated
    const filePath = path.join(TEST_REPOS_DIR, USERNAME, recipeId, 'recipe.md');
    const content = await fs.readFile(filePath, 'utf8');
    expect(content).toBe(updateData.content);
    
    // Verify commit was made
    const git = simpleGit(path.join(TEST_REPOS_DIR, USERNAME, recipeId));
    const log = await git.log();
    expect(log.total).toBe(2);
    expect(log.latest.message).toBe(updateData.commitMessage);
  });

  // Test getting recipe version history
  test('should get recipe version history', async () => {
    const response = await request(app)
      .get(`/api/users/${USERNAME}/recipes/${recipeId}/history`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    
    // Check that we have the right commits in reverse chronological order
    expect(response.body[0].message).toBe('Update recipe content');
    expect(response.body[1].message).toBe('Initial recipe creation');
    
    // Each commit should have hash, author, date, and message
    expect(response.body[0]).toHaveProperty('hash');
    expect(response.body[0]).toHaveProperty('author');
    expect(response.body[0]).toHaveProperty('date');
    expect(response.body[0]).toHaveProperty('message');
  });

  // Test getting a specific version of a recipe
  test('should get a specific version of a recipe', async () => {
    // First get the commit hash of the initial version
    const historyResponse = await request(app)
      .get(`/api/users/${USERNAME}/recipes/${recipeId}/history`)
      .expect(200);
    
    const initialVersionHash = historyResponse.body[1].hash;
    
    // Now get that specific version
    const response = await request(app)
      .get(`/api/users/${USERNAME}/recipes/${recipeId}/versions/${initialVersionHash}`)
      .expect(200);

    expect(response.body).toHaveProperty('content', '# Test Recipe\n\nThis is a test recipe content.');
    expect(response.body).toHaveProperty('commitHash', initialVersionHash);
  });

  // Test error cases
  test('should return 404 for non-existent user', async () => {
    await request(app)
      .get('/api/users/nonexistentuser/recipes')
      .expect(404);
  });

  test('should return 404 for non-existent recipe', async () => {
    await request(app)
      .get(`/api/users/${USERNAME}/recipes/nonexistentid`)
      .expect(404);
  });
});
