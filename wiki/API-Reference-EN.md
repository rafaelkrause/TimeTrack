# API Reference

HTTP endpoints served by the local Job Tracker. All relative to `http://localhost:5000` (or the configured port).

> 🇧🇷 Português: [API-Reference](API-Reference.md).

## Conventions

- Content type: `application/json` (except CSV/TSV export).
- Dates: `YYYY-MM-DD` (ISO 8601, date only).
- Times: `HH:MM` (24h).
- Internal timestamps: ISO 8601 with timezone offset (`2026-04-19T14:32:10-03:00`).
- Max body size: **64 KB** (`MAX_CONTENT_LENGTH`).

## Activities

### `POST /api/activity/start`

Starts a new activity. If another one is in progress (active or paused), it is **finalized automatically** first.

**Body**
```json
{ "description": "Client XYZ meeting" }
```

**Validation**
- `description` required, string, up to 500 chars.

**Response 201**
```json
{
  "id": "a1b2c3",
  "description": "Client XYZ meeting",
  "start": "2026-04-19T09:00:00-03:00",
  "state": "active",
  "pauses": []
}
```

### `POST /api/activity/pause`

Pauses the current activity. No body. `404` if none is active.

### `POST /api/activity/resume`

Resumes a paused activity. No body. `404` if none is paused.

### `POST /api/activity/stop`

Finalizes the current activity (active or paused). No body.

### `GET /api/activity/current`

Returns the in-progress activity (`active` or `paused`), or `null` if none.

```json
{
  "id": "a1b2c3",
  "description": "Client XYZ meeting",
  "start": "2026-04-19T09:00:00-03:00",
  "state": "active",
  "pauses": [
    {"start": "2026-04-19T09:10:00-03:00", "end": "2026-04-19T09:15:00-03:00"}
  ],
  "duration_minutes": 25
}
```

> `duration_minutes` = elapsed time (so far) minus paused time.

## Dashboard

### `GET /api/dashboard?date=YYYY-MM-DD`

Aggregated data for a day. `date` defaults to today.

```json
{
  "date": "2026-04-19",
  "activities": [ /* day's activities */ ],
  "current": { /* current activity or null */ },
  "shift": {
    "blocks": [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "18:00"}],
    "total_minutes": 480,
    "elapsed_minutes": 210
  },
  "total_logged_minutes": 185,
  "target_percentage": 90
}
```

## Configuration

### `GET /api/shifts`

Returns the current `shifts` object.

### `PUT /api/shifts`

Replaces all shifts. Body must contain the complete `shifts` object.

### `PUT /api/config`

Updates configuration fields. Body may contain any subset of valid keys: `theme`, `port`, `target_percentage`.

Unknown keys are ignored.

## Export

### `GET /api/export?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|tsv`

Exports **completed** activities in the range, in the requested format (`csv` or `tsv`).

Response `200` with:
- `Content-Type: text/csv` or `text/tab-separated-values`
- `Content-Disposition: attachment; filename="jobtracker_YYYY-MM-DD_YYYY-MM-DD.csv"`

Fields: date, description, start, end, duration (minutes).

## Error codes

| Code | Meaning |
|---|---|
| `400` | Invalid body, malformed date/time, missing field |
| `404` | Activity not found in the expected state |
| `413` | Body over 64 KB |
| `500` | Internal error (check server logs) |

## `curl` examples

```bash
# Start
curl -X POST http://localhost:5000/api/activity/start \
     -H "Content-Type: application/json" \
     -d '{"description": "Client email"}'

# Pause
curl -X POST http://localhost:5000/api/activity/pause

# Current activity
curl http://localhost:5000/api/activity/current

# Day's dashboard
curl "http://localhost:5000/api/dashboard?date=2026-04-19"

# Export week as TSV
curl "http://localhost:5000/api/export?from=2026-04-14&to=2026-04-19&format=tsv" \
     -o week.tsv
```
