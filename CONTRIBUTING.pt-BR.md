[🇬🇧 English](CONTRIBUTING.md) / 🇧🇷 Português

# Contribuindo com o `TimeTrack`

Obrigado por considerar uma contribuição! Este documento descreve como rodar o
projeto localmente, as convenções que seguimos e o que esperar do processo de
revisão.

## Primeiros passos

```bash
git clone https://github.com/rafaelkrause/TimeTrack.git
cd TimeTrack

python3 -m venv .venv
source .venv/bin/activate

pip install -e ".[dev,tray]"
pre-commit install
```

## Executando a aplicação

```bash
python3 run.py --no-browser
# ou, após a instalação editável:
timetrack --no-browser
```

O servidor escuta em `http://127.0.0.1:5000`.

## Rodando os testes

```bash
pytest --cov=app --cov-report=term-missing
```

A cobertura deve se manter em **≥70%**. Adicione ou atualize testes para
qualquer comportamento que você alterar.

## Estilo de código

- **Lint + formatação:** [ruff](https://docs.astral.sh/ruff/).
- **Tipos:** [mypy](https://mypy.readthedocs.io/) (progressivo — tipe o código
  que você tocar, sem obrigação de tipar o repositório inteiro).

```bash
ruff check .
ruff format .
mypy app
```

O `pre-commit` roda as checagens de lint e formatação em cada commit.

## Convenção de commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — nova funcionalidade
- `fix:` — correção de bug
- `docs:` — apenas documentação
- `test:` — apenas testes
- `chore:` — tooling, dependências, manutenção
- `ci:` — mudanças de pipeline CI/CD
- `refactor:` — mudança de código que não corrige bug nem adiciona feature
- `style:` — formatação, ponto-e-vírgula ausente, etc.
- `build:` — sistema de build, packaging

## Fluxo de pull request

1. Fork do repositório e crie uma branch: `feat/descricao-curta` ou
   `fix/descricao-curta`.
2. Garanta que os testes passam localmente
   (`ruff check . && ruff format . && mypy app && pytest`).
3. Abra o PR e preencha o template.
4. Aguarde revisão humana. O único mantenedor está listado em
   [`.github/CODEOWNERS`](.github/CODEOWNERS).

## Internacionalização

Se você alterou alguma string visível ao usuário, atualize os catálogos gettext:

```bash
pybabel extract -F app/i18n/babel.cfg -o app/i18n/messages.pot app/
pybabel update -i app/i18n/messages.pot -d app/i18n
# edite os arquivos .po de cada idioma, depois:
pybabel compile -d app/i18n
```

Toda string visível ao usuário deve passar por `_()` / `gettext()` em Python e
`{{ _('...') }}` em templates Jinja. Nunca hardcode uma string que o usuário vá
ver.

## Contribuições com assistência de IA

Código gerado com assistentes de IA (Claude, Copilot, Cursor, etc.) é
bem-vindo, **mas** o autor humano do PR é responsável por:

- Ler e entender cada linha antes de fazer push.
- Adicionar testes que exercitem o novo comportamento.
- Declarar a assistência na checkbox do template do PR.

## Licenciamento

Ao contribuir com este projeto, você concorda em licenciar sua contribuição sob
os termos da [Licença MIT](LICENSE).
