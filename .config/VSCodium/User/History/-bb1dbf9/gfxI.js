

export const ROUTES = {
    HOME: '/',
    RECIPE_LIST: '/users/:username/recipes',
    RECIPE_NEW: '/users/:username/recipes/new',
    RECIPE_VIEW: '/users/:username/recipes/:recipeId',
    RECIPE_EDIT: '/users/:username/recipes/:recipeId/edit',
    RECIPE_VERSIONS: '/users/:username/recipes/:recipeId/versions',
    RECIPE_VERSION_VIEW: '/users/:username/recipes/:recipeId/versions/:commitHash',
    RECIPE_RESTORE: '/users/:username/recipes/:recipeId/restore/:commitHash',
  };