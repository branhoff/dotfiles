// frontend/src/components/recipes/RecipeView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getRecipe } from '../../services/recipeService';
import MarkdownRenderer from '../common/MarkdownRenderer';

const ViewContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const RecipeHeader = styled.div`
  margin-bottom: 20px;
`;

const RecipeTitle = styled.h2`
  margin-bottom: 10px;
`;

const RecipeActions = styled.div`
  margin-bottom: 20px;
`;

const ActionLink = styled(Link)`
  display: inline-block;
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const RecipeView = () => {
  const { username, id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipe(username, id);
        setRecipe(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recipe');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [username, id]);

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>Recipe not found</p>;

  return (
    <ViewContainer>
      <RecipeHeader>
        <RecipeTitle>{recipe.title}</RecipeTitle>
        <p>Last updated: {new Date(recipe.updatedAt).toLocaleString()}</p>
      </RecipeHeader>
      
      <RecipeActions>
        <ActionLink to="/">Back to List</ActionLink>
      </RecipeActions>
      
      <div className="recipe-content">
        <MarkdownRenderer content={recipe.content} />
      </div>
    </ViewContainer>
  );
};

export default RecipeView;