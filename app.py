import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import streamlit as st
from utils.storage import load_ingredients, load_settings, remove_ingredient, update_ingredient
from utils.expiration import get_days_until_expiration, get_status, format_days, STATUS_BG, STATUS_BORDER
from utils.defaults import CATEGORY_EMOJIS, CATEGORY_LABELS

st.set_page_config(page_title="フリッジ管理", page_icon="🧊", layout="centered")

st.markdown("""
<style>
div[data-testid="stMetricValue"] { font-size: 1.6rem; font-weight: 700; }
.ing-card {
    border-radius: 14px; padding: 12px 16px; margin-bottom: 10px;
    border: 2px solid; transition: all .2s;
}
.badge {
    display: inline-block; padding: 2px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .3px;
}
.alert-box {
    border-radius: 14px; padding: 12px 16px; margin-bottom: 16px;
    border-left: 5px solid;
}
</style>
""", unsafe_allow_html=True)

# ── 共通ヘルパー ───────────────────────────────
BADGE_TEXT_COLOR = {"expired": "#fff", "critical": "#fff", "warning": "#fff", "soon": "#713f12", "ok": "#fff"}

def status_badge(status: str, label: str, color: str) -> str:
    tc = BADGE_TEXT_COLOR.get(status, "#fff")
    return f'<span class="badge" style="background:{color};color:{tc};">{label}</span>'


# ── メイン ────────────────────────────────────
def main():
    st.title("🧊 フリッジ管理")
    st.caption("冷蔵庫の食材を賢く管理")

    settings = load_settings()
    alert_days = settings.get("alertDays", {"critical": 1, "warning": 3, "soon": 7})
    ingredients = load_ingredients()

    if not ingredients:
        st.info("🧊 冷蔵庫は空です。食材を登録してみましょう。")
        if st.button("➕ 最初の食材を追加", type="primary"):
            st.switch_page("pages/1_食材追加.py")
        return

    # 期限順ソート済みリスト
    sorted_ings = sorted(ingredients, key=lambda x: get_days_until_expiration(x["expirationDate"]))

    # ── アラートバナー ────────────────────────
    urgent = [i for i in sorted_ings
              if get_status(i["expirationDate"], alert_days)[0] in ("expired", "critical", "warning")]
    if urgent:
        top_status, _, top_color = get_status(urgent[0]["expirationDate"], alert_days)
        bg = STATUS_BG.get(top_status, "#fee2e2")
        lines = "".join(
            f"<div style='font-size:13px;margin-top:4px;'>• {i['name']} — {format_days(get_days_until_expiration(i['expirationDate']))}</div>"
            for i in urgent[:3]
        )
        more = f"<div style='font-size:12px;opacity:.7;margin-top:2px;'>他 {len(urgent)-3} 件</div>" if len(urgent) > 3 else ""
        st.markdown(f"""
        <div class="alert-box" style="background:{bg};border-color:{top_color};">
          ⚠️ <strong>{len(urgent)}個の食材に注意が必要です</strong>
          {lines}{more}
        </div>""", unsafe_allow_html=True)

    # ── ステータス集計 ────────────────────────
    counts = {s: 0 for s in ("expired", "critical", "warning", "soon", "ok")}
    for i in ingredients:
        counts[get_status(i["expirationDate"], alert_days)[0]] += 1

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("⛔ 期限切れ",   counts["expired"])
    c2.metric("🔴 今すぐ使って", counts["critical"])
    c3.metric("🟠 期限近し",   counts["warning"] + counts["soon"])
    c4.metric("🟢 新鮮",       counts["ok"])

    urgent_total = counts["expired"] + counts["critical"] + counts["warning"]
    if urgent_total > 0:
        if st.button("🍳 期限が近い食材でレシピを提案 →", type="primary", use_container_width=True):
            st.switch_page("pages/2_レシピ提案.py")

    st.divider()

    # ── 検索・フィルタ・ソート ────────────────
    col_s, col_sort = st.columns([3, 1])
    search   = col_s.text_input("🔍 検索", placeholder="食材名...", label_visibility="collapsed")
    sort_opt = col_sort.selectbox("並び替え", ["期限順", "名前順", "カテゴリ順"], label_visibility="collapsed")

    cats = st.multiselect(
        "カテゴリ",
        list(CATEGORY_LABELS.keys()),
        format_func=lambda x: f"{CATEGORY_EMOJIS[x]} {CATEGORY_LABELS[x]}",
        label_visibility="collapsed",
        placeholder="カテゴリで絞り込む",
    )

    filtered = [
        i for i in ingredients
        if (not search or search in i["name"])
        and (not cats or i["category"] in cats)
    ]
    if sort_opt == "期限順":
        filtered.sort(key=lambda x: get_days_until_expiration(x["expirationDate"]))
    elif sort_opt == "名前順":
        filtered.sort(key=lambda x: x["name"])
    else:
        filtered.sort(key=lambda x: x["category"])

    st.markdown(f"**食材一覧** （{len(filtered)} 件）")

    # ── 食材カード ────────────────────────────
    for ing in filtered:
        days   = get_days_until_expiration(ing["expirationDate"])
        status, label, color = get_status(ing["expirationDate"], alert_days)
        emoji  = CATEGORY_EMOJIS.get(ing["category"], "📦")
        bg     = STATUS_BG.get(status, "#fff")
        border = STATUS_BORDER.get(status, "#e5e7eb")

        st.markdown(
            f'<div class="ing-card" style="background:{bg};border-color:{border};">',
            unsafe_allow_html=True,
        )

        row1, row2, row3, row4 = st.columns([3, 2, 2, 1])

        with row1:
            st.markdown(f"**{emoji} {ing['name']}**")
            exp_str = ing["expirationDate"][:10]
            st.caption(f"{exp_str} まで　{format_days(days)}")

        with row2:
            st.markdown(status_badge(status, label, color), unsafe_allow_html=True)

        with row3:
            # ＋ / − ボタン & 数量表示
            bc1, bc2, bc3 = st.columns([1, 2, 1])
            if bc1.button("－", key=f"m_{ing['id']}"):
                new_qty = max(0, ing["quantity"] - 1)
                if new_qty == 0:
                    remove_ingredient(ing["id"])
                else:
                    update_ingredient(ing["id"], {"quantity": new_qty})
                st.rerun()
            bc2.markdown(f"<div style='text-align:center;font-weight:700;padding-top:6px;'>"
                         f"{ing['quantity']}{ing['unit']}</div>", unsafe_allow_html=True)
            if bc3.button("＋", key=f"p_{ing['id']}"):
                update_ingredient(ing["id"], {"quantity": ing["quantity"] + 1})
                st.rerun()

        with row4:
            if st.button("🗑", key=f"d_{ing['id']}"):
                remove_ingredient(ing["id"])
                st.rerun()

        if ing.get("storageMethod") or ing.get("notes"):
            with st.expander("📋 保存方法・メモ"):
                if ing.get("storageMethod"):
                    st.caption(ing["storageMethod"])
                if ing.get("notes"):
                    st.caption(f"📝 {ing['notes']}")

        st.markdown("</div>", unsafe_allow_html=True)


main()
