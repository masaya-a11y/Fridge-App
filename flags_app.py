import streamlit as st
import random

st.set_page_config(
    page_title="世界の国旗学習",
    page_icon="🌍",
    layout="wide",
)

FLAG_URL = "https://flagcdn.com/w320/{code}.png"

# ===== 国データ (ISO 3166-1 alpha-2 コード + 日本語名 + 地域) =====
COUNTRIES = [
    # ---- 東アジア ----
    {"code": "jp", "ja": "日本", "region": "東アジア"},
    {"code": "cn", "ja": "中国", "region": "東アジア"},
    {"code": "kr", "ja": "韓国", "region": "東アジア"},
    {"code": "kp", "ja": "北朝鮮", "region": "東アジア"},
    {"code": "tw", "ja": "台湾", "region": "東アジア"},
    {"code": "mn", "ja": "モンゴル", "region": "東アジア"},
    # ---- 東南アジア ----
    {"code": "vn", "ja": "ベトナム", "region": "東南アジア"},
    {"code": "th", "ja": "タイ", "region": "東南アジア"},
    {"code": "la", "ja": "ラオス", "region": "東南アジア"},
    {"code": "kh", "ja": "カンボジア", "region": "東南アジア"},
    {"code": "mm", "ja": "ミャンマー", "region": "東南アジア"},
    {"code": "ph", "ja": "フィリピン", "region": "東南アジア"},
    {"code": "id", "ja": "インドネシア", "region": "東南アジア"},
    {"code": "my", "ja": "マレーシア", "region": "東南アジア"},
    {"code": "sg", "ja": "シンガポール", "region": "東南アジア"},
    {"code": "bn", "ja": "ブルネイ", "region": "東南アジア"},
    {"code": "tl", "ja": "東ティモール", "region": "東南アジア"},
    # ---- 南アジア ----
    {"code": "in", "ja": "インド", "region": "南アジア"},
    {"code": "pk", "ja": "パキスタン", "region": "南アジア"},
    {"code": "bd", "ja": "バングラデシュ", "region": "南アジア"},
    {"code": "lk", "ja": "スリランカ", "region": "南アジア"},
    {"code": "np", "ja": "ネパール", "region": "南アジア"},
    {"code": "bt", "ja": "ブータン", "region": "南アジア"},
    {"code": "mv", "ja": "モルディブ", "region": "南アジア"},
    {"code": "af", "ja": "アフガニスタン", "region": "南アジア"},
    # ---- 中東 ----
    {"code": "ir", "ja": "イラン", "region": "中東"},
    {"code": "iq", "ja": "イラク", "region": "中東"},
    {"code": "sy", "ja": "シリア", "region": "中東"},
    {"code": "lb", "ja": "レバノン", "region": "中東"},
    {"code": "il", "ja": "イスラエル", "region": "中東"},
    {"code": "ps", "ja": "パレスチナ", "region": "中東"},
    {"code": "jo", "ja": "ヨルダン", "region": "中東"},
    {"code": "sa", "ja": "サウジアラビア", "region": "中東"},
    {"code": "ye", "ja": "イエメン", "region": "中東"},
    {"code": "om", "ja": "オマーン", "region": "中東"},
    {"code": "ae", "ja": "アラブ首長国連邦", "region": "中東"},
    {"code": "qa", "ja": "カタール", "region": "中東"},
    {"code": "bh", "ja": "バーレーン", "region": "中東"},
    {"code": "kw", "ja": "クウェート", "region": "中東"},
    # ---- 中央アジア・コーカサス ----
    {"code": "tr", "ja": "トルコ", "region": "中央アジア・コーカサス"},
    {"code": "cy", "ja": "キプロス", "region": "中央アジア・コーカサス"},
    {"code": "ge", "ja": "ジョージア", "region": "中央アジア・コーカサス"},
    {"code": "am", "ja": "アルメニア", "region": "中央アジア・コーカサス"},
    {"code": "az", "ja": "アゼルバイジャン", "region": "中央アジア・コーカサス"},
    {"code": "kz", "ja": "カザフスタン", "region": "中央アジア・コーカサス"},
    {"code": "uz", "ja": "ウズベキスタン", "region": "中央アジア・コーカサス"},
    {"code": "tm", "ja": "トルクメニスタン", "region": "中央アジア・コーカサス"},
    {"code": "tj", "ja": "タジキスタン", "region": "中央アジア・コーカサス"},
    {"code": "kg", "ja": "キルギス", "region": "中央アジア・コーカサス"},
    # ---- 西ヨーロッパ ----
    {"code": "gb", "ja": "イギリス", "region": "西ヨーロッパ"},
    {"code": "fr", "ja": "フランス", "region": "西ヨーロッパ"},
    {"code": "de", "ja": "ドイツ", "region": "西ヨーロッパ"},
    {"code": "it", "ja": "イタリア", "region": "西ヨーロッパ"},
    {"code": "es", "ja": "スペイン", "region": "西ヨーロッパ"},
    {"code": "pt", "ja": "ポルトガル", "region": "西ヨーロッパ"},
    {"code": "nl", "ja": "オランダ", "region": "西ヨーロッパ"},
    {"code": "be", "ja": "ベルギー", "region": "西ヨーロッパ"},
    {"code": "lu", "ja": "ルクセンブルク", "region": "西ヨーロッパ"},
    {"code": "ch", "ja": "スイス", "region": "西ヨーロッパ"},
    {"code": "at", "ja": "オーストリア", "region": "西ヨーロッパ"},
    {"code": "ie", "ja": "アイルランド", "region": "西ヨーロッパ"},
    {"code": "mc", "ja": "モナコ", "region": "西ヨーロッパ"},
    {"code": "ad", "ja": "アンドラ", "region": "西ヨーロッパ"},
    {"code": "sm", "ja": "サンマリノ", "region": "西ヨーロッパ"},
    {"code": "va", "ja": "バチカン", "region": "西ヨーロッパ"},
    {"code": "li", "ja": "リヒテンシュタイン", "region": "西ヨーロッパ"},
    {"code": "mt", "ja": "マルタ", "region": "西ヨーロッパ"},
    # ---- 北ヨーロッパ ----
    {"code": "dk", "ja": "デンマーク", "region": "北ヨーロッパ"},
    {"code": "se", "ja": "スウェーデン", "region": "北ヨーロッパ"},
    {"code": "no", "ja": "ノルウェー", "region": "北ヨーロッパ"},
    {"code": "fi", "ja": "フィンランド", "region": "北ヨーロッパ"},
    {"code": "is", "ja": "アイスランド", "region": "北ヨーロッパ"},
    {"code": "ee", "ja": "エストニア", "region": "北ヨーロッパ"},
    {"code": "lv", "ja": "ラトビア", "region": "北ヨーロッパ"},
    {"code": "lt", "ja": "リトアニア", "region": "北ヨーロッパ"},
    # ---- 東ヨーロッパ ----
    {"code": "pl", "ja": "ポーランド", "region": "東ヨーロッパ"},
    {"code": "cz", "ja": "チェコ", "region": "東ヨーロッパ"},
    {"code": "sk", "ja": "スロバキア", "region": "東ヨーロッパ"},
    {"code": "hu", "ja": "ハンガリー", "region": "東ヨーロッパ"},
    {"code": "ro", "ja": "ルーマニア", "region": "東ヨーロッパ"},
    {"code": "bg", "ja": "ブルガリア", "region": "東ヨーロッパ"},
    {"code": "ua", "ja": "ウクライナ", "region": "東ヨーロッパ"},
    {"code": "by", "ja": "ベラルーシ", "region": "東ヨーロッパ"},
    {"code": "md", "ja": "モルドバ", "region": "東ヨーロッパ"},
    {"code": "ru", "ja": "ロシア", "region": "東ヨーロッパ"},
    {"code": "gr", "ja": "ギリシャ", "region": "東ヨーロッパ"},
    # ---- 旧ユーゴスラビア圏 ----
    {"code": "hr", "ja": "クロアチア", "region": "旧ユーゴスラビア圏"},
    {"code": "si", "ja": "スロベニア", "region": "旧ユーゴスラビア圏"},
    {"code": "rs", "ja": "セルビア", "region": "旧ユーゴスラビア圏"},
    {"code": "ba", "ja": "ボスニア・ヘルツェゴビナ", "region": "旧ユーゴスラビア圏"},
    {"code": "me", "ja": "モンテネグロ", "region": "旧ユーゴスラビア圏"},
    {"code": "mk", "ja": "北マケドニア", "region": "旧ユーゴスラビア圏"},
    {"code": "al", "ja": "アルバニア", "region": "旧ユーゴスラビア圏"},
    {"code": "xk", "ja": "コソボ", "region": "旧ユーゴスラビア圏"},
    # ---- 北アメリカ・中米 ----
    {"code": "us", "ja": "アメリカ", "region": "北・中米"},
    {"code": "ca", "ja": "カナダ", "region": "北・中米"},
    {"code": "mx", "ja": "メキシコ", "region": "北・中米"},
    {"code": "gt", "ja": "グアテマラ", "region": "北・中米"},
    {"code": "bz", "ja": "ベリーズ", "region": "北・中米"},
    {"code": "hn", "ja": "ホンジュラス", "region": "北・中米"},
    {"code": "sv", "ja": "エルサルバドル", "region": "北・中米"},
    {"code": "ni", "ja": "ニカラグア", "region": "北・中米"},
    {"code": "cr", "ja": "コスタリカ", "region": "北・中米"},
    {"code": "pa", "ja": "パナマ", "region": "北・中米"},
    # ---- カリブ ----
    {"code": "cu", "ja": "キューバ", "region": "カリブ"},
    {"code": "jm", "ja": "ジャマイカ", "region": "カリブ"},
    {"code": "ht", "ja": "ハイチ", "region": "カリブ"},
    {"code": "do", "ja": "ドミニカ共和国", "region": "カリブ"},
    {"code": "tt", "ja": "トリニダード・トバゴ", "region": "カリブ"},
    {"code": "bb", "ja": "バルバドス", "region": "カリブ"},
    {"code": "lc", "ja": "セントルシア", "region": "カリブ"},
    {"code": "vc", "ja": "セントビンセント・グレナディーン", "region": "カリブ"},
    {"code": "gd", "ja": "グレナダ", "region": "カリブ"},
    {"code": "ag", "ja": "アンティグア・バーブーダ", "region": "カリブ"},
    {"code": "dm", "ja": "ドミニカ国", "region": "カリブ"},
    {"code": "kn", "ja": "セントクリストファー・ネイビス", "region": "カリブ"},
    {"code": "bs", "ja": "バハマ", "region": "カリブ"},
    # ---- 南アメリカ ----
    {"code": "co", "ja": "コロンビア", "region": "南アメリカ"},
    {"code": "ve", "ja": "ベネズエラ", "region": "南アメリカ"},
    {"code": "gy", "ja": "ガイアナ", "region": "南アメリカ"},
    {"code": "sr", "ja": "スリナム", "region": "南アメリカ"},
    {"code": "br", "ja": "ブラジル", "region": "南アメリカ"},
    {"code": "ec", "ja": "エクアドル", "region": "南アメリカ"},
    {"code": "pe", "ja": "ペルー", "region": "南アメリカ"},
    {"code": "bo", "ja": "ボリビア", "region": "南アメリカ"},
    {"code": "py", "ja": "パラグアイ", "region": "南アメリカ"},
    {"code": "uy", "ja": "ウルグアイ", "region": "南アメリカ"},
    {"code": "ar", "ja": "アルゼンチン", "region": "南アメリカ"},
    {"code": "cl", "ja": "チリ", "region": "南アメリカ"},
    # ---- 北アフリカ ----
    {"code": "ma", "ja": "モロッコ", "region": "北アフリカ"},
    {"code": "dz", "ja": "アルジェリア", "region": "北アフリカ"},
    {"code": "tn", "ja": "チュニジア", "region": "北アフリカ"},
    {"code": "ly", "ja": "リビア", "region": "北アフリカ"},
    {"code": "eg", "ja": "エジプト", "region": "北アフリカ"},
    {"code": "sd", "ja": "スーダン", "region": "北アフリカ"},
    {"code": "mr", "ja": "モーリタニア", "region": "北アフリカ"},
    # ---- サブサハラ・東アフリカ ----
    {"code": "ss", "ja": "南スーダン", "region": "東アフリカ"},
    {"code": "et", "ja": "エチオピア", "region": "東アフリカ"},
    {"code": "er", "ja": "エリトリア", "region": "東アフリカ"},
    {"code": "dj", "ja": "ジブチ", "region": "東アフリカ"},
    {"code": "so", "ja": "ソマリア", "region": "東アフリカ"},
    {"code": "ke", "ja": "ケニア", "region": "東アフリカ"},
    {"code": "ug", "ja": "ウガンダ", "region": "東アフリカ"},
    {"code": "tz", "ja": "タンザニア", "region": "東アフリカ"},
    {"code": "rw", "ja": "ルワンダ", "region": "東アフリカ"},
    {"code": "bi", "ja": "ブルンジ", "region": "東アフリカ"},
    {"code": "mw", "ja": "マラウイ", "region": "東アフリカ"},
    {"code": "zm", "ja": "ザンビア", "region": "東アフリカ"},
    {"code": "zw", "ja": "ジンバブエ", "region": "東アフリカ"},
    {"code": "mz", "ja": "モザンビーク", "region": "東アフリカ"},
    {"code": "mg", "ja": "マダガスカル", "region": "東アフリカ"},
    {"code": "km", "ja": "コモロ", "region": "東アフリカ"},
    {"code": "sc", "ja": "セーシェル", "region": "東アフリカ"},
    {"code": "mu", "ja": "モーリシャス", "region": "東アフリカ"},
    # ---- 南アフリカ圏 ----
    {"code": "za", "ja": "南アフリカ", "region": "南アフリカ圏"},
    {"code": "ls", "ja": "レソト", "region": "南アフリカ圏"},
    {"code": "sz", "ja": "エスワティニ", "region": "南アフリカ圏"},
    {"code": "na", "ja": "ナミビア", "region": "南アフリカ圏"},
    {"code": "bw", "ja": "ボツワナ", "region": "南アフリカ圏"},
    {"code": "ao", "ja": "アンゴラ", "region": "南アフリカ圏"},
    # ---- 中・西アフリカ ----
    {"code": "cd", "ja": "コンゴ民主共和国", "region": "中・西アフリカ"},
    {"code": "cg", "ja": "コンゴ共和国", "region": "中・西アフリカ"},
    {"code": "cm", "ja": "カメルーン", "region": "中・西アフリカ"},
    {"code": "cf", "ja": "中央アフリカ共和国", "region": "中・西アフリカ"},
    {"code": "ga", "ja": "ガボン", "region": "中・西アフリカ"},
    {"code": "gq", "ja": "赤道ギニア", "region": "中・西アフリカ"},
    {"code": "st", "ja": "サントメ・プリンシペ", "region": "中・西アフリカ"},
    {"code": "td", "ja": "チャド", "region": "中・西アフリカ"},
    {"code": "ne", "ja": "ニジェール", "region": "中・西アフリカ"},
    {"code": "ng", "ja": "ナイジェリア", "region": "中・西アフリカ"},
    {"code": "bj", "ja": "ベナン", "region": "中・西アフリカ"},
    {"code": "gh", "ja": "ガーナ", "region": "中・西アフリカ"},
    {"code": "tg", "ja": "トーゴ", "region": "中・西アフリカ"},
    {"code": "ci", "ja": "コートジボワール", "region": "中・西アフリカ"},
    {"code": "bf", "ja": "ブルキナファソ", "region": "中・西アフリカ"},
    {"code": "ml", "ja": "マリ", "region": "中・西アフリカ"},
    {"code": "sn", "ja": "セネガル", "region": "中・西アフリカ"},
    {"code": "gm", "ja": "ガンビア", "region": "中・西アフリカ"},
    {"code": "gw", "ja": "ギニアビサウ", "region": "中・西アフリカ"},
    {"code": "gn", "ja": "ギニア", "region": "中・西アフリカ"},
    {"code": "sl", "ja": "シエラレオネ", "region": "中・西アフリカ"},
    {"code": "lr", "ja": "リベリア", "region": "中・西アフリカ"},
    {"code": "cv", "ja": "カーボベルデ", "region": "中・西アフリカ"},
    # ---- オセアニア ----
    {"code": "au", "ja": "オーストラリア", "region": "オセアニア"},
    {"code": "nz", "ja": "ニュージーランド", "region": "オセアニア"},
    {"code": "pg", "ja": "パプアニューギニア", "region": "オセアニア"},
    {"code": "fj", "ja": "フィジー", "region": "オセアニア"},
    {"code": "sb", "ja": "ソロモン諸島", "region": "オセアニア"},
    {"code": "vu", "ja": "バヌアツ", "region": "オセアニア"},
    {"code": "ws", "ja": "サモア", "region": "オセアニア"},
    {"code": "to", "ja": "トンガ", "region": "オセアニア"},
    {"code": "ki", "ja": "キリバス", "region": "オセアニア"},
    {"code": "fm", "ja": "ミクロネシア連邦", "region": "オセアニア"},
    {"code": "mh", "ja": "マーシャル諸島", "region": "オセアニア"},
    {"code": "pw", "ja": "パラオ", "region": "オセアニア"},
    {"code": "nr", "ja": "ナウル", "region": "オセアニア"},
    {"code": "tv", "ja": "ツバル", "region": "オセアニア"},
]


