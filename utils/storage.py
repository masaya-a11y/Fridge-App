import json
import uuid
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

INGREDIENTS_FILE = DATA_DIR / "ingredients.json"
FAVORITES_FILE   = DATA_DIR / "favorites.json"
SETTINGS_FILE    = DATA_DIR / "settings.json"

DEFAULT_SETTINGS = {
    "tastePreference": "",
    "spiceLevel": "medium",
    "defaultServings": 2,
    "alertDays": {"critical": 1, "warning": 3, "soon": 7},
    "avoidIngredients": "",
    "cookingSkill": "intermediate",
    "apiKey": "",
}


def _load(path, default):
    try:
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        pass
    return default


def _save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ── 食材 ──────────────────────────────────────
def load_ingredients():
    return _load(INGREDIENTS_FILE, [])


def save_ingredients(items):
    _save(INGREDIENTS_FILE, items)


def add_ingredient(data: dict):
    items = load_ingredients()
    now = datetime.now().isoformat()
    item = {"id": str(uuid.uuid4()), "createdAt": now, "updatedAt": now, **data}
    items.append(item)
    save_ingredients(items)
    return item


def update_ingredient(id: str, updates: dict):
    items = load_ingredients()
    for i, item in enumerate(items):
        if item["id"] == id:
            items[i] = {**item, **updates, "updatedAt": datetime.now().isoformat()}
            break
    save_ingredients(items)


def remove_ingredient(id: str):
    items = [i for i in load_ingredients() if i["id"] != id]
    save_ingredients(items)


def consume_ingredients(usages: list[dict]):
    """usages: [{"ingredientId": str, "amount": float}]"""
    items = load_ingredients()
    id_map = {u["ingredientId"]: u["amount"] for u in usages}
    updated = []
    for item in items:
        amount = id_map.get(item["id"], 0)
        new_qty = max(0, item["quantity"] - amount)
        if new_qty > 0:
            updated.append({**item, "quantity": new_qty, "updatedAt": datetime.now().isoformat()})
    save_ingredients(updated)


# ── お気に入り ─────────────────────────────────
def load_favorites():
    return _load(FAVORITES_FILE, [])


def save_favorites(favorites):
    _save(FAVORITES_FILE, favorites)


def add_favorite(recipe: dict):
    favs = load_favorites()
    if any(f["recipe"]["title"] == recipe["title"] for f in favs):
        return False
    favs.append({
        "id": str(uuid.uuid4()),
        "recipe": recipe,
        "feedbacks": [],
        "userPhotoData": None,
        "savedAt": datetime.now().isoformat(),
    })
    save_favorites(favs)
    return True


def remove_favorite(id: str):
    favs = [f for f in load_favorites() if f["id"] != id]
    save_favorites(favs)


def add_feedback_to_favorite(fav_id: str, comment: str, adjustment: str, rating: int):
    favs = load_favorites()
    for fav in favs:
        if fav["id"] == fav_id:
            fav["feedbacks"].append({
                "id": str(uuid.uuid4()),
                "comment": comment,
                "adjustment": adjustment,
                "rating": rating,
                "createdAt": datetime.now().isoformat(),
            })
            break
    save_favorites(favs)


def update_favorite_photo(fav_id: str, photo_data: str):
    favs = load_favorites()
    for fav in favs:
        if fav["id"] == fav_id:
            fav["userPhotoData"] = photo_data
            break
    save_favorites(favs)


# ── 設定 ──────────────────────────────────────
def load_settings():
    saved = _load(SETTINGS_FILE, {})
    return {**DEFAULT_SETTINGS, **saved}


def save_settings(settings: dict):
    _save(SETTINGS_FILE, settings)
