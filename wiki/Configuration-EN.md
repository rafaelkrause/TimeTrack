# Configuration

Complete reference of Job Tracker configuration options.

> 🇧🇷 Português: [Configuration](Configuration.md).

## `config.json` location

| Platform | Path |
|---|---|
| Linux / macOS | `config.json` at the project root |
| Windows (installer) | `%APPDATA%\JobTracker\config.json` |

Generated automatically on first run. Edit directly or via **Configurações** (Settings) in the UI.

## Full structure

```json
{
  "shifts": {
    "monday":    [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "18:00"}],
    "tuesday":   [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "18:00"}],
    "wednesday": [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "18:00"}],
    "thursday":  [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "18:00"}],
    "friday":    [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "18:00"}],
    "saturday":  [],
    "sunday":    []
  },
  "theme": "auto",
  "port": 5000,
  "target_percentage": 90
}
```

## Reference

### `shifts` (object)

Shifts per weekday. Keys are lowercase English: `monday`, `tuesday`, …, `sunday`.

Each day is a **list** of blocks; each block has:

| Field | Type | Format |
|---|---|---|
| `start` | string | `HH:MM` (24h) |
| `end` | string | `HH:MM` (24h), greater than `start` |

- An empty list `[]` means a free day (no target).
- Multiple blocks let you model a lunch break.
- Server-side validation rejects malformed values.

### `theme` (string)

One of: `"light"`, `"dark"`, `"auto"`.
- `auto` follows OS preference via `prefers-color-scheme`.
- The UI also persists the current choice in `localStorage` (key `jt-theme`).

### `port` (number)

Local HTTP port. Default `5000`. Change if it conflicts with another service (e.g. `5050`).

Restart the server after changing.

### `target_percentage` (number, 0–100)

Target percentage of the day's shift to be logged. Default `90`.
Used by the dashboard progress bar and target indicator.

## Validation & safety

- Unknown keys are silently ignored.
- Values with the wrong type are rejected (HTTP 400).
- Writes are **atomic**: temp file → `fsync` → `os.replace()`. On Linux, the directory is also fsynced to guarantee persistence.
- Request body limit: 64 KB.

## Edit via API

```bash
curl -X PUT http://localhost:5000/api/config \
     -H "Content-Type: application/json" \
     -d '{"theme": "dark", "target_percentage": 95}'
```

```bash
curl -X PUT http://localhost:5000/api/shifts \
     -H "Content-Type: application/json" \
     -d @my-shifts.json
```

## Reset to defaults

Delete `config.json` and restart. The file is regenerated with defaults on next startup.

```bash
rm config.json
python3 run.py
```

> ⚠️ This does **not** remove your data in `data/`. Only the configuration.
