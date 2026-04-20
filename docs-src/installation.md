# Instalação

Guia direto: escolha sua plataforma, instale, pronto. Para contribuidores que querem o código-fonte, o último bloco cobre clone + venv.

## Windows — instalador `.exe` (recomendado)

**[⬇ Baixe `JobTracker-Setup.exe`](https://github.com/rafaelkrause/job_tracker/releases/latest)**

1. Execute o `.exe`. Se o SmartScreen bloquear, clique em **Mais informações → Executar assim mesmo** (instalador ainda sem assinatura digital).
2. O assistente pergunta: atalho na área de trabalho, Menu Iniciar, e componente opcional de **serviço do Windows** (NSSM).
3. Ao finalizar, o app abre em `http://localhost:5000`. Em execuções seguintes, abra pelo Menu Iniciar ou pelo atalho da área de trabalho.

Detalhes:

- **Instalação por usuário** (sem UAC). Destino: `%LOCALAPPDATA%\Programs\JobTracker`.
- **Python embutido** — nada é instalado no sistema.
- **Dados**: `%APPDATA%\JobTracker` (preservados em atualizações).

## Linux / macOS — instalador remoto (recomendado)

**[⬇ Baixe `install-remote.sh`](https://raw.githubusercontent.com/rafaelkrause/job_tracker/main/install-remote.sh)** ou rode direto:

```bash
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/job_tracker/main/install-remote.sh | bash
```

O script cuida de tudo: baixa o wheel da última release, cria um virtualenv isolado, instala as dependências e drops um launcher `job-tracker` no `PATH`.

Depois:

```bash
job-tracker              # abre o navegador em http://localhost:5000
job-tracker --no-browser # só inicia o servidor
```

### Pré-requisito: Python 3.10+

O script falha cedo se `python3 --version` for menor que 3.10. Se precisar instalar:

```bash
# Ubuntu/Debian
sudo apt install python3 python3-venv

# Fedora
sudo dnf install python3 python3-virtualenv

# macOS (Homebrew)
brew install python@3.11
```

Ou use o instalador oficial em [python.org/downloads](https://www.python.org/downloads/).

### O que é criado

| Caminho | Conteúdo |
|---|---|
| `~/.local/share/job-tracker/.venv/` | Ambiente Python isolado |
| `~/.local/share/job-tracker/user/` | `config.json` + `data/YYYY-MM.json` (seus dados) |
| `~/.local/bin/job-tracker` | Launcher no `PATH` |
| `~/.local/share/applications/job-tracker.desktop` | Entrada no menu de aplicações (Linux) |

Se `~/.local/bin` não estiver no `PATH`, o script avisa e sugere a linha a adicionar no `~/.bashrc` ou `~/.zshrc`.

### Autostart (opcional)

A flag `--service` registra o serviço no padrão nativo do SO:

- **Linux:** unidade `systemd --user` em `~/.config/systemd/user/job-tracker.service`, habilitada automaticamente. Sobe no login.
- **macOS:** `LaunchAgent` em `~/Library/LaunchAgents/com.rafaelkrause.jobtracker.plist`, carregado via `launchctl`. Sobe no login.

```bash
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/job_tracker/main/install-remote.sh | bash -s -- --service
```

Para ativar o serviço depois de uma instalação sem `--service`, basta executar o comando acima novamente — o script detecta a instalação existente e só adiciona o serviço.

### Opções via variáveis de ambiente

```bash
# Versão específica (default: última release)
JT_VERSION=0.1.0 curl -fsSL .../install-remote.sh | bash

# Local de instalação customizado
JT_PREFIX=/opt/job-tracker curl -fsSL .../install-remote.sh | bash
```

### Desinstalar

```bash
# Preserva os dados em ~/.local/share/job-tracker/user/
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/job_tracker/main/install-remote.sh | bash -s -- --uninstall

# Remove também os dados (irreversível)
curl -fsSL https://raw.githubusercontent.com/rafaelkrause/job_tracker/main/install-remote.sh | bash -s -- --uninstall --purge-data
```

O desinstalador para e remove o serviço (se existir), apaga launcher, entrada do menu e virtualenv.

### Nota sobre macOS (v0.1.0)

O Windows tem instalador `.exe` com experiência double-click para usuário comum; no macOS, entregar o mesmo nível exige `.app` empacotado, conta Apple Developer (US$99/ano) e notarização. Sem isso, o Gatekeeper bloqueia com "unidentified developer".

Por isso o v0.1.0 usa o caminho `curl | bash` — mesma experiência que Homebrew, oh-my-zsh e Rust/rustup já oferecem.

## A partir do código-fonte (contribuidores / experts)

Para desenvolver, modificar ou rodar antes de ter uma release publicada:

```bash
git clone https://github.com/rafaelkrause/job_tracker.git
cd job_tracker
./install.sh            # cria .venv e instala dependências (flask, flask-babel, pystray, Pillow)
./job-tracker.sh        # inicia
```

Alternativa manual:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"   # editable install + ferramentas de dev
python3 run.py
```

### Windows — manual (sem instalador)

1. Instale [Python 3.10+](https://www.python.org/downloads/windows/). Marque **Add Python to PATH**.
2. Baixe o código (ZIP da release ou `git clone`).
3. Abra o PowerShell na pasta do projeto:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

### Gerar o instalador Windows do zero

Só necessário para customizar o instalador. Roda em host Linux:

```bash
sudo apt install nsis
./installer/build_installer.sh 1.0.0
# saída: installer/JobTracker-Setup-1.0.0.exe
```

O workflow `.github/workflows/build-installer.yml` faz isso automaticamente quando uma tag `v*` é publicada.

## Atualizar

- **Windows**: execute o novo `JobTracker-Setup-X.Y.Z.exe`. Dados e configuração em `%APPDATA%\JobTracker` são preservados.
- **Linux / macOS (instalador remoto)**: reexecute o `install-remote.sh` — ele detecta o virtualenv existente, baixa a versão nova, reinstala o wheel e preserva seus dados em `~/.local/share/job-tracker/user/`.
- **Código-fonte**: `git pull && source .venv/bin/activate && pip install -r requirements.txt --upgrade`.

## Pré-requisitos (resumo)

| Sistema | Requisitos |
|---|---|
| Windows (instalador) | Nenhum — Python embutido |
| Windows (manual) | Python 3.10+ |
| Linux / macOS | Python 3.10+, `curl`, `bash` |
