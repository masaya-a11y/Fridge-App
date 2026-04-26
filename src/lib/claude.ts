import Anthropic from '@anthropic-ai/sdk'
import type { Ingredient, Recipe, CuisineType, UserSettings } from '../types'
import { format, parseISO } from 'date-fns'

let client: Anthropic | null = null

export function initClaude(apiKey: string) {
  client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export function getClient(): Anthropic | null {
  return client
}

const cuisineLabels: Record<CuisineType, string> = {
  japanese: '和食',
  western:  '洋食',
  chinese:  '中華',
  korean:   '韓国料理',
  italian:  'イタリアン',
  any:      'ジャンル問わず',
}

export async function generateRecipes(
  ingredients: Ingredient[],
  cuisine: CuisineType,
  count: number,
  settings: UserSettings,
  onStream?: (text: string) => void
): Promise<Recipe[]> {
  if (!client) throw new Error('Claude APIキーが設定されていません')

  const ingredientList = ingredients
    .map(i => `・${i.name}（${i.quantity}${i.unit}、期限: ${format(parseISO(i.expirationDate), 'M月d日')}）`)
    .join('\n')

  const prompt = `あなたは料理の専門家です。以下の食材を使ったレシピを${count}つ提案してください。

## 使用可能な食材
${ingredientList}

## ユーザーの好み
- 味の好み: ${settings.tastePreference || '特になし'}
- 辛さ: ${settings.spiceLevel === 'mild' ? 'マイルド' : settings.spiceLevel === 'medium' ? '普通' : '辛め'}
- 料理スキル: ${settings.cookingSkill === 'beginner' ? '初心者' : settings.cookingSkill === 'intermediate' ? '中級者' : '上級者'}
- 避けたい食材: ${settings.avoidIngredients || 'なし'}
- 人数: ${settings.defaultServings}人分

## 料理ジャンル
${cuisineLabels[cuisine]}

## 出力形式
以下のJSON形式で出力してください。JSONのみ出力し、前後のテキストは不要です：

[
  {
    "title": "料理名",
    "description": "料理の簡単な説明（1〜2文）",
    "cuisine": "${cuisine}",
    "servings": ${settings.defaultServings},
    "prepTime": 15,
    "cookTime": 20,
    "ingredients": [
      {
        "ingredientId": "使用する食材のID（食材一覧から）",
        "ingredientName": "食材名",
        "amount": 100,
        "unit": "g"
      }
    ],
    "steps": [
      "手順1",
      "手順2"
    ],
    "tips": "コツやポイント（任意）",
    "usedIngredientIds": ["使用した食材IDのリスト"],
    "imagePrompt": "この料理の写真を生成するためのプロンプト（英語で）"
  }
]

食材のIDリスト:
${ingredients.map(i => `- ${i.name}: "${i.id}"`).join('\n')}

注意:
- 賞味期限が近い食材を優先的に使ってください
- 各レシピは明確に異なる料理にしてください
- 手順は具体的かつ分かりやすく書いてください`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  let fullText = ''
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text
      onStream?.(fullText)
    }
  }

  const jsonMatch = fullText.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('レシピの解析に失敗しました')

  const recipes = JSON.parse(jsonMatch[0]) as Omit<Recipe, 'id' | 'createdAt'>[]
  return recipes.map(r => ({
    ...r,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }))
}

export async function refineRecipe(
  recipe: Recipe,
  feedback: string,
  settings: UserSettings,
  onStream?: (text: string) => void
): Promise<{ adjustedRecipe: Recipe; responseMessage: string }> {
  if (!client) throw new Error('Claude APIキーが設定されていません')

  const prompt = `以下のレシピに対してユーザーからフィードバックがあります。フィードバックを反映してレシピを修正し、ユーザーへのメッセージと一緒に返してください。

## 元のレシピ
タイトル: ${recipe.title}
材料: ${recipe.ingredients.map(i => `${i.ingredientName} ${i.amount}${i.unit}`).join('、')}
手順: ${recipe.steps.join(' → ')}

## ユーザーの好み
- 味の好み: ${settings.tastePreference || '特になし'}

## フィードバック
${feedback}

## 出力形式
以下のJSON形式で出力（JSONのみ）：
{
  "responseMessage": "フィードバックへの返答（日本語・親しみやすく）",
  "adjustedRecipe": {
    "title": "料理名",
    "description": "説明",
    "steps": ["手順1", "手順2"],
    "tips": "コツ"
  }
}`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  let fullText = ''
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text
      onStream?.(fullText)
    }
  }

  const jsonMatch = fullText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('解析に失敗しました')

  const result = JSON.parse(jsonMatch[0])
  const adjustedRecipe: Recipe = {
    ...recipe,
    ...result.adjustedRecipe,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  return { adjustedRecipe, responseMessage: result.responseMessage }
}

export async function suggestCuisines(
  ingredients: Ingredient[],
  onStream?: (text: string) => void
): Promise<{ cuisine: CuisineType; reason: string; dishes: string[] }[]> {
  if (!client) throw new Error('Claude APIキーが設定されていません')

  const urgentIngredients = ingredients.slice(0, 5)
  const ingredientList = urgentIngredients.map(i => i.name).join('、')

  const prompt = `以下の食材（賞味期限が近い順）を使って作れる料理のジャンルを3つ提案してください。

食材: ${ingredientList}

JSON形式で出力（JSONのみ）：
[
  {
    "cuisine": "japanese",
    "reason": "このジャンルを勧める理由",
    "dishes": ["料理例1", "料理例2", "料理例3"]
  }
]

cuisineの値は japanese/western/chinese/korean/italian/any のいずれか。`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  let fullText = ''
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text
      onStream?.(fullText)
    }
  }

  const jsonMatch = fullText.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []
  return JSON.parse(jsonMatch[0])
}
