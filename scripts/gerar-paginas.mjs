#!/usr/bin/env node
/**
 * Gera as 6 paginas HTML da raiz a partir de _source.html.
 *
 *   node scripts/gerar-paginas.mjs            # gera
 *   node scripts/gerar-paginas.mjs --check    # so verifica, nao escreve
 *
 * _source.html e o unico arquivo de conteudo que voce edita. Ele contem as 6
 * secoes `.page`, como era a SPA original. index.html, servicos.html,
 * licitacoes.html, condominios.html, elevadores.html e contato.html sao
 * GERADOS e nao devem ser editados a mao.
 *
 * O que este script faz em cada pagina:
 *   1. troca title, meta description, og:title, og:description, og:url e canonical
 *   2. monta o JSON-LD de FAQPage a partir do acordeao daquela pagina
 *      (paginas sem acordeao saem sem FAQPage)
 *   3. mantem o JSON-LD de LocalBusiness em todas
 *   4. deixa no body apenas a `.page` daquela pagina, marcada com `is-active`
 *   5. reescreve os links de navegacao de `#servicos` para `/servicos`
 *      (apenas os que tem data-page; ancoras internas como #srv-preventiva ficam)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONTE = join(RAIZ, '_source.html');
const SITE = 'https://uptecelevadores.com';
const CHECAR = process.argv.includes('--check');

/* ---------------------------------------------------------------------------
 * As 6 paginas. `caminho` e a URL publica; e daqui que saem canonical e og:url.
 * Ao adicionar uma pagina, atualize tambem sitemap.xml, a constante VALID_PAGES
 * em site.js e os links de navegacao em _source.html.
 * ------------------------------------------------------------------------- */
const PAGINAS = [
  {
    id: 'home',
    arquivo: 'index.html',
    caminho: '/',
    titulo: 'UPTEC Elevadores: Manutenção e Modernização em Salvador',
    descricao:
      'Manutenção, instalação e modernização de elevadores em Salvador, na Bahia e no Brasil. ART em todos os serviços, RAT fotográfico e plantão 24h em até 30 min.',
  },
  {
    id: 'servicos',
    arquivo: 'servicos.html',
    caminho: '/servicos',
    titulo: 'Serviços de Elevadores: Manutenção e Modernização | UPTEC',
    descricao:
      'Seis serviços de engenharia em elevadores para Salvador, a Bahia e todo o Brasil: manutenção preventiva e corretiva, emergência 24h, modernização e instalação.',
  },
  {
    id: 'licitacoes',
    arquivo: 'licitacoes.html',
    caminho: '/licitacoes',
    titulo: 'Licitação de Elevadores para Órgãos Públicos | UPTEC',
    descricao:
      'Habilitação para licitações públicas de elevadores em todo o Brasil: pregão eletrônico, concorrência e dispensa. ART por contrato, proposta em até 24h.',
  },
  {
    id: 'condominios',
    arquivo: 'condominios.html',
    caminho: '/condominios',
    titulo: 'Manutenção de Elevadores para Condomínios | UPTEC',
    descricao:
      'Manutenção de elevadores para condomínios em Salvador, na Bahia e no Brasil: 12 visitas anuais pela ABNT NBR 16083, RAT fotográfico e App UPTEC.',
  },
  {
    id: 'elevadores',
    arquivo: 'elevadores.html',
    caminho: '/elevadores',
    titulo: 'Elevadores Novos e Modernização, Qualquer Marca | UPTEC',
    descricao:
      'Instalação de elevadores novos e modernização conforme ABNT NBR 16858, para qualquer marca e idade, em Salvador, na Bahia e em todo o Brasil.',
  },
  {
    id: 'contato',
    arquivo: 'contato.html',
    caminho: '/contato',
    titulo: 'Contato UPTEC Elevadores: Orçamento e Plantão 24h',
    descricao:
      'Fale com a engenharia da UPTEC Elevadores em Salvador, na Bahia e no Brasil. Orçamento em minutos, WhatsApp e plantão 24h em até 30 minutos.',
  },
];

