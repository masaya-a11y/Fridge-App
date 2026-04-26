import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Ingredient } from '../types'

const STORAGE_KEY = 'fridge-ingredients'

export function useIngredients() {
  const [ingredients, setIngredients] = useLocalStorage<Ingredient[]>(STORAGE_KEY, [])

  const addIngredient = useCallback((ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    setIngredients(prev => [
      ...prev,
      { ...ingredient, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
    ])
  }, [setIngredients])

  const updateIngredient = useCallback((id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev =>
      prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i)
    )
  }, [setIngredients])

  const updateQuantity = useCallback((id: string, delta: number) => {
    setIngredients(prev =>
      prev.map(i => {
        if (i.id !== id) return i
        const newQty = Math.max(0, i.quantity + delta)
        return { ...i, quantity: newQty, updatedAt: new Date().toISOString() }
      }).filter(i => i.quantity > 0)
    )
  }, [setIngredients])

  const removeIngredient = useCallback((id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }, [setIngredients])

  const consumeIngredients = useCallback((usages: { ingredientId: string; amount: number }[]) => {
    setIngredients(prev =>
      prev
        .map(ingredient => {
          const usage = usages.find(u => u.ingredientId === ingredient.id)
          if (!usage) return ingredient
          const newQty = Math.max(0, ingredient.quantity - usage.amount)
          return { ...ingredient, quantity: newQty, updatedAt: new Date().toISOString() }
        })
        .filter(i => i.quantity > 0)
    )
  }, [setIngredients])

  return { ingredients, addIngredient, updateIngredient, updateQuantity, removeIngredient, consumeIngredients }
}
