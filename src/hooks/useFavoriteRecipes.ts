import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { FavoriteRecipe, Recipe, Feedback } from '../types'

export function useFavoriteRecipes() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteRecipe[]>('fridge-favorites', [])

  const saveFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev => {
      if (prev.find(f => f.recipe.title === recipe.title)) return prev
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          recipe,
          feedbacks: [],
          savedAt: new Date().toISOString(),
        },
      ]
    })
  }, [setFavorites])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }, [setFavorites])

  const addFeedback = useCallback((favoriteId: string, feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
    setFavorites(prev =>
      prev.map(f =>
        f.id === favoriteId
          ? {
              ...f,
              feedbacks: [
                ...f.feedbacks,
                { ...feedback, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
              ],
            }
          : f
      )
    )
  }, [setFavorites])

  const updateUserPhoto = useCallback((favoriteId: string, photoUrl: string) => {
    setFavorites(prev =>
      prev.map(f => f.id === favoriteId ? { ...f, userPhotoUrl: photoUrl } : f)
    )
  }, [setFavorites])

  const updateAdjustments = useCallback((favoriteId: string, adjustments: string) => {
    setFavorites(prev =>
      prev.map(f => f.id === favoriteId ? { ...f, currentAdjustments: adjustments } : f)
    )
  }, [setFavorites])

  const isFavorite = useCallback((recipeTitle: string) => {
    return favorites.some(f => f.recipe.title === recipeTitle)
  }, [favorites])

  return { favorites, saveFavorite, removeFavorite, addFeedback, updateUserPhoto, updateAdjustments, isFavorite }
}
