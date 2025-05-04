Create a Proof of Concept (POC) for a recipe versioning application that leverages Git as the underlying version control system instead of implementing a custom database solution. This approach will allow us to validate the concept quickly while taking advantage of Git's robust versioning capabilities.

The POC should demonstrate how recipes can be stored as Markdown files in Git repositories, with all versioning operations handled through standard Git commands. This will validate our hypothesis that Git provides sufficient functionality for recipe versioning before we invest in a more complex custom solution.

## Requirements
Database Components (Minimal)
- Simple User model with basic authentication
- Repository tracking to map users to their recipe repositories

### Recipe Structure

- Standard Markdown files
- Structured sections for ingredients and instructions
- Storage under users

### Core Git Operations to Implement

#### Create and Edit Recipes
- Create new recipe files
- Edit existing recipes
- Commit changes with descriptive messages

#### View Recipe History
- Display commit timeline for a recipe
- Show commit messages and authors
- Simple filtering by date (stretch)

#### Compare Recipe Versions
- Visual diff between any two versions
- Highlight changes in ingredients and instructions
- Option to view raw diff or formatted diff

#### Restore Previous Versions
- Ability to checkout older versions
- Option to restore an old version as the current version

---

# Key resources
- Users
- Recipes (repositories containing a markdown file)
- Recipe versions (git commits)

# RESTful API Structure

### User Management
```
# Register new user
POST /api/auth/register

# Authenticate user
POST /api/auth/login

# Get current user profile
GET /api/auth/me
```

### Recipe Management
```
# List all user's recipes
GET /api/recipes

# Create new recipe
POST /api/recipes

# Get specific recipe
GET /api/recipes/{repoId}

# Update recipe
PUT /api/recipes/{repoId}

# Delete recipe
DELETE /api/recipes{repoId}
```

### Version Management
```
# List all versions
GET /api/recipes/{recipeId}/versions

# Get specific version
GET /api/recipes/{recipeId}/versions/{versionId}

# Restore version
POST /api/recipes/{recipeId}/versions/{versionId}/restore
```

### Version Comparison
```
# Compare versions
GET /api/recipes/{recipeId}/diff?v1={versionId1}&v2={versionId2}
```