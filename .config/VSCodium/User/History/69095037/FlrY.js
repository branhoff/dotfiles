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
// Update a recipe
export const updateRecipe = async (username, id, recipeData) => {
  const response = await axios.put(`${API_BASE_URL}/users/${username}/recipes/${id}`, recipeData);
  return response.data;
};

// Get recipe version history
export const getRecipeVersions = async (username, id) => {
  const response = await axios.get(`${API_BASE_URL}/users/${username}/recipes/${id}/versions`);
  return response.data;
};

// Get a specific version of a recipe
export const getRecipeVersion = async (username, id, commitHash) => {
  const response = await axios.get(`${API_BASE_URL}/users/${username}/recipes/${id}/versions/${commitHash}`);
  return response.data;
};

// Restore a specific version of a recipe
export const restoreRecipeVersion = async (username, id, commitHash, commitMessage) => {
  const response = await axios.post(
    `${API_BASE_URL}/users/${username}/recipes/${id}/restore/${commitHash}`, 
    { commitMessage }
  );
  return response.data;
};
