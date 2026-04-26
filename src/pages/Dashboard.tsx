import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, ChefHat, RefrigeratorIcon } from 'lucide-react'
import { useIngredients } from '../hooks/useIngredients'
import { useSettings } from '../hooks/useSettings'
import { IngredientCard } from '../components/IngredientCard'
import { AlertBanner } from '../components/AlertBanner'
import { getExpirationStatus, getDaysUntilExpiration } from '../utils/expiration'
import { categoryLabels, categoryEmojis } from '../utils/defaultExpiration'
import type { IngredientCategory } from '../types'

const ALL_CATEGORIES = Object.keys(categoryLabels) as IngredientCategory[]

type SortMode = 'expiration' | 'name' | 'category'

export function Dashboard() {
  const { ingredients, updateQuantity, removeIngredient } = useIngredients()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<IngredientCategory | 'all'>('all')
  const [sortMode, setSortMode] = useState<SortMode>('expiration')
  const [showFilter, setShowFilter] = useState(false)

  const filtered = useMemo(() => {
    return ingredients
      .filter(i => {
        const matchSearch = i.name.includes(search)
        const matchCat = filterCategory === 'all' || i.category === filterCategory
        return matchSearch && matchCat
      })
      .sort((a, b) => {
        if (sortMode === 'expiration') {
          return getDaysUntilExpiration(a.expirationDate) - getDaysUntilExpiration(b.expirationDate)
        }
        if (sortMode === 'name') return a.name.localeCompare(b.name, 'ja')
        return a.category.localeCompare(b.category)
      })
  }, [ingredients, search, filterCategory, sortMode])

  const statusCounts = useMemo(() => {
    const counts = { expired: 0, critical: 0, warning: 0, soon: 0, ok: 0 }
    ingredients.forEach(i => {
      const s = getExpirationStatus(i.expirationDate, settings.alertDays)
      counts[s]++
    })
    return counts
  }, [ingredients, settings])

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-4">🧊</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">冷蔵庫は空です</h2>
        <p className="text-gray-500 text-sm mb-6">食材を登録して、賞味期限を管理しましょう</p>
        <button
          onClick={() => navigate('/add')}
          className="bg-sky-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-md hover:bg-sky-600 transition-colors"
        >
          最初の食材を追加
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AlertBanner ingredients={ingredients} settings={settings} />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '期限切れ', count: statusCounts.expired, color: 'bg-gray-100 text-gray-500' },
          { label: '今すぐ使って', count: statusCounts.critical, color: 'bg-red-50 text-red-500' },
          { label: '期限近し', count: statusCounts.warning + statusCounts.soon, color: 'bg-orange-50 text-orange-500' },
          { label: '新鮮', count: statusCounts.ok, color: 'bg-green-50 text-green-600' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`${color} rounded-xl p-2 text-center`}>
            <p className="text-lg font-bold">{count}</p>
            <p className="text-xs leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="食材を検索..."
              className="flex-1 text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2.5 rounded-xl border shadow-sm transition-colors ${
              showFilter ? 'bg-sky-100 border-sky-300 text-sky-600' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {showFilter && (
          <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-3 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">並び替え</p>
              <div className="flex gap-2 flex-wrap">
                {([['expiration', '期限順'], ['name', '名前順'], ['category', 'カテゴリ順']] as [SortMode, string][]).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      sortMode === mode
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">カテゴリ絞り込み</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  すべて
                </button>
                {ALL_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      filterCategory === cat
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {categoryEmojis[cat]} {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipe suggestion shortcut */}
      {(statusCounts.expired > 0 || statusCounts.critical > 0 || statusCounts.warning > 0) && (
        <button
          onClick={() => navigate('/recipe')}
          className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all"
        >
          <ChefHat size={24} />
          <div className="text-left">
            <p className="font-bold text-sm">期限が近い食材でレシピを提案</p>
            <p className="text-xs text-white/80">AIが最適な料理を提案します</p>
          </div>
          <span className="ml-auto text-2xl">→</span>
        </button>
      )}

      {/* Ingredient list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <RefrigeratorIcon size={18} className="text-sky-500" />
            食材一覧
            <span className="text-xs text-gray-400 font-normal">({filtered.length}件)</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            該当する食材がありません
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ingredient => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                settings={settings}
                onQuantityChange={updateQuantity}
                onRemove={removeIngredient}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
