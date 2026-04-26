import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { initClaude } from '../lib/claude'
import type { UserSettings } from '../types'

const defaultSettings: UserSettings = {
  tastePreference: '',
  spiceLevel: 'medium',
  defaultServings: 2,
  alertDays: {
    expired: 0,
    critical: 1,
    warning: 3,
    soon: 7,
  },
  preferredCuisines: [],
  avoidIngredients: '',
  cookingSkill: 'intermediate',
  apiKey: '',
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('fridge-settings', defaultSettings)

  useEffect(() => {
    if (settings.apiKey) {
      initClaude(settings.apiKey)
    }
  }, [settings.apiKey])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [setSettings])

  return { settings, updateSettings }
}
