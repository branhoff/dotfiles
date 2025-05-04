// frontend/src/components/recipes/RecipeList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAllRecipes } from '../../services/recipeService';

const RecipeList = () => {
  const { username = 'demo' } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getAllRecipes(username);
        setRecipes(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(`Failed to fetch recipes: ${err.message}`);
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [username]);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="list-container"><p>Error: {error}</p></div>;

  return (
    <div className="list-container">
      <h2>{username}'s Recipes</h2>
      <Link to={`/users/${username}/recipes/new`} className="btn btn-primary">Create New Recipe</Link>
      
      {recipes.length === 0 ? (
        <p>No recipes found. Create one to get started!</p>
      ) : (
        <div className="recipe-list">
          {recipes.map(recipe => (
            <div className="recipe-item" key={recipe.id}>
              <h3>{recipe.title}</h3>
              <p>Last updated: {new Date(recipe.updatedAt).toLocaleString()}</p>
              <div className="recipe-actions">
                <Link to={`/users/${username}/recipes/${recipe.id}`} className="btn btn-secondary">View Recipe</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;
