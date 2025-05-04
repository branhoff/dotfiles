// tests/integration/recipeWorkflow.test.js
const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const app = require('../../server');

describe('Recipe Workflow', () => {
  let testRecipeId;
  const testReposDir = path.join(__dirname, '../../git-repos/demo');
  
  beforeAll(async () => {
    await fs.ensureDir(testReposDir);
  });
  
  afterAll(async () => {
    // Cleanup test data but preserve structure
    const recipeDir = path.join(testReposDir, testRecipeId);
    if (await fs.pathExists(recipeDir)) {
      await fs.remove(recipeDir);
    }
  });
  
  test('Full recipe creation and update workflow', async () => {
    // 1. Create recipe
    const createResponse = await request(app)
      .post('/api/users/demo/recipes')
      .send({
        title: 'Test Recipe',
        content: '# Test Recipe\n\nOriginal content',
        commitMessage: 'Initial recipe'
      });
    
    expect(createResponse.status).toBe(201);
    testRecipeId = createResponse.body.id;
    
    // 2. Verify recipe was created in git
    const repoPath = path.join(testReposDir, testRecipeId);
    expect(await fs.pathExists(repoPath)).toBe(true);
    
    // 3. Update recipe
    const updateResponse = await request(app)
      .put(`/api/users/demo/recipes/${testRecipeId}`)
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