/* ------------------------------------------------------------------ helpers */

/** Acha o bloco <div id="page-X" ...> ... </div> equilibrando as tags. */
function extrairPagina(html, id) {
  const abre = new RegExp(`^([ \\t]*)<div id="${id}"[^>]*>`, 'm');
  const m = abre.exec(html);
  if (!m) throw new Error(`nao achei o bloco <div id="${id}"> em _source.html`);

  const inicio = m.index;
  let pos = inicio + m[0].length;
  let profundidade = 1;
  const tag = /<div\b[^>]*>|<\/div>/g;
  tag.lastIndex = pos;

  let t;
  while ((t = tag.exec(html))) {
    profundidade += t[0] === '</div>' ? -1 : 1;
    if (profundidade === 0) {
      return { inicio, fim: t.index + t[0].length, html: html.slice(inicio, t.index + t[0].length) };
    }
  }
  throw new Error(`<div id="${id}"> nunca fecha em _source.html`);
}

/** Le as perguntas e respostas do acordeao de um bloco de pagina. */
function lerFaq(blocoHtml) {
  const item = /<div class="faq-item">([\s\S]*?)<\/button>([\s\S]*?)<\/div>\s*<\/div>/g;
  const perguntas = [];
  let m;
  while ((m = item.exec(blocoHtml))) {
    const p = /<span>([\s\S]*?)<\/span>/.exec(m[1]);
    const r = /<p>([\s\S]*?)<\/p>/.exec(m[2]);
    if (p && r) {
      perguntas.push({ pergunta: limpar(p[1]), resposta: limpar(r[1]) });
    }
  }
  return perguntas;
}

const limpar = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** Monta o bloco <script> de FAQPage no mesmo formato do resto do head. */
function blocoFaq(perguntas) {
  const entradas = perguntas
    .map(
      ({ pergunta, resposta }) => `      {
        "@type": "Question",
        "name": ${JSON.stringify(pergunta)},
        "acceptedAnswer": {
          "@type": "Answer",
          "text": ${JSON.stringify(resposta)}
        }
      }`
    )
    .join(',\n');

  return `  <!-- FAQPage JSON-LD: gerado a partir do acordeao desta pagina -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
${entradas}
    ]
  }
  </script>

`;
}

/** Corta um bloco <script type="application/ld+json"> a partir de um indice. */
function fatiarLd(html, desde) {
  const abre = html.indexOf('<script type="application/ld+json">', desde);
  if (abre === -1) return null;
  const fecha = html.indexOf('</script>', abre);
  const inicioLinha = html.lastIndexOf('\n', abre) + 1;
  return { inicio: inicioLinha, fim: fecha + '</script>'.length };
}

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* --------------------------------------------------------------------- head */

