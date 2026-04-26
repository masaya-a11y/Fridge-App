import { useState } from 'react'
import { Trash2, ChevronUp, ChevronDown, Info } from 'lucide-react'
import type { Ingredient, UserSettings } from '../types'
import {
  getExpirationStatus,
  getStatusColor,
  getStatusBorderColor,
  getStatusBgColor,
  getStatusLabel,
  formatDaysLabel,
  getDaysUntilExpiration,
} from '../utils/expiration'
import { categoryEmojis } from '../utils/defaultExpiration'
import { format, parseISO } from 'date-fns'

interface Props {
  ingredient: Ingredient
  settings: UserSettings
  onQuantityChange: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onEdit?: (ingredient: Ingredient) => void
}

export function IngredientCard({ ingredient, settings, onQuantityChange, onRemove }: Props) {
  const [showDetail, setShowDetail] = useState(false)
  const status = getExpirationStatus(ingredient.expirationDate, settings.alertDays)
  const days = getDaysUntilExpiration(ingredient.expirationDate)
  const borderColor = getStatusBorderColor(status)
  const bgColor = getStatusBgColor(status)
  const emoji = categoryEmojis[ingredient.category]

  return (
    <div className={`rounded-2xl border-2 ${borderColor} ${bgColor} p-4 shadow-sm transition-all`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl pt-0.5">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-800 truncate">{ingredient.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">
              {format(parseISO(ingredient.expirationDate), 'M/d')} まで
            </span>
            <span className={`text-xs font-medium ${
              days < 0 ? 'text-gray-500' :
              days <= 1 ? 'text-red-600' :
              days <= 3 ? 'text-orange-500' :
              days <= 7 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              ({formatDaysLabel(days)})
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        {/* Quantity control */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-2 py-1 shadow-sm">
          <button
            onClick={() => onQuantityChange(ingredient.id, -1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
            aria-label="減らす"
          >
            <ChevronDown size={16} />
          </button>
          <span className="w-16 text-center font-semibold text-gray-700 text-sm">
            {ingredient.quantity}{ingredient.unit}
          </span>
          <button
            onClick={() => onQuantityChange(ingredient.id, 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-400 hover:text-green-600 transition-colors"
            aria-label="増やす"
          >
            <ChevronUp size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="詳細"
          >
            <Info size={16} />
          </button>
          <button
            onClick={() => onRemove(ingredient.id)}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
            aria-label="削除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showDetail && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
          <p><span className="font-medium">保存方法:</span> {ingredient.storageMethod}</p>
          {ingredient.notes && <p><span className="font-medium">メモ:</span> {ingredient.notes}</p>}
        </div>
      )}
    </div>
  )
}
