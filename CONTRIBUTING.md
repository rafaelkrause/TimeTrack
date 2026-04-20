🇬🇧 English / [🇧🇷 Português](CONTRIBUTING.pt-BR.md)

# Contributing to `TimeTrack`

Thank you for considering a contribution! This document describes how to get the
project running locally, the conventions we follow, and what to expect from the
review process.

## Getting started

```bash
git clone https://github.com/rafaelkrause/TimeTrack.git
cd TimeTrack

python3 -m venv .venv
source .venv/bin/activate

pip install -e ".[dev,tray]"
pre-commit install
```

## Running the app

```bash
python3 run.py --no-browser
# or, after the editable install:
timetrack --no-browser
```

The server listens on `http://127.0.0.1:5000`.

## Running tests

```bash
pytest --cov=app --cov-report=term-missing
```

Coverage must stay at **≥70%**. Add or update tests for any behavior you change.

## Code style

- **Lint + format:** [ruff](https://docs.astral.sh/ruff/).
- **Types:** [mypy](https://mypy.readthedocs.io/) (progressive — type the code you
  touch, don't feel obliged to retrofit the whole repo).

```bash
ruff check .
ruff format .
mypy app
```

`pre-commit` runs the lint and format checks on every commit.

## Commit convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `test:` — tests only
- `chore:` — tooling, dependencies, housekeeping
- `ci:` — CI/CD pipeline changes
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `style:` — formatting, missing semicolons, etc.
- `build:` — build system, packaging

## Pull request flow

1. Fork the repo and create a branch: `feat/short-description` or `fix/short-description`.
2. Make sure tests pass locally (`ruff check . && ruff format . && mypy app && pytest`).
3. Open a PR and fill in the template.
4. Wait for human review. The single maintainer is listed in
   [`.github/CODEOWNERS`](.github/CODEOWNERS).

## Internationalization

If you changed any user-facing string, update the gettext catalogs:

```bash
pybabel extract -F app/i18n/babel.cfg -o app/i18n/messages.pot app/
pybabel update -i app/i18n/messages.pot -d app/i18n
# edit the .po files for each locale, then:
pybabel compile -d app/i18n
```

All user-visible strings must go through `_()` / `gettext()` in Python and
`{{ _('...') }}` in Jinja templates. Never hard-code a string that the user will
see.

## AI-assisted contributions

Code generated with AI assistants (Claude, Copilot, Cursor, etc.) is welcome,
**but** the human author of the PR is responsible for:

- Reading and understanding every line before pushing.
- Adding tests that exercise the new behavior.
- Disclosing the assistance in the PR checkbox.

## License acknowledgement

By contributing to this project, you agree to license your contribution under
the terms of the [MIT License](LICENSE).
