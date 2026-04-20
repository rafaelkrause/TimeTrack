"""CLI entry point. Used by the `job-tracker` console script and
`python -m app`. The legacy `run.py` at the project root delegates here."""

from __future__ import annotations

import socket
import sys
import threading
import time
import webbrowser

from app import create_app, get_user_data_dir
from app.config import load_config


def _open_browser_when_ready(url: str, host: str, port: int, timeout: float = 5.0) -> None:
    """Poll the Flask port until it accepts connections, then open the browser.
    Runs in a background thread so it doesn't block server startup."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=0.25):
                webbrowser.open(url)
                return
        except OSError:
            time.sleep(0.1)
    # Port never came up; open anyway as a best effort.
    webbrowser.open(url)


def main() -> None:
    config_path = get_user_data_dir() / "config.json"
    config = load_config(str(config_path))
    app = create_app(config)
    port = config.get("port", 5000)
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    open_browser = "--no-browser" not in sys.argv

    tray_available = False
    try:
        import pystray  # noqa: F401
        from PIL import Image  # noqa: F401

        tray_available = True
    except ImportError:
        pass

    if open_browser:
        threading.Thread(
            target=_open_browser_when_ready,
            args=(url, host, port),
            daemon=True,
        ).start()

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
        print("(No window manager detected — running without system tray)")
        app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()
