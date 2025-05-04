// frontend/src/App.jsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import RecipeList from './components/recipes/RecipeList'
import RecipeForm from './components/recipes/RecipeForm'
import RecipeView from './components/recipes/RecipeView'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>GitGrub - Recipe Versioning with Git</h1>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<RecipeList />} />
            <Route path="/create" element={<RecipeForm />} />
            <Route path="/recipes/:id" element={<RecipeView />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App