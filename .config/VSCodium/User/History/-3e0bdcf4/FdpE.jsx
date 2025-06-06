// frontend/src/components/recipes/RecipeForm.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe } from '../../services/recipeService';

const RecipeForm = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  
  const [recipe, setRecipe] = useState({
    title: '',
    content: `## Ingredients

- Ingredient 1
- Ingredient 2
- Ingredient 3

## Instructions

1. Step 1
2. Step 2
3. Step 3
`
  });
  
  const [commitMessage, setCommitMessage] = useState('Initial recipe');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };

  const handleCancel = () => {
    navigate(`/users/${username}/recipes`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    if (!recipe.title.trim()) {
      setError('Please enter a title');
      setSubmitting(false);
      return;
    }
    
    if (!recipe.content.trim()) {
      setError('Please enter recipe content');
      setSubmitting(false);
      return;
    }
    
    try {
      const recipeData = {
        title: recipe.title,
        content: recipe.content,
        commitMessage: commitMessage || `Created recipe: ${recipe.title}`
      };
      
      const newRecipe = await createRecipe(username, recipeData);
      
      navigate(`/users/${username}/recipes/${newRecipe.id}`);
    } catch (err) {
      console.error('Error creating recipe:', err);
      setError(`Failed to save recipe: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create New Recipe</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Recipe Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Recipe Content (Markdown)</label>
          <textarea
            id="content"
            name="content"
            value={recipe.content}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="commitMessage">Commit Message</label>
          <input
            type="text"
            id="commitMessage"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Initial recipe creation"
          />
        </div>
        
        <div className="button-group">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;