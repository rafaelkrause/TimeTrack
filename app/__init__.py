import os
import sys
from pathlib import Path

from flask import Flask, request
from flask_babel import Babel, get_locale

SUPPORTED_LOCALES = ("pt_BR", "en")
DEFAULT_LOCALE = "pt_BR"


def get_user_data_dir() -> Path:
    """Resolve the directory holding config.json and data/.

    Priority:
      1. $TIMETRACK_DATA_DIR (set by the service wrapper / explicit override)
      2. Windows installed mode → %APPDATA%\\TimeTrack
      3. ./ (project root) — dev mode (source checkout)
    """
    override = os.environ.get("TIMETRACK_DATA_DIR")
    if override:
        return Path(override).expanduser()

    project_root = Path(__file__).parent.parent
    if sys.platform == "win32" and not _is_source_checkout(project_root):
        appdata = os.environ.get("APPDATA")
        if appdata:
            return Path(appdata) / "TimeTrack"

    return project_root


def _is_source_checkout(project_root: Path) -> bool:
    """Heuristic: a source checkout has pyproject.toml or requirements.txt
    at the repo root. The Windows installer layout does not."""
    return (project_root / "pyproject.toml").exists() or (
        project_root / "requirements.txt"
    ).exists()


def _select_locale() -> str:
    """Resolve the active locale for the current request.

    Precedence:
      1. `tt-lang` cookie (set by the language toggle).
      2. Accept-Language header best match.
      3. DEFAULT_LOCALE.
    """
    cookie = request.cookies.get("tt-lang")
    if cookie and cookie in SUPPORTED_LOCALES:
        return cookie
    match = request.accept_languages.best_match(SUPPORTED_LOCALES)
    return match or DEFAULT_LOCALE


def create_app(config: dict | None = None):
    app = Flask(__name__)

    user_dir = get_user_data_dir()
    user_dir.mkdir(parents=True, exist_ok=True)

    app.config["APP_CONFIG"] = config or {}
    app.config["DATA_DIR"] = user_dir / "data"
    app.config["CONFIG_PATH"] = user_dir / "config.json"

    app.config["DATA_DIR"].mkdir(exist_ok=True)
    app.config["MAX_CONTENT_LENGTH"] = 64 * 1024  # 64 KB max request body

    app.config["BABEL_DEFAULT_LOCALE"] = DEFAULT_LOCALE
    app.config["BABEL_TRANSLATION_DIRECTORIES"] = str(Path(__file__).parent / "i18n")
    Babel(app, locale_selector=_select_locale)

    @app.context_processor
    def inject_i18n() -> dict:
        current = str(get_locale()) if get_locale() else DEFAULT_LOCALE
        return {
            "current_lang": current.replace("_", "-").lower(),
            "current_locale": current,
            "supported_locales": SUPPORTED_LOCALES,
        }

    # Cleanup data files older than 12 months
    from app.storage import Storage

    Storage(app.config["DATA_DIR"]).cleanup_old_data()

    from app.routes import bp

    app.register_blueprint(bp)

    return app
