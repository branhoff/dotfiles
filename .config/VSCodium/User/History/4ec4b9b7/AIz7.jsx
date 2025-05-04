// frontend/src/components/recipes/RecipeVersionView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecipeVersion, updateRecipe } from '../../services/recipeService';
import MarkdownRenderer from '../common/MarkdownRenderer';

const RecipeVersionView = () => {
  const { username, id, commitHash } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const data = await getRecipeVersion(username, id, commitHash);
        setRecipe(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching version:', err);
        setError(`Failed to fetch version: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchVersion();
  }, [username, id, commitHash]);

  const handleRestore = async () => {
    if (!recipe) return;
    
    setRestoring(true);
    try {
      const updateData = {
        title: recipe.title,
        content: recipe.content,
        commitMessage: `Restored from version ${commitHash.substring(0, 7)}`
      };
      
      await updateRecipe(username, id, updateData);
      navigate(`/users/${username}/recipes/${id}`);
    } catch (err) {
      console.error('Error restoring version:', err);
      setError(`Failed to restore version: ${err.message || 'Unknown error'}`);
    } finally {
      setRestoring(false);
    }
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="view-container"><p>Error: {error}</p></div>;
  if (!recipe) return <div className="view-container"><p>Version not found</p></div>;

  return (
    <div className="view-container">
      <div className="recipe-header">
        <h2>{recipe.title}</h2>
        <div className="version-info">
          Version: <span className="version-badge">{commitHash.substring(0, 7)}</span>
        </div>
      </div>
      
      <div className="recipe-actions">
        <Link to={`/users/${username}/recipes/${id}`} className="btn">
          Back to Latest
        </Link>
        <Link to={`/users/${username}/recipes/${id}/history`} className="btn btn-secondary">
          Version History
        </Link>
        <button 
          className="btn btn-primary"
          onClick={handleRestore} 
          disabled={restoring}
        >
          {restoring ? 'Restoring...' : 'Restore This Version'}
        </button>
      </div>
      
      <div className="recipe-content">
        <MarkdownRenderer content={recipe.content} />
      </div>
    </div>
  );
};

export default RecipeVersionView;
