// frontend/src/services/recipeService.js
import axios from 'axios';

// For the POC, we'll use a hardcoded username
const DEFAULT_USER = 'demo';
const API_BASE_URL = 'http://localhost:3001/api';

// Get all recipes
export const getAllRecipes = async () => {
  const response = await axios.get(`${API_BASE_URL}/users/${DEFAULT_USER}/recipes`);
  return response.data;
};

// Get a specific recipe
export const getRecipe = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/users/${DEFAULT_USER}/recipes/${id}`);
  return response.data;
};

// Create a new recipe
export const createRecipe = async (recipeData) => {
  const response = await axios.post(`${API_BASE_URL}/users/${DEFAULT_USER}/recipes`, recipeData);
  return response.data;
};