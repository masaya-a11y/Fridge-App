import { useState } from 'react'
import { Clock, Users, Heart, ChevronDown, ChevronUp, Star, MessageCircle } from 'lucide-react'
import type { Recipe } from '../types'

const cuisineLabels: Record<string, string> = {
  japanese: '🍱 和食',
  western:  '🍽️ 洋食',
  chinese:  '🥢 中華',
  korean:   '🫙 韓国',
  italian:  '🍝 イタリアン',
  any:      '🌍 その他',
}

interface Props {
  recipe: Recipe
  isFavorite?: boolean
  onSaveFavorite?: (recipe: Recipe) => void
  onFeedback?: (recipe: Recipe, feedback: string) => void
  onConsume?: (recipe: Recipe) => void
  feedbackResponse?: string
}

export function RecipeCard({ recipe, isFavorite, onSaveFavorite, onFeedback, onConsume, feedbackResponse }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return
    onFeedback?.(recipe, feedbackText)
    setFeedbackText('')
    setShowFeedback(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
              {cuisineLabels[recipe.cuisine] || recipe.cuisine}
            </span>
            <h3 className="text-lg font-bold mt-1 leading-tight">{recipe.title}</h3>
            <p className="text-sm text-white/80 mt-0.5 line-clamp-2">{recipe.description}</p>
          </div>
          {onSaveFavorite && (
            <button
              onClick={() => onSaveFavorite(recipe)}
              className={`flex-shrink-0 p-2 rounded-xl transition-colors ${
                isFavorite
                  ? 'bg-red-400 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              aria-label={isFavorite ? 'お気に入り解除' : 'お気に入り追加'}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div className="flex gap-4 mt-3 text-sm text-white/90">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            準備 {recipe.prepTime}分 / 調理 {recipe.cookTime}分
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            {recipe.servings}人分
          </span>
        </div>
      </div>

      {/* Ingredients preview */}
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">使用食材</p>
        <div className="flex flex-wrap gap-1.5">
          {recipe.ingredients.map((ing, i) => (
            <span
              key={i}
              className="text-xs bg-sky-50 text-sky-700 border border-sky-100 rounded-full px-2 py-0.5"
            >
              {ing.ingredientName} {ing.amount}{ing.unit}
            </span>
          ))}
        </div>

        {/* Toggle detail */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
        >
          {expanded ? (
            <><ChevronUp size={16} /> 手順を閉じる</>
          ) : (
            <><ChevronDown size={16} /> 手順を見る</>
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">調理手順</p>
            <ol className="space-y-2">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {recipe.tips && (
              <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 mb-1">💡 コツ</p>
                <p className="text-sm text-amber-800">{recipe.tips}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        {onConsume && (
          <button
            onClick={() => onConsume(recipe)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            この料理を作った
          </button>
        )}
        {onFeedback && (
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <MessageCircle size={15} />
            フィードバック
          </button>
        )}
      </div>

      {showFeedback && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">
              料理の感想・改善点を教えてください
            </p>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="例：もう少し辛くしたい、塩分を控えめに..."
              className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedbackText.trim()}
              className="mt-2 w-full bg-sky-500 disabled:opacity-50 text-white text-sm py-1.5 rounded-lg transition-colors hover:bg-sky-600"
            >
              送信してレシピを改善
            </button>
          </div>
        </div>
      )}

      {feedbackResponse && (
        <div className="mx-4 mb-4 p-3 bg-sky-50 rounded-xl border border-sky-100">
          <div className="flex items-center gap-1 mb-1">
            <Star size={14} className="text-sky-500" />
            <span className="text-xs font-semibold text-sky-700">AIからの返答</span>
          </div>
          <p className="text-sm text-gray-700">{feedbackResponse}</p>
        </div>
      )}
    </div>
  )
}
