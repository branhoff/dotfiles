// frontend/src/services/recipeService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/recipes';

// Get all recipes
export const getAllRecipes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get a specific recipe
export const getRecipe = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a new recipe
export const createRecipe = async (recipeData) => {
  const response = await axios.post(API_URL, recipeData);
  return response.data;
};