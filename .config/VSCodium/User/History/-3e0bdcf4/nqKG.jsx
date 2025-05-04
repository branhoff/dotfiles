// frontend/src/components/recipes/RecipeForm.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createRecipe } from '../../services/recipeService';

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
`;

const RecipeForm = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  
  const [recipe, setRecipe] = useState({
    title: '',
    content: `## Ingredients

- Ingredient 1
- Ingredient 2
- Ingredient 3

## Instructions

1. Step 1
2. Step 2
3. Step 3
`
  });
  
  const [commitMessage, setCommitMessage] = useState('Initial recipe');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
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
      const commitMessage = `Created recipe: ${recipe.title}`;
      
      const recipeData = {
        title: recipe.title,
        content: recipe.content,
        commitMessage
      };
      
      const newRecipe = await createRecipe(username, recipeData);
      
      navigate(`/users/${username}/recipes/${newRecipe.id}`);
    } catch (err) {
      console.error('Error creating recipe:', err);
      setError(`Failed to save recipe: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <h2>Create New Recipe</h2>
      
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
            placeholder="Initial recipe creation"
          />
        </FormGroup>
        
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Recipe'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default RecipeForm;