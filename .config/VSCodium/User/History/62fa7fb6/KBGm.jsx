// frontend/src/components/recipes/RecipeEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getRecipe, updateRecipe } from '../../services/recipeService';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 300px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
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

const CancelButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
`;

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

  if (loading) return <p>Loading recipe...</p>;

  return (
    <FormContainer>
      <h2>Edit Recipe</h2>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Recipe Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Recipe Content (Markdown)</Label>
          <Textarea
            id="content"
            name="content"
            value={recipe.content}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="commitMessage">Commit Message</Label>
          <Input
            type="text"
            id="commitMessage"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Describe your changes"
          />
        </FormGroup>
        
        <ButtonGroup>
          <CancelButton type="button" onClick={handleCancel}>
            Cancel
          </CancelButton>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
};

export default RecipeEditForm;