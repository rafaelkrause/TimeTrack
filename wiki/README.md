# Wiki (in-repo copy)

Esta pasta contém a documentação detalhada do Job Tracker em Markdown — versionada junto ao código. Os mesmos arquivos podem ser sincronizados com a **[GitHub Wiki](https://github.com/rafaelkrause/job_tracker/wiki)** do repositório para ficarem navegáveis lá também.

## Índice

### 🇧🇷 Português

- [Home](Home.md)
- [Instalação](Installation.md)
- [Guia de uso](User-Guide.md)
- [Configuração](Configuration.md)
- [Referência da API](API-Reference.md)
- [Solução de problemas](Troubleshooting.md)

### 🇬🇧 English

- [Installation](Installation-EN.md)
- [User Guide](User-Guide-EN.md)
- [Configuration](Configuration-EN.md)
- [API Reference](API-Reference-EN.md)
- [Troubleshooting](Troubleshooting-EN.md)

## Sincronizar com a GitHub Wiki

A GitHub Wiki é um repositório Git separado (`<repo>.wiki.git`). Para publicar:

```bash
# clone o wiki (uma vez)
git clone https://github.com/rafaelkrause/job_tracker.wiki.git ../job_tracker.wiki

# copie os arquivos
cp wiki/*.md ../job_tracker.wiki/

# commit e push
cd ../job_tracker.wiki
git add .
git commit -m "Sync wiki from repo"
git push
```

Convenções do GitHub Wiki usadas aqui:

- `Home.md` é a página inicial.
- `_Sidebar.md` aparece como barra lateral em todas as páginas.
- Nomes de arquivo com hífens viram títulos de página (ex. `User-Guide.md` → "User Guide").
