import { useState } from 'react'
import { Check, Eye, EyeOff, Info } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { initClaude } from '../lib/claude'
import type { CuisineType } from '../types'

const CUISINE_OPTIONS: { value: CuisineType; label: string; emoji: string }[] = [
  { value: 'japanese', label: '和食',       emoji: '🍱' },
  { value: 'western',  label: '洋食',       emoji: '🍽️' },
  { value: 'chinese',  label: '中華',       emoji: '🥢' },
  { value: 'korean',   label: '韓国料理',   emoji: '🫙' },
  { value: 'italian',  label: 'イタリアン', emoji: '🍝' },
]

export function Settings() {
  const { settings, updateSettings } = useSettings()
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(localSettings)
    if (localSettings.apiKey) initClaude(localSettings.apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleCuisine = (cuisine: CuisineType) => {
    setLocalSettings(prev => ({
      ...prev,
      preferredCuisines: prev.preferredCuisines.includes(cuisine)
        ? prev.preferredCuisines.filter(c => c !== cuisine)
        : [...prev.preferredCuisines, cuisine],
    }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">設定</h2>
        <p className="text-sm text-gray-500">アプリの設定とAPIキーを管理</p>
      </div>

      {/* API Key */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700">Claude API設定</h3>
          <div className="group relative">
            <Info size={14} className="text-gray-400 cursor-help" />
            <div className="hidden group-hover:block absolute left-0 top-5 z-10 bg-gray-800 text-white text-xs rounded-lg p-2 w-56">
              Anthropic Console でAPIキーを取得してください。レシピ生成に使用します。
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={localSettings.apiKey}
            onChange={e => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="sk-ant-..."
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-sky-400 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {!localSettings.apiKey && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
            ⚠️ APIキーを設定するとAIレシピ提案機能が使えます
          </p>
        )}
      </div>

      {/* Taste preference */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-700">味の好み</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">フリーテキストで入力</label>
          <textarea
            value={localSettings.tastePreference}
            onChange={e => setLocalSettings(prev => ({ ...prev, tastePreference: e.target.value }))}
            placeholder="例：濃い味が好き、甘辛が好き、あっさりが好き..."
            rows={2}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2">辛さ</label>
          <div className="flex gap-2">
            {(['mild', 'medium', 'spicy'] as const).map((level, i) => (
              <button
                key={level}
                onClick={() => setLocalSettings(prev => ({ ...prev, spiceLevel: level }))}
                className={`flex-1 py-2 rounded-xl border-2 text-sm transition-colors ${
                  localSettings.spiceLevel === level
                    ? 'border-sky-400 bg-sky-50 text-sky-700 font-medium'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {['マイルド', '普通', '辛め'][i]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cooking settings */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-700">料理設定</h3>
        <div>
          <label className="block text-xs text-gray-500 mb-1">デフォルト人数</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setLocalSettings(prev => ({ ...prev, defaultServings: n }))}
                className={`flex-1 py-2 rounded-xl border-2 text-sm transition-colors ${
                  localSettings.defaultServings === n
                    ? 'border-sky-400 bg-sky-50 text-sky-700 font-medium'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {n}人
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2">料理スキル</label>
          <div className="flex gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((skill, i) => (
              <button
                key={skill}
                onClick={() => setLocalSettings(prev => ({ ...prev, cookingSkill: skill }))}
                className={`flex-1 py-2 rounded-xl border-2 text-sm transition-colors ${
                  localSettings.cookingSkill === skill
                    ? 'border-sky-400 bg-sky-50 text-sky-700 font-medium'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {['初心者', '中級', '上級'][i]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert days */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-700">賞味期限アラート設定</h3>
        {([
          ['critical', '🔴 赤アラート（今すぐ使って）'],
          ['warning',  '🟠 オレンジアラート（もうすぐ期限）'],
          ['soon',     '🟡 黄色アラート（期限が近い）'],
        ] as const).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm text-gray-600">{label}</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={30}
                value={localSettings.alertDays[key]}
                onChange={e => setLocalSettings(prev => ({
                  ...prev,
                  alertDays: { ...prev.alertDays, [key]: Number(e.target.value) },
                }))}
                className="w-14 text-center border-2 border-gray-200 rounded-lg py-1 text-sm focus:outline-none focus:border-sky-400"
              />
              <span className="text-xs text-gray-500">日前</span>
            </div>
          </div>
        ))}
      </div>

      {/* Preferred cuisines */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-700">好きなジャンル</h3>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => toggleCuisine(value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm transition-colors ${
                localSettings.preferredCuisines.includes(value)
                  ? 'border-sky-400 bg-sky-50 text-sky-700'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Avoid ingredients */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-700">避けたい食材・アレルギー</h3>
        <input
          type="text"
          value={localSettings.avoidIngredients}
          onChange={e => setLocalSettings(prev => ({ ...prev, avoidIngredients: e.target.value }))}
          placeholder="例：えび、落花生、乳製品..."
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400"
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-bold text-white shadow-md transition-all ${
          saved
            ? 'bg-emerald-500'
            : 'bg-sky-500 hover:bg-sky-600 active:scale-95'
        }`}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={20} />
            保存しました！
          </span>
        ) : (
          '設定を保存'
        )}
      </button>
    </div>
  )
}
