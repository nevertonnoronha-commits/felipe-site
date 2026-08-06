# scripts

## gerar-paginas.mjs

O site tem 6 URLs reais (`/`, `/servicos`, `/licitacoes`, `/condominios`,
`/elevadores`, `/contato`), mas o conteudo vive em um unico arquivo-fonte.

**`_source.html` (na raiz) e o arquivo que voce edita.** Ele contem as 6 secoes
`.page`, como era a SPA original. Os 6 HTML da raiz sao GERADOS a partir dele e
nao devem ser editados a mao — qualquer alteracao neles se perde na proxima
geracao.

### Fluxo ao mudar conteudo

```bash
# 1. edite o conteudo
vim _source.html

# 2. regere as 6 paginas
node scripts/gerar-paginas.mjs

# 3. confira e commite
git diff --stat
```

O script sempre le de `_source.html`, nunca do `index.html` ja gerado — por isso
e reexecutavel sem perder as outras 5 paginas.

Cada arquivo gerado recebe title, meta description, og e canonical proprios, e
apenas o bloco FAQPage JSON-LD correspondente as perguntas que aparecem no
acordeao daquela pagina.

### Ao adicionar ou remover uma pagina

Atualize tambem:
- `sitemap.xml` (a URL nova)
- `site.js`, constante `VALID_PAGES`
- os links de navegacao em `_source.html`
