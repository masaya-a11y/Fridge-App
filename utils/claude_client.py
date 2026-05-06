import json
import re
import uuid
from datetime import datetime

import anthropic

CUISINE_LABELS = {
    "japanese": "和食", "western": "洋食", "chinese": "中華",
    "korean": "韓国料理", "italian": "イタリアン", "any": "ジャンル問わず",
}


def _build_client(api_key: str) -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=api_key)


def generate_recipes(ingredients: list, cuisine: str, count: int, settings: dict, api_key: str):
    """ストリーミングでレシピを生成。テキストを yield し、最後に '__JSON__<json>' を yield する。"""
    client = _build_client(api_key)

    ing_list = "\n".join(
        f"・{i['name']}（{i['quantity']}{i['unit']}）" for i in ingredients
    )
    spice = {"mild": "マイルド", "medium": "普通", "spicy": "辛め"}.get(settings.get("spiceLevel", "medium"), "普通")
    skill = {"beginner": "初心者", "intermediate": "中級者", "advanced": "上級者"}.get(settings.get("cookingSkill", "intermediate"), "中級者")

    prompt = f"""あなたは料理の専門家です。以下の食材を使ったレシピを{count}つ提案してください。

## 使用可能な食材
{ing_list}

## ユーザーの好み
- 味の好み: {settings.get('tastePreference') or '特になし'}
- 辛さ: {spice}
- 料理スキル: {skill}
- 避けたい食材: {settings.get('avoidIngredients') or 'なし'}
- 人数: {settings.get('defaultServings', 2)}人分

## 料理ジャンル
{CUISINE_LABELS.get(cuisine, 'ジャンル問わず')}

## 出力形式
JSONのみ出力してください（前後のテキスト不要）：

[
  {{
    "title": "料理名",
    "description": "料理の簡単な説明（1〜2文）",
    "cuisine": "{cuisine}",
    "servings": {settings.get('defaultServings', 2)},
    "prepTime": 15,
    "cookTime": 20,
    "ingredients": [
      {{"ingredientName": "食材名", "amount": 100, "unit": "g"}}
    ],
    "steps": ["手順1", "手順2"],
    "tips": "コツやポイント"
  }}
]

注意: 賞味期限が近い食材を優先して使い、各レシピは明確に異なる料理にしてください。"""

    full_text = ""
    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            full_text += text
            yield text

    yield f"\n__JSON__{full_text}"


def parse_recipes(full_text: str) -> list:
    match = re.search(r"\[[\s\S]*\]", full_text)
    if not match:
        return []
    try:
        recipes = json.loads(match.group())
        now = datetime.now().isoformat()
        return [{"id": str(uuid.uuid4()), "createdAt": now, **r} for r in recipes]
    except json.JSONDecodeError:
        return []


def refine_recipe(recipe: dict, feedback: str, settings: dict, api_key: str):
    """フィードバックを元にレシピを改善。テキストをストリーミングで yield。"""
    client = _build_client(api_key)

    prompt = f"""以下のレシピに対してフィードバックがあります。改善案を提案してください。

## 元のレシピ
タイトル: {recipe['title']}
材料: {', '.join(f"{i['ingredientName']} {i['amount']}{i['unit']}" for i in recipe.get('ingredients', []))}
手順: {' → '.join(recipe.get('steps', []))}

## ユーザーの好み
{settings.get('tastePreference') or '特になし'}

## フィードバック
{feedback}

日本語で親しみやすく返答し、改善された手順も含めてください。"""

    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield text


def suggest_cuisines(ingredients: list, api_key: str) -> list:
    client = _build_client(api_key)
    names = "、".join(i["name"] for i in ingredients[:5])

    prompt = f"""以下の食材を使って作れる料理ジャンルを3つ提案してください。

食材: {names}

JSONのみ出力：
[
  {{"cuisine": "japanese", "reason": "理由", "dishes": ["例1", "例2", "例3"]}}
]

cuisineの値は japanese/western/chinese/korean/italian/any のいずれか。"""

    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    match = re.search(r"\[[\s\S]*\]", msg.content[0].text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return []
