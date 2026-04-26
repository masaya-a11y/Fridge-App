export type IngredientCategory =
  | 'meat'
  | 'seafood'
  | 'vegetable'
  | 'fruit'
  | 'dairy'
  | 'grain'
  | 'condiment'
  | 'beverage'
  | 'frozen'
  | 'other'

export type CuisineType = 'japanese' | 'western' | 'chinese' | 'korean' | 'italian' | 'any'

export type ExpirationStatus = 'expired' | 'critical' | 'warning' | 'soon' | 'ok'

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  expirationDate: string // YYYY-MM-DD
  storageMethod: string
  category: IngredientCategory
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface RecipeIngredientUsage {
  ingredientId: string
  ingredientName: string
  amount: number
  unit: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  cuisine: CuisineType
  servings: number
  prepTime: number
  cookTime: number
  ingredients: RecipeIngredientUsage[]
  steps: string[]
  tips?: string
  usedIngredientIds: string[]
  imagePrompt?: string
  createdAt: string
}

export interface Feedback {
  id: string
  comment: string
  adjustments: string
  rating: number
  createdAt: string
}

export interface FavoriteRecipe {
  id: string
  recipe: Recipe
  feedbacks: Feedback[]
  userPhotoUrl?: string
  savedAt: string
  currentAdjustments?: string
}

export interface UserSettings {
  tastePreference: string
  spiceLevel: 'mild' | 'medium' | 'spicy'
  defaultServings: number
  alertDays: {
    expired: number   // 0: already expired
    critical: number  // days for red alert
    warning: number   // days for orange alert
    soon: number      // days for yellow alert
  }
  preferredCuisines: CuisineType[]
  avoidIngredients: string
  cookingSkill: 'beginner' | 'intermediate' | 'advanced'
  apiKey: string
}

export interface RecipeSession {
  id: string
  selectedIngredientIds: string[]
  selectedCuisine: CuisineType
  recipeCount: number
  recipes: Recipe[]
  feedbackHistory: { recipeId: string; feedback: string; response: string }[]
  createdAt: string
}
