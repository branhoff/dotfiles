// frontend/src/components/recipes/RecipeHistory.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRecipeVersions } from '../../services/recipeService';

const RecipeHistory = () => {
  const { username, id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getRecipeVersions(username, id);
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

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="history-container"><p>Error: {error}</p></div>;

  return (
    <div className="history-container">
      <h2>Version History</h2>
      
      <div className="recipe-actions">
        <Link to={`/users/${username}/recipes/${id}`} className="btn">
          Back to Recipe
        </Link>
      </div>
      
      {history.length === 0 ? (
        <p>No version history available.</p>
      ) : (
        <div className="version-list">
          {history.map((version, index) => (
            <div className="version-item" key={version.hash}>
              <div className="version-info">
                <h3>{version.message}</h3>
                <p>
                  {version.author} • {new Date(version.date).toLocaleString()}
                  <span className="version-badge">{version.hash.substring(0, 7)}</span>
                </p>
              </div>
              <div className="version-actions">
                <Link to={`/users/${username}/recipes/${id}/versions/${version.hash}`} 
                      className="btn btn-secondary">
                  View
                </Link>
                {index !== 0 && (
                  <Link to={`/users/${username}/recipes/${id}/restore/${version.hash}`} 
                        className="btn">
                    Restore
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeHistory;
