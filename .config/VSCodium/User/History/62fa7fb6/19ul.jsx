// frontend/src/components/recipes/RecipeEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipe, updateRecipe } from '../../services/recipeService';

const RecipeEditForm = () => {
  const navigate = useNavigate();
  const { username, id } = useParams();
  
  const [recipe, setRecipe] = useState({
    title: '',
    content: ''
  });
  
  const [commitMessage, setCommitMessage] = useState('Update recipe');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipe(username, id);
        setRecipe({
          title: data.title,
          content: data.content
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(`Failed to fetch recipe: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [username, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };

  const handleCancel = () => {
    navigate(`/users/${username}/recipes/${id}`);
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
        commitMessage
      };
      
      await updateRecipe(username, id, recipeData);
      
      navigate(`/users/${username}/recipes/${id}`);
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(`Failed to update recipe: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="form-container">
      <h2>Edit Recipe</h2>
      
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
            placeholder="Describe your changes"
          />
        </div>
        
        <div className="button-group">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeEditForm;