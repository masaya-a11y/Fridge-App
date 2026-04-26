import { useState, useRef } from 'react'
import { Heart, Trash2, Camera, ChevronDown, ChevronUp, Star, MessageCircle } from 'lucide-react'
import { useFavoriteRecipes } from '../hooks/useFavoriteRecipes'
import { useSettings } from '../hooks/useSettings'
import { refineRecipe } from '../lib/claude'
import { format, parseISO } from 'date-fns'
import type { FavoriteRecipe } from '../types'

const cuisineLabels: Record<string, string> = {
  japanese: '🍱 和食',
  western:  '🍽️ 洋食',
  chinese:  '🥢 中華',
  korean:   '🫙 韓国料理',
  italian:  '🍝 イタリアン',
  any:      '🌍 その他',
}

function FavoriteCard({
  favorite,
  onRemove,
  onAddFeedback,
  onUpdatePhoto,
  settings,
}: {
  favorite: FavoriteRecipe
  onRemove: (id: string) => void
  onAddFeedback: (id: string, comment: string, adjustments: string, rating: number) => void
  onUpdatePhoto: (id: string, url: string) => void
  settings: ReturnType<typeof useSettings>['settings']
}) {
  const [expanded, setExpanded] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackAdjustment, setFeedbackAdjustment] = useState('')
  const [rating, setRating] = useState(5)
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recipe = favorite.recipe

  const handleFeedbackSubmit = async () => {
    if (!feedbackComment.trim()) return
    onAddFeedback(favorite.id, feedbackComment, feedbackAdjustment, rating)
    if (settings.apiKey && feedbackAdjustment.trim()) {
      setLoading(true)
      try {
        const { responseMessage } = await refineRecipe(recipe, feedbackAdjustment, settings)
        setAiResponse(responseMessage)
      } catch {}
      finally { setLoading(false) }
    }
    setFeedbackComment('')
    setFeedbackAdjustment('')
    setShowFeedbackForm(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      if (ev.target?.result) {
        onUpdatePhoto(favorite.id, ev.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const averageRating = favorite.feedbacks.length > 0
    ? (favorite.feedbacks.reduce((s, f) => s + f.rating, 0) / favorite.feedbacks.length).toFixed(1)
    : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Photo area */}
      {favorite.userPhotoUrl ? (
        <div className="relative">
          <img src={favorite.userPhotoUrl} alt={recipe.title} className="w-full h-40 object-cover" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-black/50 text-white rounded-xl px-2 py-1 text-xs flex items-center gap-1"
          >
            <Camera size={12} />
            変更
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-24 bg-gradient-to-r from-sky-100 to-emerald-100 flex flex-col items-center justify-center gap-1 text-gray-400 hover:opacity-80 transition-opacity"
        >
          <Camera size={20} />
          <span className="text-xs">写真をアップロード</span>
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400">{cuisineLabels[recipe.cuisine]}</span>
            <h3 className="font-bold text-gray-800 mt-0.5">{recipe.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {averageRating && (
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-500">{averageRating}</span>
                </div>
              )}
              <span className="text-xs text-gray-400">
                {format(parseISO(favorite.savedAt), 'M月d日')}保存
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(favorite.id)}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{recipe.description}</p>

        {/* Toggle recipe details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-sky-600 flex items-center gap-1 hover:underline"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'レシピを閉じる' : 'レシピを見る'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">材料</p>
              <div className="flex flex-wrap gap-1">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="text-xs bg-sky-50 text-sky-700 rounded-full px-2 py-0.5 border border-sky-100">
                    {ing.ingredientName} {ing.amount}{ing.unit}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">手順</p>
              <ol className="space-y-1">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            {recipe.tips && (
              <div className="p-2 bg-amber-50 rounded-xl text-xs text-amber-800">
                💡 {recipe.tips}
              </div>
            )}
          </div>
        )}

        {/* Feedback history */}
        {favorite.feedbacks.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500">フィードバック履歴</p>
            {favorite.feedbacks.slice(-3).map(fb => (
              <div key={fb.id} className="p-2 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{format(parseISO(fb.createdAt), 'M/d')}</span>
                </div>
                <p className="text-xs text-gray-600">{fb.comment}</p>
                {fb.adjustments && <p className="text-xs text-sky-600 mt-0.5">改善: {fb.adjustments}</p>}
              </div>
            ))}
          </div>
        )}

        {aiResponse && (
          <div className="mt-2 p-3 bg-sky-50 rounded-xl border border-sky-100">
            <p className="text-xs font-semibold text-sky-700 mb-1">🤖 AIからの返答</p>
            <p className="text-sm text-gray-700">{aiResponse}</p>
          </div>
        )}

        {/* Feedback form */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className="flex items-center gap-1 text-sm text-sky-600 border border-sky-200 rounded-xl px-3 py-1.5 hover:bg-sky-50 transition-colors"
          >
            <MessageCircle size={14} />
            フィードバック
          </button>
        </div>

        {showFeedbackForm && (
          <div className="mt-3 space-y-2 bg-gray-50 rounded-xl p-3">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">評価</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(n)} className="p-1">
                    <Star size={20} className={n <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="作った感想（例：とても美味しかった！）"
              className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <textarea
              value={feedbackAdjustment}
              onChange={e => setFeedbackAdjustment(e.target.value)}
              placeholder="改善点・次回変えたいこと（AIが提案します）"
              className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedbackComment.trim() || loading}
              className="w-full bg-sky-500 disabled:opacity-50 text-white text-sm py-2 rounded-xl transition-colors hover:bg-sky-600"
            >
              {loading ? '送信中...' : '送信する'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function FavoriteRecipes() {
  const { favorites, removeFavorite, addFeedback, updateUserPhoto } = useFavoriteRecipes()
  const { settings } = useSettings()

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">❤️</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">お気に入りはまだありません</h2>
        <p className="text-sm text-gray-500">レシピページで気に入った料理をハートマークで保存しましょう</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Heart size={20} className="text-red-400 fill-current" />
          お気に入りレシピ
        </h2>
        <p className="text-sm text-gray-500">{favorites.length}件のレシピ</p>
      </div>

      <div className="space-y-4">
        {favorites.map(fav => (
          <FavoriteCard
            key={fav.id}
            favorite={fav}
            onRemove={removeFavorite}
            onAddFeedback={(id, comment, adjustments, rating) =>
              addFeedback(id, { comment, adjustments, rating })
            }
            onUpdatePhoto={updateUserPhoto}
            settings={settings}
          />
        ))}
      </div>
    </div>
  )
}