def flag_url(code: str) -> str:
    return FLAG_URL.format(code=code.lower())


def init_state():
    if "progress" not in st.session_state:
        st.session_state.progress = {
            c["code"]: {"correct": 0, "wrong": 0, "streak": 0}
            for c in COUNTRIES
        }
    if "fc_state" not in st.session_state:
        st.session_state.fc_state = {}
    if "fq_state" not in st.session_state:
        st.session_state.fq_state = {}
    if "rq_state" not in st.session_state:
        st.session_state.rq_state = {}


def weight(code: str) -> float:
    p = st.session_state.progress[code]
    total = p["correct"] + p["wrong"]
    if total == 0:
        return 10.0
    if p["streak"] >= 3:
        return 0.2
    acc = p["correct"] / total
    if acc < 0.5:
        return 5.0
    if acc < 0.8:
        return 2.0
    return 1.0


def filtered_pool(region: str, skip_mastered: bool) -> list:
    pool = COUNTRIES if region == "全て" else [c for c in COUNTRIES if c["region"] == region]
    if skip_mastered:
        pool = [c for c in pool if st.session_state.progress[c["code"]]["streak"] < 3]
    return pool


def pick_question(pool: list):
    if not pool:
        return None
    weights = [weight(c["code"]) for c in pool]
    return random.choices(pool, weights=weights, k=1)[0]


