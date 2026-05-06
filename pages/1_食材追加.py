import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import date
import streamlit as st
from utils.storage import add_ingredient
from utils.defaults import (
    CATEGORY_LABELS, CATEGORY_EMOJIS, UNIT_OPTIONS,
    get_default_expiration, get_default_unit,
)

st.set_page_config(page_title="食材追加 | フリッジ管理", page_icon="➕", layout="centered")
st.title("➕ 食材を追加")
st.caption("冷蔵庫の食材を登録しましょう")

ALL_CATS = list(CATEGORY_LABELS.keys())

# ── カテゴリ選択 ───────────────────────────────
st.markdown("#### カテゴリ")
cols = st.columns(5)
if "selected_category" not in st.session_state:
    st.session_state.selected_category = "vegetable"

for i, cat in enumerate(ALL_CATS):
    btn_label = f"{CATEGORY_EMOJIS[cat]}\n{CATEGORY_LABELS[cat]}"
    is_active = st.session_state.selected_category == cat
    style = "primary" if is_active else "secondary"
    if cols[i % 5].button(btn_label, key=f"cat_{cat}", type=style, use_container_width=True):
        st.session_state.selected_category = cat
        st.rerun()

category = st.session_state.selected_category

st.divider()

# ── 食材名 ────────────────────────────────────
name = st.text_input(
    "食材名 *",
    placeholder="例：鶏もも肉、キャベツ、卵...",
    key="ing_name",
)

# ── 数量 + 単位 ───────────────────────────────
st.markdown("#### 数量")
col_qty, col_unit = st.columns([2, 1])

default_unit = get_default_unit(category)
unit_idx     = UNIT_OPTIONS.index(default_unit) if default_unit in UNIT_OPTIONS else 0

with col_qty:
    is_gram = default_unit in ("g", "kg", "ml", "L")
    quantity = st.number_input(
        "数量",
        min_value=0.1,
        max_value=10000.0,
        value=100.0 if is_gram else 1.0,
        step=50.0 if is_gram else 1.0,
        label_visibility="collapsed",
    )
    st.slider(
        "スライダー",
        min_value=0.0,
        max_value=2000.0 if is_gram else 50.0,
        value=float(quantity),
        step=50.0 if is_gram else 1.0,
        label_visibility="collapsed",
        key="qty_slider",
        disabled=True,
    )

with col_unit:
    unit = st.selectbox("単位", UNIT_OPTIONS, index=unit_idx, label_visibility="collapsed")

# ── 賞味期限 ──────────────────────────────────
st.markdown("#### 賞味期限 / 消費期限")

use_default = st.checkbox("一般的な期限を自動設定する", value=False)

if use_default and name:
    defaults = get_default_expiration(name, category)
    default_date = date.fromisoformat(defaults["date"])
    default_storage = defaults["storageMethod"]
else:
    default_date    = date.today()
    default_storage = ""

expiry_date = st.date_input(
    "賞味期限",
    value=default_date,
    min_value=date.today(),
    disabled=use_default and bool(name),
    label_visibility="collapsed",
)

# ── 保存方法 ──────────────────────────────────
st.markdown("#### 保存方法")
storage = st.text_area(
    "保存方法",
    value=default_storage,
    placeholder="例：冷蔵保存（0〜4℃）、育った向きに立てて...",
    height=80,
    label_visibility="collapsed",
)

# ── メモ ──────────────────────────────────────
notes = st.text_input("メモ（任意）", placeholder="購入場所、ブランドなど...")

st.divider()

# ── 登録ボタン ────────────────────────────────
is_valid = bool(name.strip()) and quantity > 0

if st.button("✅ 食材を登録する", type="primary", use_container_width=True, disabled=not is_valid):
    add_ingredient({
        "name":           name.strip(),
        "category":       category,
        "quantity":       quantity,
        "unit":           unit,
        "expirationDate": expiry_date.isoformat(),
        "storageMethod":  storage,
        "notes":          notes,
    })
    st.success(f"✅ **{name}** を登録しました！")
    st.balloons()
    # フォームをリセット
    for key in ["ing_name", "selected_category"]:
        if key in st.session_state:
            del st.session_state[key]
    if st.button("🧊 冷蔵庫一覧へ"):
        st.switch_page("app.py")
