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
  
  const [originalContent, setOriginalContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update recipe');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Extract title from content
  const extractTitleFromContent = (content) => {
    if (!content) return '';
    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.startsWith('# ')) {
      return firstLine.substring(2).trim();
    }
    return '';
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipe(username, id);
        
        // Extract title from content if present
        const contentTitle = extractTitleFromContent(data.content);
        const title = contentTitle || data.title;
        
        setRecipe({
          title: title,
          content: data.content
        });
        
        // Store original content for comparison
        setOriginalContent(data.content);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(`Failed to fetch recipe: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [username, id]);

  // Update title in content when title field changes
  useEffect(() => {
    // Only update if we're not in loading state and have content
    if (!loading && recipe.content) {
      // Check if content starts with a title
      const hasTitle = recipe.content.startsWith('# ');
      
      if (hasTitle) {
        // Replace existing title
        const updatedContent = recipe.content.replace(
          /^# .*(\r?\n|\r)/,
          `# ${recipe.title}$1`
        );
        
        if (updatedContent !== recipe.content) {
          setRecipe(prev => ({
            ...prev,
            content: updatedContent
          }));
        }
      } else {
        // Add title to the beginning
        setRecipe(prev => ({
          ...prev,
          content: `# ${recipe.title}\n\n${prev.content}`
        }));
      }
    }
  }, [recipe.title, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'content') {
      // When content changes, check if title line changed
      const contentTitle = extractTitleFromContent(value);
      
      setRecipe(prev => ({
        ...prev,
        content: value,
        title: contentTitle || prev.title
      }));
    } else {
      setRecipe({
        ...recipe,
        [name]: value
      });
    }
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
      // Ensure content starts with title as H1
      let finalContent = recipe.content;
      if (!finalContent.startsWith(`# ${recipe.title}`)) {
        finalContent = `# ${recipe.title}\n\n${finalContent.replace(/^# .*\n\n/, '')}`;
      }
      
      const recipeData = {
        title: recipe.title,
        content: finalContent,
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