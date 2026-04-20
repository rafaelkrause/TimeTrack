# Créditos e terceiros

Esta página lista todas as bibliotecas, fontes, ícones e conteúdos de terceiros usados pelo Job Tracker, para manter a atribuição transparente e facilitar auditorias de licença.

## Dependências de runtime (Python)

Todas instaladas via `pip install -e .`.

| Pacote | Versão | Licença | Função no projeto |
|---|---|---|---|
| [Flask](https://flask.palletsprojects.com/) | `>=3.0` | BSD-3-Clause | Framework web (servidor, rotas, templates Jinja2) |
| [Flask-Babel](https://python-babel.github.io/flask-babel/) | `>=4.0` | BSD-3-Clause | Internacionalização (pt-BR + EN) |
| [pystray](https://github.com/moses-palmer/pystray) | `>=0.19` | LGPL-3.0 | Ícone na bandeja do sistema |
| [Pillow](https://python-pillow.org/) | `>=10.0` | MIT-CMU (HPND) | Renderização do ícone da bandeja (dependência do `pystray`) |

!!! info "Dependências transitivas"
    Flask traz consigo `Werkzeug`, `Jinja2`, `itsdangerous`, `click`, `blinker` e `MarkupSafe` (todas BSD/MIT, do ecossistema Pallets). Flask-Babel traz `Babel` e `pytz`.

## Front-end (carregado via CDN)

Nenhum bundler é usado — os assets vêm direto do jsDelivr e são referenciados em `app/templates/base.html`.

| Asset | Versão | Licença | Origem |
|---|---|---|---|
| [Bootstrap](https://getbootstrap.com/) (CSS + JS bundle) | `5.3.3` | MIT | `cdn.jsdelivr.net/npm/bootstrap@5.3.3` |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | `1.11.3` | MIT | `cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3` |

## Fontes

A aplicação **não carrega fontes externas**. A UI usa a stack de fontes do sistema operacional, herdada do Bootstrap 5:

```
system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
"Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
```

A página de foco (`/focus`) usa explicitamente `system-ui, sans-serif`.

Essa escolha mantém o footprint baixo (sem requisições de rede para fontes), respeita as preferências do usuário e elimina implicações de licenciamento de webfonts.

## Ícones

Todos os ícones vêm do [Bootstrap Icons](https://icons.getbootstrap.com/) (MIT). Glifos atualmente usados:

`clock-history`, `gear`, `translate`, `circle-half`, `moon-stars-fill`, `sun-fill`, `pause-fill`, `play-fill`, `stop-fill`, `chevron-left`, `chevron-right`, `filetype-csv`, `clipboard`, `trash`, `pencil`, `pencil-square`, `check-lg`, `download`, `plus`, `x`, `exclamation-triangle`.

## Frases motivacionais

As frases curtas exibidas após **pausar** e **finalizar** uma atividade estão em `app/data/` e são servidas pela rota `GET /api/phrase/<categoria>`:

| Arquivo | Idioma | Categorias | Total |
|---|---|---|---|
| `phrases_pt_br.json` | pt-BR | `pause`, `stop` | 20 + 20 |
| `phrases_en.json` | EN | `pause`, `stop` | 20 + 20 |

As frases são **conteúdo original**, escritas para este projeto e distribuídas sob a mesma licença MIT do código. Podem ser desabilitadas pela configuração `phrases_enabled` (a API passa a retornar `{"phrase": null}`).

## Empacotamento e instalador

| Ferramenta | Versão | Onde entra |
|---|---|---|
| [Hatchling](https://hatch.pypa.io/) | — | Backend de build PEP 517 (wheel/sdist) |
| [NSIS](https://nsis.sourceforge.io/) | — | Compilador do instalador Windows (`installer.nsi`) |
| [NSSM](https://nssm.cc/) | `2.24` | Wrapper opcional de serviço do Windows (embutido no instalador) |
| [Python embeddable](https://www.python.org/downloads/) | `3.11` | Runtime Python portátil dentro do instalador Windows |

O instalador remoto (`install-remote.sh`) usa apenas `curl` e `python3 -m venv` do host — não adiciona dependências além das listadas em "runtime".

## Ferramentas de desenvolvimento e docs

Disponíveis no extra `[dev]` do `pyproject.toml`.

| Ferramenta | Uso |
|---|---|
| [ruff](https://docs.astral.sh/ruff/) `>=0.6` | Lint + formatação |
| [mypy](https://mypy.readthedocs.io/) `>=1.11` | Checagem de tipos |
| [pytest](https://docs.pytest.org/) `>=8.0` + [pytest-cov](https://pytest-cov.readthedocs.io/) `>=5.0` | Testes + cobertura |
| [pre-commit](https://pre-commit.com/) `>=3.8` | Orquestração de hooks do Git |
| [Babel](https://babel.pocoo.org/) `>=2.16` | Extração/atualização/compilação dos catálogos `.po`/`.mo` |
| [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) `>=9.5` | Tema desta documentação |
| [mkdocs-static-i18n](https://github.com/ultrabug/mkdocs-static-i18n) `>=1.2` | Docs bilíngues (pt-BR + EN) |

O site de documentação também utiliza [Material Design Icons](https://pictogrammers.com/library/mdi/) e [Font Awesome](https://fontawesome.com/) (marcas), ambos distribuídos junto do MkDocs Material.

## Assistência de IA

O desenvolvimento foi auxiliado pelo [Claude Code](https://claude.ai/claude-code) (Anthropic). O conteúdo final é revisado e aprovado pelos mantenedores do projeto.

## Licença

O código do Job Tracker é distribuído sob a [licença MIT](https://github.com/rafaelkrause/job_tracker/blob/main/LICENSE). Os componentes de terceiros listados acima permanecem sob suas respectivas licenças originais.