def make_choices(correct: dict, pool: list, n: int = 4) -> list:
    others = [c for c in pool if c["code"] != correct["code"]]
    wrong = random.sample(others, min(n - 1, len(others)))
    choices = wrong + [correct]
    random.shuffle(choices)
    return choices


def record(code: str, is_correct: bool):
    p = st.session_state.progress[code]
    if is_correct:
        p["correct"] += 1
        p["streak"] += 1
    else:
        p["wrong"] += 1
        p["streak"] = 0


def mastered_count(pool: list) -> int:
    return sum(1 for c in pool if st.session_state.progress[c["code"]]["streak"] >= 3)


# ===== ページ =====

def page_encyclopedia(region: str):
    st.title("📖 国旗図鑑")
    pool = filtered_pool(region, False)
    st.caption(f"{len(pool)} カ国表示中 ／ 習得済み: {mastered_count(pool)} カ国")

    cols_per_row = 5
    for i in range(0, len(pool), cols_per_row):
        cols = st.columns(cols_per_row)
        for j, country in enumerate(pool[i : i + cols_per_row]):
            p = st.session_state.progress[country["code"]]
            streak = p["streak"]
            with cols[j]:
                st.image(flag_url(country["code"]), use_container_width=True)
                total = p["correct"] + p["wrong"]
                if streak >= 3:
                    label = f"✅ {country['ja']}"
                elif total > 0:
                    acc = int(p["correct"] / total * 100)
                    label = f"{country['ja']} ({acc}%)"
                else:
                    label = country["ja"]
                st.caption(label)


