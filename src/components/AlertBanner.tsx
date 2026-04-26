import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import type { Ingredient, UserSettings } from '../types'
import { getExpirationStatus, getDaysUntilExpiration, formatDaysLabel } from '../utils/expiration'

interface Props {
  ingredients: Ingredient[]
  settings: UserSettings
}

export function AlertBanner({ ingredients, settings }: Props) {
  const [dismissed, setDismissed] = useState(false)

  const urgentItems = ingredients
    .filter(i => {
      const status = getExpirationStatus(i.expirationDate, settings.alertDays)
      return status === 'expired' || status === 'critical' || status === 'warning'
    })
    .sort((a, b) => getDaysUntilExpiration(a.expirationDate) - getDaysUntilExpiration(b.expirationDate))

  if (urgentItems.length === 0 || dismissed) return null

  const hasExpired = urgentItems.some(i => getDaysUntilExpiration(i.expirationDate) < 0)
  const hasCritical = urgentItems.some(i => {
    const d = getDaysUntilExpiration(i.expirationDate)
    return d >= 0 && d <= settings.alertDays.critical
  })

  const bgColor = hasExpired ? 'bg-red-500' : hasCritical ? 'bg-orange-400' : 'bg-yellow-400'
  const textColor = hasExpired || hasCritical ? 'text-white' : 'text-yellow-900'

  return (
    <div className={`${bgColor} ${textColor} rounded-2xl p-3 mb-4 flex items-start gap-2`}>
      <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">
          {urgentItems.length}個の食材に注意が必要です
        </p>
        <div className="mt-1 space-y-0.5">
          {urgentItems.slice(0, 3).map(item => (
            <p key={item.id} className="text-xs opacity-90">
              {item.name} — {formatDaysLabel(getDaysUntilExpiration(item.expirationDate))}
            </p>
          ))}
          {urgentItems.length > 3 && (
            <p className="text-xs opacity-80">+{urgentItems.length - 3}個</p>
          )}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="opacity-70 hover:opacity-100 transition-opacity"
        aria-label="閉じる"
      >
        <X size={16} />
      </button>
    </div>
  )
}
