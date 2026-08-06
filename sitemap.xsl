<?xml version="1.0" encoding="UTF-8"?>
<!--
  Folha de estilo do sitemap.

  Por que existe: o Chrome renderiza XML em arvore, mas o Safari nao — ele
  mostra so o texto das tags emendado, e o sitemap parece "um link colado no
  outro, sem estrutura". Esta XSL faz o navegador exibir uma tabela legivel.

  Nao afeta indexacao: o Google le o XML e ignora a instrucao xml-stylesheet.
-->
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>Sitemap — UPTEC Elevadores</title>
        <style>
          :root {
            --bg: #f5f2ea;
            --surface: #ffffff;
            --ink: #161616;
            --ink-dim: #5a564d;
            --line: rgba(22, 22, 22, 0.12);
            --gold: #a8823c;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #070b18;
              --surface: #0d1428;
              --ink: #ffffff;
              --ink-dim: rgba(255, 255, 255, 0.62);
              --line: rgba(255, 255, 255, 0.12);
              --gold: #d8b15a;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 2.5rem 1.25rem 4rem;
            background: var(--bg);
            color: var(--ink);
            font-family: "Montserrat", system-ui, -apple-system, sans-serif;
            line-height: 1.6;
          }
          .wrap { max-width: 60rem; margin: 0 auto; }
          .eyebrow {
            font-family: ui-monospace, "DM Mono", monospace;
            font-size: 0.72rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--ink-dim);
            margin: 0 0 0.5rem;
          }
          h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); margin: 0 0 0.5rem; letter-spacing: -0.02em; }
          .lead { color: var(--ink-dim); margin: 0 0 2rem; max-width: 46rem; }
          .count { color: var(--gold); font-weight: 700; }
          .scroll { overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; background: var(--surface); }
          caption { text-align: left; padding: 0 0 0.6rem; color: var(--ink-dim); font-size: 0.85rem; }
          th, td {
            text-align: left;
            padding: 0.85rem 1rem;
            border-bottom: 1px solid var(--line);
            font-size: 0.92rem;
            white-space: nowrap;
          }
          th {
            font-family: ui-monospace, "DM Mono", monospace;
            font-size: 0.7rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--ink-dim);
            font-weight: 500;
          }
          td.url { white-space: normal; word-break: break-word; }
          tbody tr:last-child td { border-bottom: 0; }
          a { color: var(--gold); text-decoration: none; }
          a:hover, a:focus-visible { text-decoration: underline; }
          .num { font-family: ui-monospace, "DM Mono", monospace; color: var(--ink-dim); }
          footer { margin-top: 2rem; color: var(--ink-dim); font-size: 0.82rem; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <p class="eyebrow">UPTEC Elevadores</p>
          <h1>Mapa do site</h1>
          <p class="lead">
            Arquivo lido pelos mecanismos de busca para descobrir as paginas deste site.
            Total de <span class="count"><xsl:value-of select="count(s:urlset/s:url)"/></span> URLs.
          </p>

          <div class="scroll">
            <table>
              <caption>Prioridade e frequencia sao indicacoes ao buscador, nao garantias de posicionamento.</caption>
              <thead>
                <tr>
                  <th scope="col">Endereco</th>
                  <th scope="col">Alterado em</th>
                  <th scope="col">Frequencia</th>
                  <th scope="col">Prioridade</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td class="url">
                      <a href="{s:loc}"><xsl:value-of select="s:loc"/></a>
                    </td>
                    <td class="num"><xsl:value-of select="s:lastmod"/></td>
                    <td class="num"><xsl:value-of select="s:changefreq"/></td>
                    <td class="num"><xsl:value-of select="s:priority"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <footer>
            Conforme o protocolo sitemaps.org 0.9. Declarado em
            <a href="/robots.txt">robots.txt</a>.
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
