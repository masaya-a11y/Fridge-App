import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import streamlit as st
from utils.storage import load_settings, save_settings

st.set_page_config(page_title="設定 | フリッジ管理", page_icon="⚙️", layout="centered")
st.title("⚙️ 設定")
st.caption("アプリの設定とAPIキーを管理")

settings = load_settings()

# ── Claude API ──────────────────────────────
with st.container(border=True):
    st.markdown("#### 🔑 Claude API設定")
    st.caption("Anthropic Console（console.anthropic.com）で取得したAPIキーを入力してください。レシピ生成に使用します。")
    api_key = st.text_input(
        "APIキー",
        value=settings.get("apiKey", ""),
        type="password",
        placeholder="sk-ant-...",
        label_visibility="collapsed",
    )
    if not api_key:
        st.warning("⚠️ APIキーを設定するとAIレシピ提案機能が使えます")

# ── 味の好み ────────────────────────────────
with st.container(border=True):
    st.markdown("#### 🍴 味の好み")
    taste = st.text_area(
        "フリーテキストで入力",
        value=settings.get("tastePreference", ""),
        placeholder="例：濃い味が好き、甘辛が好き、あっさりが好き...",
        height=80,
        label_visibility="collapsed",
    )
    spice = st.radio(
        "辛さ",
        ["mild", "medium", "spicy"],
        index=["mild", "medium", "spicy"].index(settings.get("spiceLevel", "medium")),
        format_func=lambda x: {"mild": "マイルド", "medium": "普通", "spicy": "辛め"}[x],
        horizontal=True,
    )

# ── 料理設定 ────────────────────────────────
with st.container(border=True):
    st.markdown("#### 👨‍🍳 料理設定")
    servings = st.radio(
        "デフォルト人数",
        [1, 2, 3, 4, 5, 6],
        index=settings.get("defaultServings", 2) - 1,
        format_func=lambda x: f"{x}人",
        horizontal=True,
    )
    skill = st.radio(
        "料理スキル",
        ["beginner", "intermediate", "advanced"],
        index=["beginner", "intermediate", "advanced"].index(settings.get("cookingSkill", "intermediate")),
        format_func=lambda x: {"beginner": "初心者", "intermediate": "中級", "advanced": "上級"}[x],
        horizontal=True,
    )

# ── アラート設定 ─────────────────────────────
with st.container(border=True):
    st.markdown("#### 🔔 賞味期限アラート設定")
    alert_days = settings.get("alertDays", {"critical": 1, "warning": 3, "soon": 7})

    critical = st.number_input("🔴 赤アラート（今すぐ使って）  __ 日前",
                               min_value=0, max_value=30, value=alert_days.get("critical", 1))
    warning  = st.number_input("🟠 オレンジアラート（もうすぐ期限）  __ 日前",
                               min_value=0, max_value=30, value=alert_days.get("warning", 3))
    soon     = st.number_input("🟡 黄色アラート（期限が近い）  __ 日前",
                               min_value=0, max_value=30, value=alert_days.get("soon", 7))

# ── アレルギー・避ける食材 ───────────────────
with st.container(border=True):
    st.markdown("#### 🚫 避けたい食材・アレルギー")
    avoid = st.text_input(
        "避けたい食材",
        value=settings.get("avoidIngredients", ""),
        placeholder="例：えび、落花生、乳製品...",
        label_visibility="collapsed",
    )

st.divider()

# ── 保存 ────────────────────────────────────
if st.button("💾 設定を保存", type="primary", use_container_width=True):
    save_settings({
        **settings,
        "apiKey":          api_key,
        "tastePreference": taste,
        "spiceLevel":      spice,
        "defaultServings": servings,
        "cookingSkill":    skill,
        "alertDays":       {"critical": critical, "warning": warning, "soon": soon},
        "avoidIngredients": avoid,
    })
    st.success("✅ 設定を保存しました！")
    st.rerun()
