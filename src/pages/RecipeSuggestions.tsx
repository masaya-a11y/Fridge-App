import { useState, useCallback } from 'react'
import { ChefHat, Loader2, RefreshCw, Utensils, AlertCircle } from 'lucide-react'
import { useIngredients } from '../hooks/useIngredients'
import { useSettings } from '../hooks/useSettings'
import { useFavoriteRecipes } from '../hooks/useFavoriteRecipes'
import { RecipeCard } from '../components/RecipeCard'
import { generateRecipes, suggestCuisines, refineRecipe } from '../lib/claude'
import { getExpirationStatus, getDaysUntilExpiration } from '../utils/expiration'
import { categoryEmojis } from '../utils/defaultExpiration'
import type { CuisineType, Recipe } from '../types'

const CUISINE_OPTIONS: { value: CuisineType; label: string; emoji: string }[] = [
  { value: 'japanese', label: '和食', emoji: '🍱' },
  { value: 'western',  label: '洋食', emoji: '🍽️' },
  { value: 'chinese',  label: '中華', emoji: '🥢' },
  { value: 'korean',   label: '韓国料理', emoji: '🫙' },
  { value: 'italian',  label: 'イタリアン', emoji: '🍝' },
  { value: 'any',      label: 'お任せ', emoji: '🎲' },
]

