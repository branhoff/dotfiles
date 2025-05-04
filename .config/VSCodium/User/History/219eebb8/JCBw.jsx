// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
            {/* Default route redirects to demo user's recipes */}
            <Route path="/" element={<Navigate to="/users/demo/recipes" />} />
            
            {/* User-based routes */}
            <Route path="/users/:username/recipes" element={<RecipeList />} />
            <Route path="/users/:username/recipes/new" element={<RecipeForm />} />
            <Route path="/users/:username/recipes/:id" element={<RecipeView />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App