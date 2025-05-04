// frontend/src/components/recipes/RecipeHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getRecipeHistory } from '../../services/recipeService';

const HistoryContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const VersionList = styled.div`
  margin-top: 20px;
`;

const VersionItem = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const VersionInfo = styled.div`
  flex: 1;
`;

const VersionMeta = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-top: 5px;
`;

const VersionActions = styled.div`
  margin-left: 20px;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  padding: 5px 10px;
  margin-left: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const Navigation = styled.div`
  margin-bottom: 20px;
`;

const RecipeHistory = () => {
  const { username, id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getRecipeHistory(username, id);
        setHistory(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(`Failed to fetch version history: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [username, id]);

  if (loading) return <p>Loading version history...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <HistoryContainer>
      <h2>Version History</h2>
      
      <Navigation>
        <ActionButton to={`/users/${username}/recipes/${id}`}>
          Back to Recipe
        </ActionButton>
      </Navigation>
      
      {history.length === 0 ? (
        <p>No version history available.</p>
      ) : (
        <VersionList>
          {history.map((version, index) => (
            <VersionItem key={version.hash}>
              <VersionInfo>
                <h3>{version.message}</h3>
                <VersionMeta>
                  {version.author} • {new Date(version.date).toLocaleString()}
                </VersionMeta>
                <VersionMeta>
                  Commit: {version.hash.substring(0, 7)}
                </VersionMeta>
              </VersionInfo>
              <VersionActions>
                <ActionButton to={`/users/${username}/recipes/${id}/versions/${version.hash}`}>
                  View
                </ActionButton>
                {index !== 0 && (
                  <ActionButton to={`/users/${username}/recipes/${id}/restore/${version.hash}`}>
                    Restore
                  </ActionButton>
                )}
              </VersionActions>
            </VersionItem>
          ))}
        </VersionList>
      )}
    </HistoryContainer>
  );
};

export default RecipeHistory;