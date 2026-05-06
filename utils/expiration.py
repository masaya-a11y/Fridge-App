from datetime import date


def get_days_until_expiration(expiry_date_str: str) -> int:
    expiry = date.fromisoformat(expiry_date_str[:10])
    return (expiry - date.today()).days


def get_status(expiry_date_str: str, alert_days: dict) -> tuple[str, str, str]:
    """Returns (status_key, label, color_hex)"""
    days = get_days_until_expiration(expiry_date_str)
    if days < 0:
        return "expired",  "期限切れ",    "#6b7280"
    if days <= alert_days.get("critical", 1):
        return "critical", "今すぐ使って", "#ef4444"
    if days <= alert_days.get("warning", 3):
        return "warning",  "もうすぐ期限", "#f97316"
    if days <= alert_days.get("soon", 7):
        return "soon",     "期限が近い",   "#eab308"
    return "ok", "新鮮", "#22c55e"


def format_days(days: int) -> str:
    if days < 0:
        return f"{abs(days)}日超過"
    if days == 0:
        return "今日まで"
    if days == 1:
        return "残り1日"
    return f"残り{days}日"


STATUS_BG = {
    "expired":  "#f3f4f6",
    "critical": "#fee2e2",
    "warning":  "#ffedd5",
    "soon":     "#fefce8",
    "ok":       "#f0fdf4",
}

STATUS_BORDER = {
    "expired":  "#d1d5db",
    "critical": "#fca5a5",
    "warning":  "#fdba74",
    "soon":     "#fde047",
    "ok":       "#86efac",
}
