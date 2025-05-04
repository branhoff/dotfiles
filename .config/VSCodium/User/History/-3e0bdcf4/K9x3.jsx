// frontend/src/components/recipes/RecipeForm.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createRecipe } from '../../services/recipeService';

// [Your styled components remain the same]

const RecipeForm = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  
  const [recipe, setRecipe] = useState({
    title: '',
    content: ''
  });
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setError(null);
    
    if (!recipe.title.trim()) {
      setError('Please enter a title');
      setIsLoading(false);
      return;
    }
    
    if (!recipe.content.trim()) {
      setError('Please enter recipe content');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log(`Submitting recipe to /api/users/${username}/recipes`, recipe);
      
      const commitMessage = `Created recipe: ${recipe.title}`;
      
      const recipeData = {
        title: recipe.title,
        content: recipe.content,
        commitMessage
      };
      
      // Use recipeData instead of formData
      const newRecipe = await createRecipe(username, recipeData);
      
      // Use correct URL format for navigation
      navigate(`/users/${username}/recipes/${newRecipe.id}`);
    } catch (err) {
      console.error('Error creating recipe:', err);
      setError(`Failed to save recipe: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <FormContainer>
      <h2>Create New Recipe</h2>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Recipe Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            placeholder="Enter recipe title"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Recipe Content</Label>
          <Textarea
            id="content"
            name="content"
            value={recipe.content}
            onChange={handleChange}
            placeholder="# My Recipe

## Ingredients
- Ingredient 1
- Ingredient 2

## Instructions
1. Step 1
2. Step 2"
            rows={15}
          />
        </FormGroup>
        
        <FormActions>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Recipe'}
          </Button>
          <Button type="button" onClick={() => navigate(-1)} secondary>
            Cancel
          </Button>
        </FormActions>
      </Form>
    </FormContainer>
  );
};

export default RecipeForm;