import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import type { ExpirationStatus, UserSettings } from '../types'

export function getDaysUntilExpiration(expirationDate: string): number {
  const today = startOfDay(new Date())
  const expDate = startOfDay(parseISO(expirationDate))
  return differenceInDays(expDate, today)
}

export function getExpirationStatus(
  expirationDate: string,
  alertDays: UserSettings['alertDays']
): ExpirationStatus {
  const days = getDaysUntilExpiration(expirationDate)
  if (days < 0) return 'expired'
  if (days <= alertDays.critical) return 'critical'
  if (days <= alertDays.warning) return 'warning'
  if (days <= alertDays.soon) return 'soon'
  return 'ok'
}

export function getStatusColor(status: ExpirationStatus): string {
  switch (status) {
    case 'expired':  return 'bg-gray-400 text-white'
    case 'critical': return 'bg-red-500 text-white'
    case 'warning':  return 'bg-orange-400 text-white'
    case 'soon':     return 'bg-yellow-400 text-gray-900'
    case 'ok':       return 'bg-green-400 text-white'
  }
}

export function getStatusBorderColor(status: ExpirationStatus): string {
  switch (status) {
    case 'expired':  return 'border-gray-300'
    case 'critical': return 'border-red-300'
    case 'warning':  return 'border-orange-300'
    case 'soon':     return 'border-yellow-300'
    case 'ok':       return 'border-green-200'
  }
}

export function getStatusBgColor(status: ExpirationStatus): string {
  switch (status) {
    case 'expired':  return 'bg-gray-50'
    case 'critical': return 'bg-red-50'
    case 'warning':  return 'bg-orange-50'
    case 'soon':     return 'bg-yellow-50'
    case 'ok':       return 'bg-white'
  }
}

export function getStatusLabel(status: ExpirationStatus): string {
  switch (status) {
    case 'expired':  return '期限切れ'
    case 'critical': return '今すぐ使って'
    case 'warning':  return 'もうすぐ期限'
    case 'soon':     return '期限が近い'
    case 'ok':       return '新鮮'
  }
}

export function formatDaysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}日超過`
  if (days === 0) return '今日まで'
  if (days === 1) return '残り1日'
  return `残り${days}日`
}
