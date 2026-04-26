import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown } from 'lucide-react'
import { useIngredients } from '../hooks/useIngredients'
import { QuantitySlider } from '../components/QuantitySlider'
import {
  categoryLabels,
  categoryEmojis,
  getDefaultExpiration,
  getDefaultUnit,
  unitOptions,
} from '../utils/defaultExpiration'
import type { IngredientCategory } from '../types'
import { format } from 'date-fns'

const ALL_CATEGORIES = Object.keys(categoryLabels) as IngredientCategory[]

export function AddIngredient() {
  const { addIngredient } = useIngredients()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<IngredientCategory>('vegetable')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('個')
  const [expirationDate, setExpirationDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [storageMethod, setStorageMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [useDefaultExpiry, setUseDefaultExpiry] = useState(false)
  const [showUnitPicker, setShowUnitPicker] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleCategoryChange = (cat: IngredientCategory) => {
    setCategory(cat)
    setUnit(getDefaultUnit(cat))
    if (useDefaultExpiry || name) {
      const defaults = getDefaultExpiration(name, cat)
      setExpirationDate(defaults.date)
      setStorageMethod(defaults.storageMethod)
    }
  }

  const handleNameBlur = () => {
    const defaults = getDefaultExpiration(name, category)
    if (!storageMethod) setStorageMethod(defaults.storageMethod)
    if (useDefaultExpiry) setExpirationDate(defaults.date)
  }

  const handleDefaultExpiry = (checked: boolean) => {
    setUseDefaultExpiry(checked)
    if (checked) {
      const defaults = getDefaultExpiration(name, category)
      setExpirationDate(defaults.date)
      setStorageMethod(defaults.storageMethod)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addIngredient({ name: name.trim(), category, quantity, unit, expirationDate, storageMethod, notes })
    setSubmitted(true)
    setTimeout(() => {
      navigate('/')
    }, 800)
  }

  const isValid = name.trim() && quantity > 0 && expirationDate

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">食材を追加</h2>
        <p className="text-sm text-gray-500">冷蔵庫の食材を登録しましょう</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            食材名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="例：鶏もも肉、キャベツ..."
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors"
            required
          />
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">カテゴリ</label>
          <div className="grid grid-cols-5 gap-2">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs ${
                  category === cat
                    ? 'border-sky-400 bg-sky-50 text-sky-700'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                }`}
              >
                <span className="text-lg">{categoryEmojis[cat]}</span>
                <span className="leading-tight text-center">{categoryLabels[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity & Unit */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">数量</label>
          <QuantitySlider
            value={quantity}
            min={0.1}
            max={category === 'meat' || category === 'seafood' ? 2000 : 100}
            step={category === 'meat' || category === 'seafood' ? 50 : 1}
            unit={unit}
            onChange={setQuantity}
          />
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">単位</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUnitPicker(!showUnitPicker)}
                className="w-full flex items-center justify-between border-2 border-gray-200 rounded-xl px-3 py-2 text-sm hover:border-sky-300 transition-colors"
              >
                <span>{unit}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showUnitPicker && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-4 gap-1 max-h-40 overflow-y-auto">
                  {unitOptions.map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => { setUnit(u); setShowUnitPicker(false) }}
                      className={`text-sm py-1.5 px-2 rounded-lg transition-colors ${
                        unit === u ? 'bg-sky-100 text-sky-700' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expiration Date */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            賞味期限 / 消費期限
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="defaultExpiry"
              checked={useDefaultExpiry}
              onChange={e => handleDefaultExpiry(e.target.checked)}
              className="rounded accent-sky-500"
            />
            <label htmlFor="defaultExpiry" className="text-sm text-gray-600">
              一般的な期限を自動設定する
            </label>
          </div>
          <input
            type="date"
            value={expirationDate}
            onChange={e => setExpirationDate(e.target.value)}
            disabled={useDefaultExpiry}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 disabled:opacity-60 disabled:bg-gray-50 transition-colors"
          />
        </div>

        {/* Storage Method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">保存方法</label>
          <textarea
            value={storageMethod}
            onChange={e => setStorageMethod(e.target.value)}
            placeholder="例：冷蔵保存（0〜4℃）、育った向きに立てて..."
            rows={2}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 resize-none transition-colors"
          />
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">メモ（任意）</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="購入場所、ブランドなど..."
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || submitted}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-md transition-all ${
            submitted
              ? 'bg-emerald-500'
              : isValid
              ? 'bg-sky-500 hover:bg-sky-600 active:scale-95'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {submitted ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={20} />
              登録しました！
            </span>
          ) : (
            '食材を登録する'
          )}
        </button>
      </form>
    </div>
  )
}
