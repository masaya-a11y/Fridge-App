import { addDays, format } from 'date-fns'
import type { IngredientCategory } from '../types'

interface DefaultExpirationInfo {
  days: number
  storageMethod: string
  unit: string
}

const defaultsByCategory: Record<IngredientCategory, DefaultExpirationInfo> = {
  meat:      { days: 3,   storageMethod: '冷蔵保存（0〜4℃）。密閉容器に入れて保存。',     unit: 'g'  },
  seafood:   { days: 2,   storageMethod: '冷蔵保存（0〜4℃）。密閉容器に入れて保存。',     unit: 'g'  },
  vegetable: { days: 5,   storageMethod: '冷蔵野菜室で保存。葉物は湿らせたキッチンペーパーで包む。', unit: '個' },
  fruit:     { days: 7,   storageMethod: '常温または冷蔵。果物によって異なる。',             unit: '個' },
  dairy:     { days: 7,   storageMethod: '冷蔵保存（5℃以下）。開封後は早めに使用。',       unit: 'ml' },
  grain:     { days: 180, storageMethod: '直射日光・高温多湿を避けて常温保存。',            unit: 'g'  },
  condiment: { days: 30,  storageMethod: '開封後は冷蔵保存。容器の蓋をしっかり閉める。',   unit: 'ml' },
  beverage:  { days: 3,   storageMethod: '冷蔵保存。開封後は早めに消費。',                  unit: 'ml' },
  frozen:    { days: 30,  storageMethod: '冷凍保存（-18℃以下）。解凍後は再冷凍しない。',   unit: 'g'  },
  other:     { days: 7,   storageMethod: '直射日光・高温多湿を避けて保存。',               unit: '個' },
}

const foodDatabase: Record<string, DefaultExpirationInfo> = {
  '鶏肉':     { days: 2,   storageMethod: '冷蔵保存（0〜4℃）。密閉容器に入れ、使用日当日か翌日まで。',  unit: 'g'  },
  '豚肉':     { days: 3,   storageMethod: '冷蔵保存（0〜4℃）。ラップでしっかり包んで保存。',            unit: 'g'  },
  '牛肉':     { days: 3,   storageMethod: '冷蔵保存（0〜4℃）。ラップでしっかり包んで保存。',            unit: 'g'  },
  '卵':       { days: 25,  storageMethod: '冷蔵保存。尖った方を下にして保存。洗わずに保存。',             unit: '個' },
  '牛乳':     { days: 7,   storageMethod: '冷蔵保存（5℃以下）。開封後は3日以内に消費。',               unit: 'ml' },
  '豆腐':     { days: 3,   storageMethod: '冷蔵保存。水に浸して保存し、毎日水を交換する。',              unit: '丁' },
  'キャベツ': { days: 14,  storageMethod: '外葉で包み、芯をくり抜いて湿らせたキッチンペーパーを詰めて冷蔵。', unit: '玉' },
  'にんじん': { days: 14,  storageMethod: '冷蔵野菜室。葉付きは葉を切り落として保存。',                   unit: '本' },
  '玉ねぎ':   { days: 60,  storageMethod: '風通しの良い冷暗所で常温保存。切った後は冷蔵。',               unit: '個' },
  'にんにく': { days: 30,  storageMethod: '風通しの良い冷暗所で常温保存。バラした場合は冷蔵。',           unit: '個' },
  'じゃがいも': { days: 30, storageMethod: '冷暗所で常温保存。光に当てると毒素が発生するため注意。',       unit: '個' },
  'ほうれん草': { days: 4,  storageMethod: '冷蔵野菜室。湿らせたキッチンペーパーで包み立てて保存。',      unit: '束' },
  'トマト':   { days: 5,   storageMethod: '常温保存（熟す前）または冷蔵。ヘタを下にして保存。',            unit: '個' },
  'きゅうり': { days: 5,   storageMethod: '冷蔵野菜室。ラップに包んで立てて保存。',                       unit: '本' },
  'もやし':   { days: 2,   storageMethod: '冷蔵保存。水に浸して毎日水を交換すると長持ち。',               unit: '袋' },
  '米':       { days: 365, storageMethod: '高温多湿・直射日光を避けて密閉容器に保存。',                   unit: 'kg' },
  'バター':   { days: 14,  storageMethod: '冷蔵保存。ラップで包み密閉容器に入れて保存。',                 unit: 'g'  },
  'チーズ':   { days: 14,  storageMethod: '冷蔵保存。ラップで包み密閉容器に入れて保存。',                 unit: 'g'  },
  '魚':       { days: 2,   storageMethod: '冷蔵保存（0〜4℃）。内臓を取り除いて保存。',                   unit: 'g'  },
  'えび':     { days: 2,   storageMethod: '冷蔵保存。殻付きのまま密閉容器で保存。',                       unit: 'g'  },
}

export function getDefaultExpiration(name: string, category: IngredientCategory): { date: string; storageMethod: string; unit: string } {
  const found = Object.entries(foodDatabase).find(([key]) =>
    name.includes(key) || key.includes(name)
  )
  const info = found ? found[1] : defaultsByCategory[category]
  return {
    date: format(addDays(new Date(), info.days), 'yyyy-MM-dd'),
    storageMethod: info.storageMethod,
    unit: info.unit,
  }
}

export function getDefaultUnit(category: IngredientCategory): string {
  return defaultsByCategory[category].unit
}

export const categoryLabels: Record<IngredientCategory, string> = {
  meat:      '肉類',
  seafood:   '魚介類',
  vegetable: '野菜',
  fruit:     '果物',
  dairy:     '乳製品・卵',
  grain:     '穀物・乾物',
  condiment: '調味料',
  beverage:  '飲料',
  frozen:    '冷凍食品',
  other:     'その他',
}

export const categoryEmojis: Record<IngredientCategory, string> = {
  meat:      '🥩',
  seafood:   '🐟',
  vegetable: '🥦',
  fruit:     '🍎',
  dairy:     '🥛',
  grain:     '🌾',
  condiment: '🧂',
  beverage:  '🧃',
  frozen:    '🧊',
  other:     '📦',
}

export const unitOptions = [
  '個', '本', '枚', '束', '袋', '玉', '丁', '缶',
  'g', 'kg', 'ml', 'L',
  '杯', 'カップ', '大さじ', '小さじ',
]
