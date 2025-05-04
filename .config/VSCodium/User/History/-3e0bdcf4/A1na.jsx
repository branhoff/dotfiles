// frontend/src/components/recipes/RecipeForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const recipeData = {
        ...recipe,
        commitMessage
      };
      
      const newRecipe = await createRecipe(recipeData);
      navigate(`/recipes/${newRecipe.id}`);
    } catch (err) {
      setError('Failed to save recipe');
    } finally {
      setLoading(false);
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
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Recipe'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default RecipeForm;