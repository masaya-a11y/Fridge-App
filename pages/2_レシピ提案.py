import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
from utils.storage import load_ingredients, load_settings, add_favorite, consume_ingredients
from utils.expiration import get_days_until_expiration, get_status, format_days
from utils.defaults import CATEGORY_EMOJIS
from utils.claude_client import generate_recipes, parse_recipes, refine_recipe, suggest_cuisines

st.set_page_config(page_title="レシピ提案 | フリッジ管理", page_icon="🍳", layout="centered")
st.title("🍳 レシピ提案")

CUISINE_OPTIONS = {
    "japanese": "🍱 和食",
    "western":  "🍽️ 洋食",
    "chinese":  "🥢 中華",
    "korean":   "🫙 韓国料理",
    "italian":  "🍝 イタリアン",
    "any":      "🎲 お任せ",
}

settings    = load_settings()
alert_days  = settings.get("alertDays", {"critical": 1, "warning": 3, "soon": 7})
api_key     = settings.get("apiKey", "")
ingredients = load_ingredients()

if not ingredients:
    st.info("食材が登録されていません。まず食材を追加してください。")
    if st.button("➕ 食材を追加"):
        st.switch_page("pages/1_食材追加.py")
    st.stop()

if not api_key:
    st.warning("⚠️ Claude APIキーが設定されていません。設定画面で登録してください。")
    if st.button("⚙️ 設定へ"):
        st.switch_page("pages/4_設定.py")
    st.stop()

# 期限が近い順でソート
sorted_ings = sorted(ingredients, key=lambda x: get_days_until_expiration(x["expirationDate"]))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1 : 食材選択
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
st.markdown("### Step 1　使う食材を選ぶ")
st.caption("期限が近い順に並んでいます")

selected_ids = []
for ing in sorted_ings:
    days   = get_days_until_expiration(ing["expirationDate"])
    status, label, color = get_status(ing["expirationDate"], alert_days)
    emoji  = CATEGORY_EMOJIS.get(ing["category"], "📦")
    badge  = f'<span style="background:{color};color:#fff;padding:1px 8px;border-radius:10px;font-size:11px;">{label}</span>'
    col_chk, col_info = st.columns([1, 9])
    checked = col_chk.checkbox("", key=f"sel_{ing['id']}", label_visibility="collapsed")
    col_info.markdown(
        f"{emoji} **{ing['name']}** {badge} &nbsp; <span style='color:#64748b;font-size:13px;'>{ing['quantity']}{ing['unit']} / {format_days(days)}</span>",
        unsafe_allow_html=True,
    )
    if checked:
        selected_ids.append(ing["id"])

selected_ings = [i for i in ingredients if i["id"] in selected_ids]

st.divider()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2 : ジャンル選択
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
st.markdown("### Step 2　料理ジャンルを選ぶ")

# AI おすすめジャンル（食材選択後）
if selected_ings and st.button("🤖 AIにジャンルを提案してもらう", disabled=not selected_ings):
    with st.spinner("AIが分析中..."):
        try:
            suggestions = suggest_cuisines(selected_ings, api_key)
            st.session_state["cuisine_suggestions"] = suggestions
        except Exception as e:
            st.error(f"提案取得に失敗しました: {e}")

if "cuisine_suggestions" in st.session_state and st.session_state["cuisine_suggestions"]:
    st.markdown("**🤖 AIのおすすめ**")
    for s in st.session_state["cuisine_suggestions"]:
        opt = CUISINE_OPTIONS.get(s["cuisine"], s["cuisine"])
        dishes = "、".join(s.get("dishes", []))
        with st.expander(f"{opt} — {s.get('reason','')}"):
            st.caption(f"例：{dishes}")

cuisine_cols = st.columns(3)
cuisine_keys = list(CUISINE_OPTIONS.keys())
if "selected_cuisine" not in st.session_state:
    st.session_state.selected_cuisine = "any"

for i, (key, label) in enumerate(CUISINE_OPTIONS.items()):
    is_active = st.session_state.selected_cuisine == key
    if cuisine_cols[i % 3].button(label, key=f"cui_{key}",
                                   type="primary" if is_active else "secondary",
                                   use_container_width=True):
        st.session_state.selected_cuisine = key
        st.rerun()