export function RecipeSuggestions() {
  const { ingredients, consumeIngredients } = useIngredients()
  const { settings } = useSettings()
  const { saveFavorite, isFavorite } = useFavoriteRecipes()

  const [step, setStep] = useState<'select' | 'cuisine' | 'count' | 'loading' | 'result'>('select')
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set())
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType>('any')
  const [recipeCount, setRecipeCount] = useState(2)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedbackResponses, setFeedbackResponses] = useState<Record<string, string>>({})
  const [suggestedCuisines, setSuggestedCuisines] = useState<{ cuisine: CuisineType; reason: string; dishes: string[] }[]>([])
  const [loadingCuisines, setLoadingCuisines] = useState(false)

  const urgentIngredients = [...ingredients].sort(
    (a, b) => getDaysUntilExpiration(a.expirationDate) - getDaysUntilExpiration(b.expirationDate)
  )

  const selectedIngredients = ingredients.filter(i => selectedIngredientIds.has(i.id))

  const toggleIngredient = (id: string) => {
    setSelectedIngredientIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleProceedToCuisine = async () => {
    setStep('cuisine')
    if (settings.apiKey && selectedIngredients.length > 0) {
      setLoadingCuisines(true)
      try {
        const suggestions = await suggestCuisines(selectedIngredients)
        setSuggestedCuisines(suggestions)
      } catch {
        // ignore cuisine suggestions error
      } finally {
        setLoadingCuisines(false)
      }
    }
  }

  const handleGenerate = useCallback(async () => {
    if (!settings.apiKey) {
      setError('設定でClaude APIキーを登録してください')
      return
    }
    setStep('loading')
    setLoading(true)
    setError('')
    try {
      const generated = await generateRecipes(selectedIngredients, selectedCuisine, recipeCount, settings)
      setRecipes(generated)
      setStep('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'レシピ生成に失敗しました')
      setStep('count')
    } finally {
      setLoading(false)
    }
  }, [selectedIngredients, selectedCuisine, recipeCount, settings])

  const handleFeedback = async (recipe: Recipe, feedback: string) => {
    if (!settings.apiKey) return
    try {
      const { adjustedRecipe, responseMessage } = await refineRecipe(recipe, feedback, settings)
      setRecipes(prev => prev.map(r => r.id === recipe.id ? adjustedRecipe : r))
      setFeedbackResponses(prev => ({ ...prev, [adjustedRecipe.id]: responseMessage }))
    } catch (e) {
      setError('フィードバック処理に失敗しました')
    }
  }

  const handleConsume = (recipe: Recipe) => {
    const usages = recipe.ingredients
      .filter(u => u.ingredientId && ingredients.find(i => i.id === u.ingredientId))
      .map(u => ({ ingredientId: u.ingredientId, amount: u.amount }))
    consumeIngredients(usages)
    alert(`「${recipe.title}」を調理しました！食材の数量を更新しました。`)
  }

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">🍳</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">食材がありません</h2>
        <p className="text-sm text-gray-500">まず冷蔵庫に食材を登録してください</p>
      </div>
    )
  }

  // Step: ingredient selection
  if (step === 'select') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">使う食材を選ぶ</h2>
          <p className="text-sm text-gray-500">期限が近い食材が上に表示されています</p>
        </div>

        <div className="space-y-2">
          {urgentIngredients.map(ing => {
            const status = getExpirationStatus(ing.expirationDate, settings.alertDays)
            const days = getDaysUntilExpiration(ing.expirationDate)
            const isSelected = selectedIngredientIds.has(ing.id)
            return (
              <button
                key={ing.id}
                onClick={() => toggleIngredient(ing.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-sky-400 bg-sky-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-sky-500 border-sky-500' : 'border-gray-300'
                }`}>
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-xl">{categoryEmojis[ing.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{ing.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      status === 'expired' ? 'bg-gray-200 text-gray-600' :
                      status === 'critical' ? 'bg-red-100 text-red-600' :
                      status === 'warning' ? 'bg-orange-100 text-orange-600' :
                      status === 'soon' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {days < 0 ? '期限切れ' : days === 0 ? '今日まで' : `残り${days}日`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{ing.quantity}{ing.unit}</p>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleProceedToCuisine}
          disabled={selectedIngredientIds.size === 0}
          className="w-full py-4 rounded-2xl font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {selectedIngredientIds.size === 0 ? '食材を選んでください' : `${selectedIngredientIds.size}個の食材でレシピを探す →`}
        </button>
      </div>
    )
  }

  // Step: cuisine selection
  if (step === 'cuisine') {
    return (
      <div className="space-y-4">
        <button onClick={() => setStep('select')} className="text-sm text-sky-600 hover:underline">← 食材選択に戻る</button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">料理ジャンルを選ぶ</h2>
          <p className="text-sm text-gray-500">どんな料理が食べたいですか？</p>
        </div>

        {loadingCuisines && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            AIがジャンルを提案中...
          </div>
        )}

        {suggestedCuisines.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-2">🤖 AIのおすすめジャンル</p>
            {suggestedCuisines.map((s, i) => {
              const opt = CUISINE_OPTIONS.find(o => o.value === s.cuisine)
              return (
                <button
                  key={i}
                  onClick={() => setSelectedCuisine(s.cuisine)}
                  className={`w-full text-left p-3 rounded-xl mb-2 transition-colors ${
                    selectedCuisine === s.cuisine
                      ? 'bg-sky-100 border border-sky-300'
                      : 'bg-white border border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="font-medium text-gray-800">{opt?.emoji} {opt?.label || s.cuisine}</p>
                  <p className="text-xs text-gray-500">{s.reason}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {s.dishes.map((d, j) => (
                      <span key={j} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{d}</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {CUISINE_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setSelectedCuisine(value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                selectedCuisine === value
                  ? 'border-sky-400 bg-sky-50 text-sky-700'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep('count')}
          className="w-full py-4 rounded-2xl font-bold text-white bg-sky-500 hover:bg-sky-600 transition-all shadow-md"
        >
          次へ →
        </button>
      </div>
    )
  }

  // Step: count selection
  if (step === 'count') {
    return (
      <div className="space-y-4">
        <button onClick={() => setStep('cuisine')} className="text-sm text-sky-600 hover:underline">← ジャンル選択に戻る</button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">レシピの数を選ぶ</h2>
          <p className="text-sm text-gray-500">最大3つ、最小1つ提案します</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setRecipeCount(n)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                recipeCount === n
                  ? 'border-sky-400 bg-sky-50 text-sky-700'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
              }`}
            >
              <span className="text-3xl font-bold">{n}</span>
              <span className="text-sm">{n === 1 ? '1種類' : `${n}種類`}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <ChefHat size={20} />
          AIでレシピを生成
        </button>
      </div>
    )
  }

  // Loading
  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="relative">
          <div className="text-6xl animate-bounce">🍳</div>
          <Loader2 size={28} className="absolute -right-2 -bottom-1 text-sky-500 animate-spin" />
        </div>
        <div>
          <p className="font-bold text-gray-700 text-lg">レシピを考え中...</p>
          <p className="text-sm text-gray-400 mt-1">AIが最適な料理を選んでいます</p>
        </div>
      </div>
    )
  }

  // Results
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">提案レシピ</h2>
          <p className="text-sm text-gray-500">{recipes.length}種類のレシピを提案しました</p>
        </div>
        <button
          onClick={() => { setStep('select'); setRecipes([]); setFeedbackResponses({}) }}
          className="flex items-center gap-1 text-sm text-sky-600 hover:underline"
        >
          <RefreshCw size={14} />
          最初から
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavorite={isFavorite(recipe.title)}
            onSaveFavorite={saveFavorite}
            onFeedback={handleFeedback}
            onConsume={handleConsume}
            feedbackResponse={feedbackResponses[recipe.id]}
          />
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-2xl border-2 border-sky-300 text-sky-600 font-medium hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Utensils size={16} />}
        別のレシピを生成
      </button>
    </div>
  )
}
