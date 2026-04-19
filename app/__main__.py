"""CLI entry point. Used by the `job-tracker` console script and
`python -m app`. The legacy `run.py` at the project root delegates here."""

from __future__ import annotations

import sys
import threading
import webbrowser

from app import create_app, get_user_data_dir
from app.config import load_config


def main() -> None:
    config_path = get_user_data_dir() / "config.json"
    config = load_config(str(config_path))
    app = create_app(config)
    port = config.get("port", 5000)
    host = "127.0.0.1"
    url = f"http://{host}:{port}"

    tray_available = False
    try:
        import pystray  # noqa: F401
        from PIL import Image  # noqa: F401

        tray_available = True
    except ImportError:
        pass

    if tray_available:
        from app.tray import start_tray

        web_thread = threading.Thread(
            target=lambda: app.run(host=host, port=port, debug=False, use_reloader=False),
            daemon=True,
        )
        web_thread.start()
        print(f"Job Tracker running at {url}")
        start_tray(url, app)
    else:
        print(f"Job Tracker running at {url}")
        print("(Install pystray and Pillow for system tray support)")
        if "--no-browser" not in sys.argv:
            webbrowser.open(url)
        app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()