st.divider()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3 : レシピ数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
st.markdown("### Step 3　提案するレシピの数")
recipe_count = st.radio(
    "レシピ数",
    [1, 2, 3],
    index=1,
    horizontal=True,
    format_func=lambda x: f"{x} 種類",
    label_visibility="collapsed",
)

st.divider()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 生成ボタン
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
can_generate = bool(selected_ings)
if not can_generate:
    st.info("食材を1つ以上選択してください")

if st.button("✨ AIでレシピを生成", type="primary", use_container_width=True, disabled=not can_generate):
    st.session_state.pop("generated_recipes", None)
    st.session_state.pop("recipe_raw", None)

    stream_box = st.empty()
    full_text  = ""

    with st.spinner("レシピを考え中...🍳"):
        for chunk in generate_recipes(
            selected_ings,
            st.session_state.selected_cuisine,
            recipe_count,
            settings,
            api_key,
        ):
            if chunk.startswith("\n__JSON__"):
                full_text = chunk[len("\n__JSON__"):]
                break
            full_text += chunk
            stream_box.markdown(full_text)

    stream_box.empty()
    recipes = parse_recipes(full_text)
    if recipes:
        st.session_state["generated_recipes"] = recipes
    else:
        st.error("レシピの解析に失敗しました。再度お試しください。")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# レシピ表示
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if "generated_recipes" in st.session_state:
    recipes = st.session_state["generated_recipes"]
    st.markdown(f"### 提案レシピ（{len(recipes)} 種類）")

    for idx, recipe in enumerate(recipes):
        cuisine_label = CUISINE_OPTIONS.get(recipe.get("cuisine", "any"), "")
        with st.container(border=True):
            # ヘッダー
            col_title, col_fav = st.columns([5, 1])
            col_title.markdown(f"#### {recipe['title']}")
            col_title.caption(
                f"{cuisine_label} ／ 準備 {recipe.get('prepTime',0)}分 ＋ 調理 {recipe.get('cookTime',0)}分 ／ {recipe.get('servings',2)}人分"
            )
            col_title.write(recipe.get("description", ""))
            if col_fav.button("❤️", key=f"fav_{idx}", help="お気に入りに追加"):
                if add_favorite(recipe):
                    st.success("お気に入りに追加しました")
                else:
                    st.info("すでに保存済みです")

            # 使用食材バッジ
            st.markdown(
                " ".join(
                    f'<span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:10px;font-size:12px;">'
                    f'{i["ingredientName"]} {i["amount"]}{i["unit"]}</span>'
                    for i in recipe.get("ingredients", [])
                ),
                unsafe_allow_html=True,
            )

            # 手順
            with st.expander("📋 調理手順を見る"):
                for step_i, step in enumerate(recipe.get("steps", []), 1):
                    st.markdown(f"**{step_i}.** {step}")
                if recipe.get("tips"):
                    st.info(f"💡 **コツ:** {recipe['tips']}")

            # この料理を作ったボタン
            if st.button("✅ この料理を作った", key=f"cook_{idx}", use_container_width=True):
                usages = []
                for u in recipe.get("ingredients", []):
                    match = next((i for i in ingredients if i["name"] == u["ingredientName"]), None)
                    if match:
                        usages.append({"ingredientId": match["id"], "amount": u["amount"]})
                if usages:
                    consume_ingredients(usages)
                    st.success(f"「{recipe['title']}」を調理しました！食材の数量を更新しました。")

            # フィードバック → AI改善
            with st.expander("💬 フィードバック・改善する"):
                fb_text = st.text_area(
                    "感想・改善したい点",
                    placeholder="例：もう少し辛くしたい、塩分を控えめに...",
                    key=f"fb_{idx}",
                    height=80,
                )
                if st.button("🤖 AIに改善してもらう", key=f"refine_{idx}", disabled=not fb_text.strip()):
                    refine_box = st.empty()
                    response   = ""
                    with st.spinner("AIが改善中..."):
                        for chunk in refine_recipe(recipe, fb_text, settings, api_key):
                            response += chunk
                            refine_box.markdown(response)