def page_flashcard(region: str, skip_mastered: bool):
    st.title("🃏 フラッシュカード")
    st.caption("国旗を見て国名を思い浮かべ、答えを確認してください")

    pool = filtered_pool(region, skip_mastered)
    if not pool:
        st.info("表示できる国がありません。フィルター設定を変更してください。")
        return

    s = st.session_state.fc_state
    if not s or s.get("advance"):
        country = pick_question(pool)
        st.session_state.fc_state = {"country": country, "revealed": False, "advance": False}
        s = st.session_state.fc_state

    country = s["country"]
    _, col, _ = st.columns([1, 2, 1])
    with col:
        st.image(flag_url(country["code"]), use_container_width=True)
        st.markdown("")

        if not s["revealed"]:
            if st.button("答えを見る", use_container_width=True, key="fc_reveal"):
                s["revealed"] = True
                st.rerun()
        else:
            st.markdown(f"### {country['ja']}")
            st.caption(f"地域: {country['region']}")
            st.markdown("")
            c1, c2 = st.columns(2)
            with c1:
                if st.button("✅ わかった！", use_container_width=True, type="primary", key="fc_ok"):
                    record(country["code"], True)
                    s["advance"] = True
                    st.rerun()
            with c2:
                if st.button("❌ わからなかった", use_container_width=True, key="fc_ng"):
                    record(country["code"], False)
                    s["advance"] = True
                    st.rerun()


