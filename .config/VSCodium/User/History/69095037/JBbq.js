// frontend/src/services/recipeService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Get all recipes for a user
export const getAllRecipes = async (username) => {
  const response = await axios.get(`${API_BASE_URL}/users/${username}/recipes`);
  return response.data;
};

// Get a specific recipe
export const getRecipe = async (username, id) => {
  const response = await axios.get(`${API_BASE_URL}/users/${username}/recipes/${id}`);
  return response.data;
};

// Create a new recipe
export const createRecipe = async (username, recipeData) => {
  const response = await axios.post(`${API_BASE_URL}/users/${username}/recipes`, recipeData);
  return response.data;
};