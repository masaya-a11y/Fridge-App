import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import base64
import streamlit as st
from utils.storage import (
    load_favorites, remove_favorite,
    add_feedback_to_favorite, update_favorite_photo, load_settings,
)
from utils.claude_client import refine_recipe

st.set_page_config(page_title="お気に入り | フリッジ管理", page_icon="❤️", layout="centered")
st.title("❤️ お気に入りレシピ")

CUISINE_LABELS = {
    "japanese": "🍱 和食", "western": "🍽️ 洋食", "chinese": "🥢 中華",
    "korean": "🫙 韓国料理", "italian": "🍝 イタリアン", "any": "🌍 その他",
}

favorites = load_favorites()
settings  = load_settings()
api_key   = settings.get("apiKey", "")

if not favorites:
    st.info("お気に入りはまだありません。レシピ提案ページで ❤️ を押して保存しましょう。")
    if st.button("🍳 レシピを探す"):
        st.switch_page("pages/2_レシピ提案.py")
    st.stop()

st.caption(f"{len(favorites)} 件のレシピを保存中")

for fav in favorites:
    recipe  = fav["recipe"]
    feedbacks = fav.get("feedbacks", [])
    avg_rating = (
        sum(f["rating"] for f in feedbacks) / len(feedbacks) if feedbacks else None
    )
    cuisine_label = CUISINE_LABELS.get(recipe.get("cuisine", "any"), "")

    with st.container(border=True):
        # ── 写真エリア ────────────────────────
        if fav.get("userPhotoData"):
            st.image(fav["userPhotoData"], use_container_width=True)
        else:
            photo_file = st.file_uploader(
                "📷 写真をアップロード",
                type=["jpg", "jpeg", "png"],
                key=f"photo_{fav['id']}",
                label_visibility="collapsed",
            )
            if photo_file:
                img_data = base64.b64encode(photo_file.read()).decode()
                data_url = f"data:{photo_file.type};base64,{img_data}"
                update_favorite_photo(fav["id"], data_url)
                st.rerun()

        # ── タイトル行 ────────────────────────
        col_title, col_del = st.columns([5, 1])
        col_title.markdown(f"#### {recipe['title']}")
        col_title.caption(
            f"{cuisine_label}　"
            + (f"⭐ {avg_rating:.1f}" if avg_rating else "")
            + f"　{fav['savedAt'][:10]} 保存"
        )
        col_title.write(recipe.get("description", ""))

        if col_del.button("🗑", key=f"del_{fav['id']}"):
            remove_favorite(fav["id"])
            st.rerun()

        # ── 材料 ──────────────────────────────
        st.markdown(
            " ".join(
                f'<span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;'
                f'border-radius:10px;font-size:12px;">'
                f'{i["ingredientName"]} {i["amount"]}{i["unit"]}</span>'
                for i in recipe.get("ingredients", [])
            ),
            unsafe_allow_html=True,
        )

        # ── 手順 ──────────────────────────────
        with st.expander("📋 レシピを見る"):
            for i, step in enumerate(recipe.get("steps", []), 1):
                st.markdown(f"**{i}.** {step}")
            if recipe.get("tips"):
                st.info(f"💡 **コツ:** {recipe['tips']}")

        # ── フィードバック履歴 ────────────────
        if feedbacks:
            with st.expander(f"💬 フィードバック履歴（{len(feedbacks)} 件）"):
                for fb in feedbacks[-5:]:
                    stars = "⭐" * fb.get("rating", 0)
                    st.markdown(f"{stars} `{fb['createdAt'][:10]}`")
                    st.write(fb.get("comment", ""))
                    if fb.get("adjustment"):
                        st.caption(f"改善点: {fb['adjustment']}")
                    st.divider()

        # ── フィードバックフォーム ────────────
        with st.expander("✏️ フィードバックを追加"):
            rating = st.slider("評価", 1, 5, 5, key=f"rating_{fav['id']}", format="%d ⭐")
            comment = st.text_area(
                "感想",
                placeholder="例：とても美味しかった！",
                key=f"comment_{fav['id']}",
                height=70,
            )
            adjustment = st.text_area(
                "次回改善したい点（入力するとAIが提案します）",
                placeholder="例：もう少し甘めにしたい...",
                key=f"adj_{fav['id']}",
                height=70,
            )

            if st.button("💾 保存する", key=f"save_fb_{fav['id']}", disabled=not comment.strip()):
                add_feedback_to_favorite(fav["id"], comment, adjustment, rating)
                st.success("フィードバックを保存しました")

                if api_key and adjustment.strip():
                    refine_box = st.empty()
                    response   = ""
                    st.markdown("**🤖 AIからの改善提案:**")
                    for chunk in refine_recipe(recipe, adjustment, settings, api_key):
                        response += chunk
                        refine_box.markdown(response)
                st.rerun()
