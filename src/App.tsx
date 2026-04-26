import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { AddIngredient } from './pages/AddIngredient'
import { RecipeSuggestions } from './pages/RecipeSuggestions'
import { FavoriteRecipes } from './pages/FavoriteRecipes'
import { Settings } from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/add"       element={<AddIngredient />} />
          <Route path="/recipe"    element={<RecipeSuggestions />} />
          <Route path="/favorites" element={<FavoriteRecipes />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