def page_flag_quiz(region: str, skip_mastered: bool):
    st.title("🎯 国旗クイズ")
    st.caption("国旗を見て、正しい国名を選んでください")

    pool = filtered_pool(region, skip_mastered)
    if len(pool) < 4:
        st.info("クイズには4カ国以上が必要です。フィルター設定を変更してください。")
        return

    s = st.session_state.fq_state
    if not s or s.get("advance"):
        country = pick_question(pool)
        choices = make_choices(country, pool)
        st.session_state.fq_state = {
            "country": country,
            "choices": choices,
            "answered": None,
            "advance": False,
        }
        s = st.session_state.fq_state

    country = s["country"]
    choices = s["choices"]

    _, col, _ = st.columns([1, 2, 1])
    with col:
        st.image(flag_url(country["code"]), use_container_width=True)
        st.markdown("")

        if s["answered"] is None:
            for ch in choices:
                if st.button(ch["ja"], key=f"fq_{ch['code']}", use_container_width=True):
                    correct = ch["code"] == country["code"]
                    record(country["code"], correct)
                    s["answered"] = correct
                    st.rerun()
        else:
            if s["answered"]:
                st.success(f"✅ 正解！  **{country['ja']}**")
            else:
                st.error(f"❌ 不正解。正解は **{country['ja']}** でした。")
            st.markdown("")
            if st.button("次の問題へ →", use_container_width=True, type="primary", key="fq_next"):
                s["advance"] = True
                st.rerun()


