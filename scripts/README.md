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

Use `node scripts/gerar-paginas.mjs --check` para so verificar se as paginas do
disco estao em dia com o `_source.html`, sem escrever nada. Serve para conferir
antes de um commit ou num hook de CI.

O script sempre le de `_source.html`, nunca do `index.html` ja gerado — por isso
e reexecutavel sem perder as outras 5 paginas, e rodar duas vezes seguidas nao
produz diferenca nenhuma.

### O que ele faz em cada pagina

1. Troca `title`, `meta description`, `og:title`, `og:description`, `og:url` e
   `canonical` pelos valores da constante `PAGINAS`, no topo do script.
2. Monta o JSON-LD de `FAQPage` **a partir do acordeao daquela pagina** — le os
   `.faq-item`, pega a pergunta do `<span>` e a resposta do `<p>`. Pagina sem
   acordeao (hoje, `/servicos`) sai sem bloco de FAQ.
3. Mantem o JSON-LD de `LocalBusiness` em todas as paginas.
4. Reconstroi o `<main>` com apenas a `.page` daquela pagina, marcada com
   `is-active`.
5. Reescreve a navegacao: `href="#servicos" data-page="servicos"` vira
   `href="/servicos"`. Ancoras internas sem `data-page` (`#srv-preventiva`,
   `#main`) ficam intactas.

Os comentarios de secao do `_source.html` (`PAGE: HOME`, `STUB PAGES`,
`/page-home`) descrevem a SPA de seis telas e sao removidos na geracao: num
arquivo de uma pagina so eles descrevem outra pagina, o que confunde quem le.

### Ao mudar textos de SEO

Titulo, descricao e URL de cada pagina estao na constante `PAGINAS`, no topo do
`gerar-paginas.mjs`. `og:title` acompanha o `title` e `og:description` acompanha
a `description` — nao existem campos separados para eles.

### Ao adicionar ou remover uma pagina

Atualize tambem:
- a constante `PAGINAS` em `scripts/gerar-paginas.mjs`
- `sitemap.xml` (a URL nova)
- `site.js`, constante `VALID_PAGES`
- os links de navegacao em `_source.html`

> **Nota sobre o `.gitignore`.** A regra `*.mjs` ja apagou este gerador do
> repositorio uma vez: ele existia, era citado neste README, mas nunca chegou a
> ser versionado. A excecao `!scripts/*.mjs` logo abaixo dela e o que impede
> isso de acontecer de novo — nao remova.

---

## indexnow.sh

Avisa Bing e Yandex que paginas mudaram, em vez de esperar o crawler passar.
Importa porque o indice do Bing e o que alimenta as respostas do ChatGPT e do
Copilot — e o Google nao participa do protocolo.

```bash
bash scripts/indexnow.sh               # as 6 URLs do site
bash scripts/indexnow.sh /servicos     # so as que voce listar
```

**Rode depois do deploy.** O IndexNow busca o arquivo de chave no ar
(`https://uptecelevadores.com/<chave>.txt`) para confirmar que quem pediu e o
dono do dominio; se a chave ainda nao subiu, o script aborta antes de enviar.

A chave fica em duas coisas que precisam bater: a constante `CHAVE` dentro do
script e o arquivo `<chave>.txt` na raiz do repositorio. **Nao renomeie nem
apague esse .txt** — sem ele o protocolo passa a responder 403. Se um dia
precisar trocar a chave, troque os dois ao mesmo tempo.

Resposta 202 na primeira vez e normal: significa aceito, com a chave ainda em
validacao.