function montarHead(headFonte, pagina, perguntas) {
  let head = headFonte;
  const url = pagina.caminho === '/' ? `${SITE}/` : `${SITE}${pagina.caminho}`;
  const titulo = escapar(pagina.titulo);
  const descricao = escapar(pagina.descricao);

  head = head.replace(
    /(<meta name="description"\s*\n\s*content=")[\s\S]*?(">)/,
    `$1${descricao}$2`
  );
  head = head.replace(
    /(<meta property="og:title" content=")[\s\S]*?(">)/,
    `$1${titulo}$2`
  );
  head = head.replace(
    /(<meta property="og:description"\s*\n\s*content=")[\s\S]*?(">)/,
    `$1${descricao}$2`
  );
  head = head.replace(/(<meta property="og:url" content=")[^"]*(">)/, `$1${url}$2`);
  head = head.replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${url}$2`);
  head = head.replace(/<title>[\s\S]*?<\/title>/, `<title>${titulo}</title>`);

  // Remove todo JSON-LD de FAQPage que veio da fonte, junto do comentario acima
  // dele, e guarda onde ficava o LocalBusiness para inserir o FAQ novo ali.
  let corte;
  let guarda = 0;
  while ((corte = fatiarLd(head, guarda))) {
    const bloco = head.slice(corte.inicio, corte.fim);
    if (!bloco.includes('"@type": "FAQPage"')) {
      guarda = corte.fim;
      continue;
    }
    let inicio = corte.inicio;
    const antes = head.slice(0, inicio).replace(/[ \t]*<!--[^\n]*FAQPage[^\n]*-->\n$/, '');
    inicio = antes.length;
    let fim = corte.fim;
    if (head.slice(fim, fim + 2) === '\n\n') fim += 1;
    head = head.slice(0, inicio) + head.slice(fim);
    guarda = inicio;
  }

  if (perguntas.length) {
    const local = fatiarLd(head, 0);
    if (!local) throw new Error('nao achei o bloco LocalBusiness no head');
    head = head.slice(0, local.inicio) + blocoFaq(perguntas) + head.slice(local.inicio);
  }

  // colapsa as linhas em branco que a remocao dos blocos deixou para tras
  head = head.replace(/\n{3,}/g, '\n\n');

  return head;
}

/* --------------------------------------------------------------------- body */

function montarBody(bodyFonte, pagina) {
  const bloco = extrairPagina(bodyFonte, `page-${pagina.id}`);

  // marca a pagina como ativa
  const ativo = bloco.html.replace(
    new RegExp(`(<div id="page-${pagina.id}" class="page)([^"]*)(")`),
    '$1$2 is-active$3'
  );

  // Reconstroi o <main> com apenas esta pagina. Os comentarios de secao do
  // _source ("PAGE: HOME", "STUB PAGES", "/page-home") descrevem a SPA de seis
  // telas e viram ruido enganoso num arquivo de uma pagina so, entao caem aqui.
  const abre = bodyFonte.indexOf('<main id="main">');
  const fecha = bodyFonte.indexOf('</main>');
  if (abre === -1 || fecha === -1) throw new Error('nao achei <main id="main"> em _source.html');

  let body =
    bodyFonte.slice(0, abre + '<main id="main">'.length) +
    '\n\n' +
    ativo +
    '\n\n  ' +
    bodyFonte.slice(fecha);

  // navegacao: #servicos -> /servicos, #home -> /
  body = body.replace(/href="#([a-z-]+)"(\s+data-page="([a-z-]+)")/g, (todo, alvo, attr, page) => {
    const destino = PAGINAS.find((p) => p.id === page);
    return destino ? `href="${destino.caminho}"${attr}` : todo;
  });

  // uma linha em branco a menos no fim do documento
  body = body.replace(/<\/body>\s*<\/html>\s*$/, '</body>\n</html>\n');

  return body;
}

/* --------------------------------------------------------------------- main */

const fonte = readFileSync(FONTE, 'utf8');
const fimHead = fonte.indexOf('</head>');
if (fimHead === -1) throw new Error('_source.html nao tem </head>');
const headFonte = fonte.slice(0, fimHead);
const bodyFonte = fonte.slice(fimHead);

let mudou = 0;
for (const pagina of PAGINAS) {
  const bloco = extrairPagina(bodyFonte, `page-${pagina.id}`);
  const perguntas = lerFaq(bloco.html);
  const saida = montarHead(headFonte, pagina, perguntas) + montarBody(bodyFonte, pagina);

  const destino = join(RAIZ, pagina.arquivo);
  let atual = null;
  try {
    atual = readFileSync(destino, 'utf8');
  } catch {}

  const igual = atual === saida;
  if (!igual) mudou++;

  const marca = igual ? '=' : atual === null ? '+' : '~';
  console.log(
    `  ${marca} ${pagina.arquivo.padEnd(18)} ${String(perguntas.length).padStart(2)} perguntas no FAQ`
  );

  if (!CHECAR && !igual) writeFileSync(destino, saida, 'utf8');
}

console.log(
  CHECAR
    ? `\n--check: ${mudou} arquivo(s) sairiam diferentes do que esta no disco`
    : `\n${mudou} arquivo(s) reescrito(s), ${PAGINAS.length - mudou} sem mudanca`
);
