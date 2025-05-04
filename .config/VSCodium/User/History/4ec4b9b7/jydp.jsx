// frontend/src/components/recipes/RecipeVersionView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getRecipeVersion, updateRecipe } from '../../services/recipeService';
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

const VersionInfo = styled.div`
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: #f7f7f7;
  border-radius: 4px;
  font-size: 0.9em;
`;

const RecipeActions = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

const ActionButton = styled(Link)`
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

const RestoreButton = styled.button`
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

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

  if (loading) return <p>Loading version...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!recipe) return <p>Version not found</p>;

  return (
    <ViewContainer>
      <RecipeHeader>
        <RecipeTitle>{recipe.title}</RecipeTitle>
        <VersionInfo>
          Version: {commitHash.substring(0, 7)}
        </VersionInfo>
      </RecipeHeader>
      
      <RecipeActions>
        <ActionButton to={`/users/${username}/recipes/${id}`}>
          Back to Latest
        </ActionButton>
        <ActionButton to={`/users/${username}/recipes/${id}/history`}>
          Version History
        </ActionButton>
        <RestoreButton 
          onClick={handleRestore} 
          disabled={restoring}
        >
          {restoring ? 'Restoring...' : 'Restore This Version'}
        </RestoreButton>
      </RecipeActions>
      
      <div className="recipe-content">
        <MarkdownRenderer content={recipe.content} />
      </div>
    </ViewContainer>
  );
};

export default RecipeVersionView;