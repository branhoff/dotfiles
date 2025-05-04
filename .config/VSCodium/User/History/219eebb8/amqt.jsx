// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import RecipeList from './components/recipes/RecipeList';
import RecipeView from './components/recipes/RecipeView';
import RecipeForm from './components/recipes/RecipeForm';
import RecipeEditForm from './components/recipes/RecipeEditForm';
import RecipeHistory from './components/recipes/RecipeHistory';
import RecipeVersionView from './components/recipes/RecipeVersionView';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>GitGrub</h1>
          <p className="subtitle">Version-controlled recipe management</p>
        </header>
        
        <main>
          <Routes>
            {/* Redirect root to demo user recipes */}
            <Route path="/" element={<Navigate to="/users/demo/recipes" />} />
            
            {/* Recipe list */}
            <Route path="/users/:username/recipes" element={<RecipeList />} />
            
            {/* Create new recipe */}
            <Route path="/users/:username/recipes/new" element={<RecipeForm />} />
            
            {/* View recipe */}
            <Route path="/users/:username/recipes/:id" element={<RecipeView />} />
            
            {/* Edit recipe */}
            <Route path="/users/:username/recipes/:id/edit" element={<RecipeEditForm />} />
            
            {/* Recipe version history */}
            <Route path="/users/:username/recipes/:id/history" element={<RecipeHistory />} />
            
            {/* View specific version */}
            <Route path="/users/:username/recipes/:id/versions/:commitHash" element={<RecipeVersionView />} />
            
            {/* Restore specific version - redirects to edit form pre-filled with that version */}
            <Route 
              path="/users/:username/recipes/:id/restore/:commitHash" 
              element={<RecipeVersionView />} 
            />
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>&copy; 2025 GitGrub - Git-based Recipe Versioning POC</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