def page_reverse_quiz(region: str, skip_mastered: bool):
    st.title("🔄 逆クイズ")
    st.caption("国名を見て、正しい国旗を選んでください")

    pool = filtered_pool(region, skip_mastered)
    if len(pool) < 4:
        st.info("クイズには4カ国以上が必要です。フィルター設定を変更してください。")
        return

    s = st.session_state.rq_state
    if not s or s.get("advance"):
        country = pick_question(pool)
        choices = make_choices(country, pool)
        st.session_state.rq_state = {
            "country": country,
            "choices": choices,
            "selected": None,
            "advance": False,
        }
        s = st.session_state.rq_state

    country = s["country"]
    choices = s["choices"]

    st.markdown(f"## この国の国旗はどれ？")
    st.markdown(f"# 🌍 {country['ja']}")
    st.markdown("")

    cols = st.columns(4)
    for i, ch in enumerate(choices):
        with cols[i]:
            st.image(flag_url(ch["code"]), use_container_width=True)

            if s["selected"] is None:
                if st.button(f"選択 {i+1}", key=f"rq_{ch['code']}", use_container_width=True):
                    correct = ch["code"] == country["code"]
                    record(country["code"], correct)
                    s["selected"] = {"code": ch["code"], "correct": correct}
                    st.rerun()
            else:
                sel = s["selected"]
                if ch["code"] == country["code"]:
                    st.success("✅ 正解")
                elif ch["code"] == sel["code"] and not sel["correct"]:
                    st.error("❌ 不正解")
                else:
                    st.caption(ch["ja"])

    if s["selected"] is not None:
        st.markdown("")
        if s["selected"]["correct"]:
            st.success(f"✅ 正解！ **{country['ja']}** の国旗です。")
        else:
            st.error(f"❌ 不正解。正解は **{country['ja']}** の国旗です。")
        st.markdown("")
        if st.button("次の問題へ →", use_container_width=True, type="primary", key="rq_next"):
            s["advance"] = True
            st.rerun()


