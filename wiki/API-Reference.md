# Referência da API

Endpoints HTTP expostos pelo servidor local. Todos relativos a `http://localhost:5000` (ou a porta configurada).

> 🇬🇧 English: [API-Reference-EN](API-Reference-EN.md).

## Convenções

- Content type: `application/json` (exceto export em CSV/TSV).
- Datas: `YYYY-MM-DD` (ISO 8601 apenas data).
- Horários: `HH:MM` (24h).
- Timestamps internos: ISO 8601 com offset de fuso (`2026-04-19T14:32:10-03:00`).
- Tamanho máximo do corpo: **64 KB** (`MAX_CONTENT_LENGTH`).

## Atividades

### `POST /api/activity/start`

Inicia uma nova atividade. Se houver outra em curso (ativa ou pausada), ela é **finalizada automaticamente** antes.

**Body**
```json
{ "description": "Reunião com cliente XYZ" }
```

**Validação**
- `description` obrigatório, string, até 500 caracteres.

**Resposta 201**
```json
{
  "id": "a1b2c3",
  "description": "Reunião com cliente XYZ",
  "start": "2026-04-19T09:00:00-03:00",
  "state": "active",
  "pauses": []
}
```

### `POST /api/activity/pause`

Pausa a atividade atual. Sem body. `404` se não houver atividade ativa.

### `POST /api/activity/resume`

Retoma uma atividade pausada. Sem body. `404` se não houver atividade em pausa.

### `POST /api/activity/stop`

Finaliza a atividade atual (ativa ou pausada). Sem body.

### `GET /api/activity/current`

Retorna a atividade em andamento (`active` ou `paused`), ou `null` se não houver.

```json
{
  "id": "a1b2c3",
  "description": "Reunião com cliente XYZ",
  "start": "2026-04-19T09:00:00-03:00",
  "state": "active",
  "pauses": [
    {"start": "2026-04-19T09:10:00-03:00", "end": "2026-04-19T09:15:00-03:00"}
  ],
  "duration_minutes": 25
}
```

> `duration_minutes` = tempo decorrido (até agora) menos tempo em pausa.

## Dashboard

### `GET /api/dashboard?date=YYYY-MM-DD`

Retorna os dados agregados de um dia. `date` default: hoje.

```json
{
  "date": "2026-04-19",
  "activities": [ /* lista de atividades do dia */ ],
  "current": { /* atividade atual ou null */ },
  "shift": {
    "blocks": [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "18:00"}],
    "total_minutes": 480,
    "elapsed_minutes": 210
  },
  "total_logged_minutes": 185,
  "target_percentage": 90
}
```

## Configuração

### `GET /api/shifts`

Retorna o objeto `shifts` atual.

### `PUT /api/shifts`

Substitui todos os turnos. Body deve conter o objeto `shifts` completo.

### `PUT /api/config`

Atualiza campos de configuração. Body pode conter qualquer subconjunto das chaves válidas: `theme`, `port`, `target_percentage`.

Chaves desconhecidas são ignoradas.

## Exportação

### `GET /api/export?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|tsv`

Exporta atividades **finalizadas** no intervalo, no formato pedido (`csv` ou `tsv`).

Resposta `200` com:
- `Content-Type: text/csv` ou `text/tab-separated-values`
- `Content-Disposition: attachment; filename="jobtracker_YYYY-MM-DD_YYYY-MM-DD.csv"`

Campos: data, descrição, início, fim, duração (em minutos).

## Códigos de erro

| Código | Significado |
|---|---|
| `400` | Body inválido, data/horário malformados, campo ausente |
| `404` | Atividade não encontrada no estado esperado |
| `413` | Body maior que 64 KB |
| `500` | Erro interno (veja os logs do servidor) |

## Exemplos com `curl`

```bash
# Iniciar
curl -X POST http://localhost:5000/api/activity/start \
     -H "Content-Type: application/json" \
     -d '{"description": "Email do cliente"}'

# Pausar
curl -X POST http://localhost:5000/api/activity/pause

# Atividade atual
curl http://localhost:5000/api/activity/current

# Dashboard do dia
curl "http://localhost:5000/api/dashboard?date=2026-04-19"

# Exportar semana em TSV
curl "http://localhost:5000/api/export?from=2026-04-14&to=2026-04-19&format=tsv" \
     -o semana.tsv
```
