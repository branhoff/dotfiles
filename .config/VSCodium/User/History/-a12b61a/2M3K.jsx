// frontend/src/components/recipes/RecipeList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getAllRecipes } from '../../services/recipeService';

const ListContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const RecipeItem = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const RecipeTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
`;

const RecipeActions = styled.div`
  margin-top: 10px;
`;

const CreateButton = styled(Link)`
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #45a049;
  }
`;

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

  if (loading) return <p>Loading recipes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ListContainer>
      <h2>{username}'s Recipes</h2>
      <CreateButton to={`/users/${username}/recipes/new`}>Create New Recipe</CreateButton>
      
      {recipes.length === 0 ? (
        <p>No recipes found. Create one to get started!</p>
      ) : (
        recipes.map(recipe => (
          <RecipeItem key={recipe.id}>
            <RecipeTitle>{recipe.title}</RecipeTitle>
            <p>Last updated: {new Date(recipe.updatedAt).toLocaleString()}</p>
            <RecipeActions>
              {/* Update recipe link to include username */}
              <Link to={`/users/${username}/recipes/${recipe.id}`}>View</Link>
            </RecipeActions>
          </RecipeItem>
        ))
      )}
    </ListContainer>
  );
};

export default RecipeList;