def page_stats(region: str):
    st.title("📊 学習成績")

    pool = filtered_pool(region, False)
    total = len(pool)
    mastered = mastered_count(pool)
    attempted_list = [c for c in pool if (st.session_state.progress[c["code"]]["correct"] + st.session_state.progress[c["code"]]["wrong"]) > 0]
    attempted = len(attempted_list)
    total_c = sum(st.session_state.progress[c["code"]]["correct"] for c in pool)
    total_w = sum(st.session_state.progress[c["code"]]["wrong"] for c in pool)

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("総国数", total)
    c2.metric("習得済み ✅", mastered, f"{mastered/total*100:.0f}%")
    c3.metric("学習中 📚", attempted - mastered)
    c4.metric("未学習 ⬜", total - attempted)

    if total_c + total_w > 0:
        acc = total_c / (total_c + total_w)
        st.progress(acc, text=f"全体正解率: {acc*100:.1f}%　（正解 {total_c} / {total_c + total_w} 問）")

    st.divider()

    weak = sorted(
        attempted_list,
        key=lambda c: (
            st.session_state.progress[c["code"]]["correct"]
            / (st.session_state.progress[c["code"]]["correct"] + st.session_state.progress[c["code"]]["wrong"])
        ),
    )[:10]

    if weak:
        st.subheader("苦手な国旗 TOP 10")
        cols = st.columns(5)
        for i, country in enumerate(weak):
            p = st.session_state.progress[country["code"]]
            tot = p["correct"] + p["wrong"]
            acc = p["correct"] / tot * 100
            with cols[i % 5]:
                st.image(flag_url(country["code"]), use_container_width=True)
                st.caption(f"{country['ja']}\n{acc:.0f}% 正解")
    else:
        st.info("まだ学習データがありません。クイズを始めましょう！")

    st.divider()
    if st.button("🗑️ 成績をリセット", type="secondary"):
        st.session_state.progress = {
            c["code"]: {"correct": 0, "wrong": 0, "streak": 0} for c in COUNTRIES
        }
        st.session_state.fc_state = {}
        st.session_state.fq_state = {}
        st.session_state.rq_state = {}
        st.success("成績をリセットしました。")
        st.rerun()


# ===== メイン =====

def main():
    init_state()

    st.sidebar.title("🌍 国旗学習アプリ")
    st.sidebar.markdown("---")

    mode = st.sidebar.radio(
        "モードを選択",
        ["📖 図鑑", "🃏 フラッシュカード", "🎯 国旗クイズ", "🔄 逆クイズ", "📊 成績"],
        label_visibility="collapsed",
    )

    st.sidebar.markdown("---")
    st.sidebar.subheader("フィルター")

    regions = ["全て"] + sorted(set(c["region"] for c in COUNTRIES))
    region = st.sidebar.selectbox("地域", regions)

    skip_mastered = False
    if mode != "📖 図鑑" and mode != "📊 成績":
        skip_mastered = st.sidebar.checkbox("習得済みを除外する", value=False)

    # 進捗サマリー
    pool = filtered_pool(region, False)
    total = len(pool)
    mastered = mastered_count(pool)
    st.sidebar.markdown("---")
    st.sidebar.caption(f"習得済み: {mastered} / {total} カ国")
    st.sidebar.progress(mastered / total if total else 0)

    if mode == "📖 図鑑":
        page_encyclopedia(region)
    elif mode == "🃏 フラッシュカード":
        page_flashcard(region, skip_mastered)
    elif mode == "🎯 国旗クイズ":
        page_flag_quiz(region, skip_mastered)
    elif mode == "🔄 逆クイズ":
        page_reverse_quiz(region, skip_mastered)
    elif mode == "📊 成績":
        page_stats(region)


if __name__ == "__main__":
    main()
