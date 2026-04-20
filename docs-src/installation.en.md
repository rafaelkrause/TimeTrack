# Installation

Straight path: pick your platform, install, done. The last block is for contributors who want the source.

## Windows — `.exe` installer (recommended)

**[⬇ Download `TimeTrack-Setup.exe`](https://github.com/rafaelkrause/TimeTrack/releases/latest)**

1. Run the `.exe`. If SmartScreen blocks it, click **More info → Run anyway** (the installer is not code-signed yet).
2. The wizard asks about: desktop shortcut, Start Menu entry, and the optional **Windows service** component (NSSM).
3. When it finishes, the app opens at `http://localhost:5000`. For later runs, launch from the Start Menu or the desktop shortcut.

Details:

- **Per-user install** (no UAC). Target: `%LOCALAPPDATA%\Programs\TimeTrack`.
- **Embedded Python** — nothing is installed system-wide.
- **Data**: `%APPDATA%\TimeTrack` (preserved across updates).

## Linux / macOS — remote installer (recommended)

**[⬇ Download `install-remote.sh`](https://raw.githubusercontent.com/rafaelkrause/TimeTrack/main/install-remote.sh)** or run directly:

```bash
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/TimeTrack/main/install-remote.sh | bash
```

The script does everything: downloads the latest release wheel, creates an isolated virtualenv, installs the dependencies, and drops a `timetrack` launcher on your `PATH`.

Then:

```bash
timetrack              # opens the browser at http://localhost:5000
timetrack --no-browser # start the server only
```

### Prerequisite: Python 3.10+

The script fails early if `python3 --version` is below 3.10. If you need to install it:

```bash
# Ubuntu/Debian
sudo apt install python3 python3-venv

# Fedora
sudo dnf install python3 python3-virtualenv

# macOS (Homebrew)
brew install python@3.11
```

Or grab the official installer at [python.org/downloads](https://www.python.org/downloads/).

### What gets created

| Path | Content |
|---|---|
| `~/.local/share/timetrack/.venv/` | Isolated Python environment |
| `~/.local/share/timetrack/user/` | `config.json` + `data/YYYY-MM.json` (your data) |
| `~/.local/bin/timetrack` | Launcher on `PATH` |
| `~/.local/share/applications/timetrack.desktop` | App-menu entry (Linux) |

If `~/.local/bin` is not on your `PATH`, the script warns you and prints the line to add to `~/.bashrc` or `~/.zshrc`.

### Autostart (optional)

The `--service` flag registers TimeTrack with the OS-native service manager:

- **Linux:** `systemd --user` unit at `~/.config/systemd/user/timetrack.service`, enabled automatically. Starts at login.
- **macOS:** a `LaunchAgent` at `~/Library/LaunchAgents/com.rafaelkrause.timetrack.plist`, loaded via `launchctl`. Starts at login.

```bash
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/TimeTrack/main/install-remote.sh | bash -s -- --service
```

To enable autostart on an existing installation (without reinstalling), just re-run the command above — the script detects the existing install and only adds the service.

### Options (environment variables)

```bash
# Pin a specific version (default: latest release)
TT_VERSION=0.1.0 curl -fsSL .../install-remote.sh | bash

# Custom install prefix
TT_PREFIX=/opt/timetrack curl -fsSL .../install-remote.sh | bash
```

### Uninstall

```bash
# Keeps your data at ~/.local/share/timetrack/user/
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/TimeTrack/main/install-remote.sh | bash -s -- --uninstall

# Also wipes user data (irreversible)
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/TimeTrack/main/install-remote.sh | bash -s -- --uninstall --purge-data
```

The uninstaller stops and removes the service (if present), then deletes the launcher, menu entry and virtualenv.

### Note on macOS (v0.1.0)

Windows ships a double-click `.exe` installer with a common-user experience; delivering the same level on macOS would require a packaged `.app`, an Apple Developer account (US$99/year), and notarization. Without that, Gatekeeper blocks the app as "unidentified developer".

v0.1.0 therefore uses the `curl | bash` path — the same pattern used by Homebrew, oh-my-zsh and Rust/rustup.

## From source (contributors / experts)

For development, modifications, or running before a release has been published:

```bash
git clone https://github.com/rafaelkrause/TimeTrack.git
cd TimeTrack
./install.sh            # creates .venv and installs dependencies (flask, flask-babel, pystray, Pillow)
./timetrack.sh        # run
```

Manual alternative:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"   # editable install + dev tooling
python3 run.py
```

### Windows — manual (no installer)

1. Install [Python 3.10+](https://www.python.org/downloads/windows/). Check **Add Python to PATH**.
2. Download the code (release ZIP or `git clone`).
3. Open PowerShell in the project folder:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

### Build the Windows installer from source

Only needed if you want to customize the Windows installer. Runs on a Linux host:

```bash
sudo apt install nsis
./installer/build_installer.sh 1.0.0
# output: installer/TimeTrack-Setup-1.0.0.exe
```

The workflow `.github/workflows/build-installer.yml` does this automatically when a `v*` tag is pushed.

## Update

- **Windows**: run the new `TimeTrack-Setup-X.Y.Z.exe`. Data and configuration under `%APPDATA%\TimeTrack` are preserved.
- **Linux / macOS (remote installer)**: re-run `install-remote.sh` — it detects the existing virtualenv, downloads the new version, reinstalls the wheel, and preserves your data at `~/.local/share/timetrack/user/`.
- **From source**: `git pull && source .venv/bin/activate && pip install -r requirements.txt --upgrade`.

## Requirements (summary)

| System | Requirements |
|---|---|
| Windows (installer) | None — bundled Python |
| Windows (manual) | Python 3.10+ |
| Linux / macOS | Python 3.10+, `curl`, `bash` |
