// frontend/src/components/recipes/RecipeView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

const UpdateInfo = styled.div`
  color: #666;
  font-size: 0.9em;
`;

const RecipeActions = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ActionLink = styled(Link)`
  display: inline-block;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const EditButton = styled(ActionLink)`
  background-color: #4CAF50;
  color: white;
  
  &:hover {
    background-color: #45a049;
  }
`;

const HistoryButton = styled(ActionLink)`
  background-color: #2196F3;
  color: white;
  
  &:hover {
    background-color: #0b7dda;
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
        console.error('Error fetching recipe:', err);
        setError(`Failed to fetch recipe: ${err.message || 'Unknown error'}`);
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
        <UpdateInfo>Last updated: {new Date(recipe.updatedAt).toLocaleString()}</UpdateInfo>
      </RecipeHeader>
      
      <RecipeActions>
        <ActionLink to={`/users/${username}/recipes`}>
          Back to List
        </ActionLink>
        <EditButton to={`/users/${username}/recipes/${id}/edit`}>
          Edit Recipe
        </EditButton>
        <HistoryButton to={`/users/${username}/recipes/${id}/history`}>
          Version History
        </HistoryButton>
      </RecipeActions>
      
      <div className="recipe-content">
        <MarkdownRenderer content={recipe.content} />
      </div>
    </ViewContainer>
  );
};

export default RecipeView;