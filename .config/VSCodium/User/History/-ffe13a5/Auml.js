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