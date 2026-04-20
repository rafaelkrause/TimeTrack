# Credits and third-party

This page lists every library, font, icon set and bundled content used by Job Tracker, so attribution stays transparent and license audits are easy.

## Runtime dependencies (Python)

All installed via `pip install -e .`.

| Package | Version | License | Role |
|---|---|---|---|
| [Flask](https://flask.palletsprojects.com/) | `>=3.0` | BSD-3-Clause | Web framework (server, routing, Jinja2 templating) |
| [Flask-Babel](https://python-babel.github.io/flask-babel/) | `>=4.0` | BSD-3-Clause | Internationalisation (pt-BR + EN) |
| [pystray](https://github.com/moses-palmer/pystray) | `>=0.19` | LGPL-3.0 | System-tray icon |
| [Pillow](https://python-pillow.org/) | `>=10.0` | MIT-CMU (HPND) | Tray-icon rendering (`pystray` dependency) |

!!! info "Transitive dependencies"
    Flask pulls in `Werkzeug`, `Jinja2`, `itsdangerous`, `click`, `blinker`, and `MarkupSafe` (all BSD/MIT, Pallets ecosystem). Flask-Babel pulls in `Babel` and `pytz`.

## Frontend (loaded from a CDN)

No bundler is used — assets come straight from jsDelivr and are referenced in `app/templates/base.html`.

| Asset | Version | License | Source |
|---|---|---|---|
| [Bootstrap](https://getbootstrap.com/) (CSS + JS bundle) | `5.3.3` | MIT | `cdn.jsdelivr.net/npm/bootstrap@5.3.3` |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | `1.11.3` | MIT | `cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3` |

## Fonts

The application **does not load any external fonts**. The UI uses the OS's native font stack, inherited from Bootstrap 5:

```
system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
"Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
```

The focus page (`/focus`) uses `system-ui, sans-serif` explicitly.

This keeps the footprint low (no network fetch for fonts), respects the user's OS preferences, and removes any webfont-licensing surface.

## Icons

All icons come from [Bootstrap Icons](https://icons.getbootstrap.com/) (MIT). Glyphs currently referenced:

`clock-history`, `gear`, `translate`, `circle-half`, `moon-stars-fill`, `sun-fill`, `pause-fill`, `play-fill`, `stop-fill`, `chevron-left`, `chevron-right`, `filetype-csv`, `clipboard`, `trash`, `pencil`, `pencil-square`, `check-lg`, `download`, `plus`, `x`, `exclamation-triangle`.

## Motivational phrases

The short phrases shown after **pause** and **stop** actions live in `app/data/` and are served by `GET /api/phrase/<category>`:

| File | Language | Categories | Total |
|---|---|---|---|
| `phrases_pt_br.json` | pt-BR | `pause`, `stop` | 20 + 20 |
| `phrases_en.json` | EN | `pause`, `stop` | 20 + 20 |

The phrases are **original content**, written for this project and released under the same MIT license as the code. They can be disabled with the `phrases_enabled` setting (the API then returns `{"phrase": null}`).

## Packaging and installers

| Tool | Version | Where |
|---|---|---|
| [Hatchling](https://hatch.pypa.io/) | — | PEP 517 build backend (wheel/sdist) |
| [NSIS](https://nsis.sourceforge.io/) | — | Windows installer script compiler (`installer.nsi`) |
| [NSSM](https://nssm.cc/) | `2.24` | Optional Windows-service wrapper (bundled inside the installer) |
| [Python embeddable](https://www.python.org/downloads/) | `3.11` | Portable Python runtime bundled inside the Windows installer |

The remote installer (`install-remote.sh`) only uses `curl` and `python3 -m venv` from the host — it adds nothing beyond the runtime dependencies listed above.

## Development and docs tooling

Provided by the `[dev]` extra in `pyproject.toml`.

| Tool | Use |
|---|---|
| [ruff](https://docs.astral.sh/ruff/) `>=0.6` | Lint + format |
| [mypy](https://mypy.readthedocs.io/) `>=1.11` | Type checking |
| [pytest](https://docs.pytest.org/) `>=8.0` + [pytest-cov](https://pytest-cov.readthedocs.io/) `>=5.0` | Tests + coverage |
| [pre-commit](https://pre-commit.com/) `>=3.8` | Git hook orchestration |
| [Babel](https://babel.pocoo.org/) `>=2.16` | Extract / update / compile `.po`/`.mo` catalogs |
| [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) `>=9.5` | Theme for this documentation |
| [mkdocs-static-i18n](https://github.com/ultrabug/mkdocs-static-i18n) `>=1.2` | Bilingual docs (pt-BR + EN) |

The documentation site also uses [Material Design Icons](https://pictogrammers.com/library/mdi/) and [Font Awesome](https://fontawesome.com/) brand icons, both shipped with MkDocs Material.

## AI assistance

Development was assisted by [Claude Code](https://claude.ai/claude-code) (Anthropic). Final content is reviewed and approved by the project maintainers.

## License

Job Tracker itself is distributed under the [MIT license](https://github.com/rafaelkrause/job_tracker/blob/main/LICENSE). The third-party components listed above remain under their original licenses.
