# UPTEC Elevadores — Design System

> Documento de referência para qualquer humano ou IA que precise **estender** o site.
> Todos os valores abaixo foram extraídos diretamente dos arquivos-fonte; nada foi inventado.

---

## 1. Direção visual: "Engineered Midnight"

Estética dark cinematográfica inspirada em engenharia de elevadores de alto padrão.

- **Tema escuro profundo** (navy `#070b18`) como base fixa — fundo fixo (position:fixed) com três camadas: malha radial azul/dourada, grid blueprint 64px, grain SVG com opacidade 0.04.
- **Quebras de seção creme** (`#f5f1e8`) alternando com as dark panels — cria ritmo visual e separa blocos de conteúdo.
- **Dourado de engenharia** (`#d8b15a`) como cor de acento — ícones, kickers, botão primário, hairlines dourados de 1px nas transições entre painéis, progresso de scroll.
- **Motivo do poço do elevador** — painel de ilustração vertical à direita no hero (hero__shaft), borda esquerda dourada de 2px, sugestão de cabine em aço.
- Nenhuma sombra de texto, nenhum glassmorphism em superfícies principais — somente nas pill da nav (backdrop-filter blur 14px).

### Ritmo de alternância de painéis (home)

```
Hero (DARK) → Marquee (DARK) → Diferenciais (DARK) → Serviços (LIGHT) →
Números (DARK) → Quem Somos (LIGHT) → Case (DARK) → CTA Band (DARK) → Footer (DARK)
```

---

## 2. Paleta — valores exatos do `:root` em `theme.css`

### Painel escuro (dark panels)

| Token CSS | Valor | Uso |
|---|---|---|
| `--c-bg` | `#070b18` | Fundo do `body` e `.site-bg` fixo |
| `--c-surface` | `#0b1226` | Superfície elevada (cards de diff, counters) |
| `--c-surface-2` | `#111a31` | Superfície de segunda camada (hover states) |
| `--c-line` | `rgba(255,255,255,0.08)` | Bordas sutis entre cards no dark |
| `--c-line-strong` | `rgba(255,255,255,0.14)` | Bordas mais visíveis, burger, pills |
| `--c-white` | `#ffffff` | Títulos `h1–h4` em dark |
| `--c-text` | `rgba(255,255,255,0.70)` | Parágrafos e texto corrido no dark |
| `--c-text-dim` | `rgba(255,255,255,0.48)` | Labels secundários, counters label, meta |

### Dourado (acento de engenharia)

| Token CSS | Valor | Uso |
|---|---|---|
| `--c-gold` | `#d8b15a` | Kickers, ícones, bordas de card no hover, tick |
| `--c-gold-soft` | `#e7cd92` | Gradiente do `btn-gold` (topo), textos gold suaves |
| `--c-gold-deep` | `#b8923f` | Acento dourado em painéis light (kicker, icon) |
| `--c-glow` | `#2554c7` | Cor do glow azul no background mesh |

### Laranja emergência

| Token CSS | Valor | Uso |
|---|---|---|
| `--c-orange` | `#f97316` | `btn-emergency` border/text, `emergency-dot` pulse, `srv-card--emergency` |

### Painel claro (light panels)

| Token CSS | Valor | Uso |
|---|---|---|
| `--c-cream` | `#f5f1e8` | Fundo `.panel--light` |
| `--c-cream-2` | `#fbf8f2` | Centro do radial-gradient no `::before` do light |
| `--c-ink` | `#161616` | Cor de texto principal no light (`h1–h4`, copy) |
| `--c-ink-dim` | `#4a463e` | Texto secundário (parágrafos) no light |
| `--c-ink-faint` | `#6b665b` | Labels, captions no light |
| `--c-light-line` | `rgba(22,22,22,0.12)` | Bordas de cards no light |
| `--c-light-line-strong` | `rgba(22,22,22,0.18)` | Divisores mais fortes no light |

### Outros

| Token CSS | Valor | Uso |
|---|---|---|
| `--ease` | `cubic-bezier(0.16,1,0.3,1)` | Easing padrão de todas as transições CSS |
| `--shell` | `1240px` | Largura máxima do layout (`.max-w-shell`) |
| `--nav-h` | `86px` | Altura da nav usada em `padding-top` do inner-hero |

> **Nota sobre `tokens.css`:** O arquivo `tokens.css` contém um sistema de tokens OKLCH (espaço de cores perceptual) com fontes Space Grotesk + Inter + DM Mono, usado **exclusivamente pelo formulário conversacional** (`form.css` faz `@import` implícito via carregamento antes de `theme.css`). O site principal usa apenas as variáveis de `theme.css` acima.

---

## 3. Tipografia

### Fontes e carregamento

| Família | Papel | Pesos | Provedor |
|---|---|---|---|
| **Clash Display** | Display / títulos `h1–h4`, wordmark da nav, marquee | 600, 700 | Fontshare (`api.fontshare.com`) |
| **Satoshi** | Corpo / parágrafos, botões, `body` | 400, 500, 700 | Fontshare (`api.fontshare.com`) |
| **DM Mono** | Dados / kickers, labels técnicos, mono | 400, 500 | Google Fonts |

**Tags de carregamento em `<head>`:**
```html
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Classes de família

```css
.font-body    { font-family: "Satoshi", system-ui, sans-serif; }
.font-display { font-family: "Clash Display", system-ui, sans-serif; }
.font-mono    { font-family: "DM Mono", ui-monospace, monospace; }
```

### Escala de tipo (valores exatos do `theme.css`)

| Elemento | Tamanho (clamp) | Família |
|---|---|---|
| `body` | `clamp(1rem, 0.97rem + 0.14vw, 1.0625rem)` | Satoshi |
| `.section-title` | `clamp(2rem, 4.6vw, 3.6rem)` | Clash Display |
| `.hero__title` | `clamp(3rem, 8vw, 8rem)` | Clash Display |
| `.inner-hero__title` | `clamp(2.2rem, 5.2vw, 4rem)` | Clash Display |
| `.cta-band__title` | `clamp(2.2rem, 5.5vw, 4.5rem)` | Clash Display |
| `.counter__num` | `clamp(2.8rem, 5vw, 4.5rem)` | Clash Display |
| `.kicker` | `0.72rem` + `letter-spacing: 0.22em` | DM Mono |
| `.nav-link` | `0.88rem` | Satoshi |
| `.btn-gold/ghost/emergency` | `0.9rem` (base) | Satoshi |

---

## 4. Stack e arquitetura

### SPA multi-página

O site é uma **Single Page Application baseada em `<div class="page">`** com roteamento por hash.

| Conceito | Detalhe |
|---|---|
| Seletor de página | `div#page-{nome}` com classe `.page` |
| Página ativa | `.page.is-active` (display: block); demais ficam display: none |
| Roteamento | `site.js` lê `window.location.hash`, chama `showPage(pageId)` |
| Páginas válidas | `home`, `servicos`, `licitacoes`, `condominios`, `elevadores`, `contato` |
| Links de navegação | `[data-page="nome"]` em `<a>` ou `<button>` — sem `href` de âncora ativado |
| Deep-link modal | `#orcamento` na URL abre o modal de orçamento automaticamente |
| Fallback sem JS | `html:not(.js-ready) #page-home { display: block }` — home sempre visível |

### Camadas CSS (ordem de carregamento)

```html
<link rel="stylesheet" href="tokens.css">   <!-- tokens OKLCH para o formulário -->
<link rel="stylesheet" href="theme.css">    <!-- sistema cinematográfico principal -->
<link rel="stylesheet" href="form.css">     <!-- formulário conversacional -->
```

### Estado-alvo: sem Tailwind CDN

O Tailwind Play CDN foi **removido por performance**. Todas as utilidades necessárias foram inlinadas no topo de `theme.css` como classes simples:

```css
.mx-auto, .max-w-shell (1240px), .px-6, .lg\:px-10, .w-full,
.inline-flex, .justify-center, .items-center,
.h-8, .h-10, .font-body, .font-display, .font-mono, .antialiased
```

Não adicione o CDN do Tailwind de volta. Se precisar de uma nova utility, escreva ela diretamente em `theme.css` na seção "inlined Tailwind utilities".

### GSAP (opcional, carregado diferido)

```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

GSAP é usado **apenas** para a transição de fade entre páginas e para os botões `.btn-magnetic`. Se o GSAP não carregar, o site funciona normalmente (site.js tem guards `hasGSAP()`).

---

## 5. Componentes

### Sistema de painéis

| Classe | Comportamento | Regra especial |
|---|---|---|
| `.panel--dark` | `background: transparent` — deixa o fundo fixo aparecer | Texto em `--c-text` (rgba branco 70%) |
| `.panel--light` | `background: var(--c-cream)` cobre o fundo fixo | `::before` com radial dourado + grid 54px dourado; `::after` hairline dourada entre painéis |

**Regra de cards em painéis light:** `.srv-card` e `.diff-card` dentro de `.panel--light` recebem fundo navy sólido (`linear-gradient(165deg, #141e38, #0b1326)`) com texto branco — contraste intencional sobre o creme.

---

### Primitivos de seção

| Classe | Uso |
|---|---|
| `.section` | Container de seção com `padding: clamp(5rem, 9vw, 9rem) 0` |
| `.section-head` | Wrapper do kicker + título, `max-width: 760px` |
| `.section-head--split` | Grid 2 colunas (1.2fr / 0.8fr) para cabeçalho dividido |
| `.section-title` | `h2` display, `clamp(2rem, 4.6vw, 3.6rem)`, `letter-spacing: -0.03em` |
| `.section-head__note` | Parágrafo complementar ao título, `max-width: 46ch` |
| `.section-head__note--full` | Variante de largura maior, `max-width: 70ch` |
| `.kicker` | DM Mono, 0.72rem, uppercase, gold, com `.kicker-tick` (barra de 26px) |
| `.kicker-tick` | `width: 26px; height: 1px; background: var(--c-gold)` com glow dourado |
| `.kicker-sep` | `/` separador entre elementos do kicker (gold 45%) |

---

### Cards de serviços (`srv-card`)

Usados no grid `.srv-grid` (3 colunas no desktop).

| Variante | Grid behavior | Uso |
|---|---|---|
| `.srv-card` | 1 coluna, 1 linha | Card padrão de serviço |
| `.srv-card--tall` | `grid-row: span 2` | Manutenção Preventiva (card destaque) |
| `.srv-card--wide` | `grid-column: span 2` | Modernização (card largo) |
| `.srv-card--emergency` | 1 coluna | Emergência 24h — borda laranja `rgba(249,115,22,0.25)` |

Hover em todos os `.srv-card`: `translateY(-4px)` + glow dourado radial via `::before` (effects.js) + linha dourada crescente no topo via `::after`.

---

### Cards de diferenciais (`diff-card`)

Usados no grid `.diff-grid` (3 colunas, grid-template-areas explícito).

| Variante | Grid area | Uso |
|---|---|---|
| `.diff-card--lead` | `lead` (span 2 linhas) | Card 01 — RAT com foto (destaque) |
| `.diff-card` (2º filho) | `a` | Card 02 — Emergência |
| `.diff-card` (3º filho) | `b` | Card 03 — ART |
| `.diff-card--wide` | `wide` | Card 04 — Multi-marcas |

Os `.diff-card` têm `::before` existente (barra dourada vertical esquerda ao hover). O glow de mouse usa `box-shadow` interno via classe `.glow-active` (não clobra o `::before`).

O número fantasma `.ghost-num` (Clash Display, `clamp(4rem,8vw,7rem)`, `rgba(255,255,255,0.04)`) é decorativo (aria-hidden).

---

### Cards tile (`tile-card`)

Cards genéricos reutilizáveis para novas páginas (condomínios, elevadores, etc.).

| Variante | Uso |
|---|---|
| `.tile-card` | Card padrão |
| `.tile-card--feature` | Borda dourada mais intensa, fundo gradiente quente |

Grid container: `.tile-grid` (3 colunas) ou `.tile-grid--2` (2 colunas).

---

### Contadores (`counters`)

```html
<span class="counter__num" data-count="100" data-suffix="+">0</span>
```

- `data-count` — valor final numérico
- `data-suffix` — sufixo a concatenar (ex: `+`, ` min`, ` dias`)
- Animação via `requestAnimationFrame` com easing cúbico (1600ms), acionada por `IntersectionObserver` (threshold 0.35)
- Failsafe: se o observer não disparar, o valor final é exibido após 2000ms
- Respeita `prefers-reduced-motion` (exibe o valor final diretamente)
- `.counters-grid`: 4 colunas com `gap: 1px`, background `--c-line` (cria linhas de grade entre cells)
- 1º e 3º `.counter__num` recebem gradient text dourado automaticamente

---

### Marquee (marcas)

```html
<div class="marquee-band panel--dark">
  <div class="marquee">
    <div class="marquee__track">
      <!-- itens duplicados para loop infinito -->
    </div>
  </div>
</div>
```

- A `.marquee__track` tem **todos os itens duplicados** em `aria-hidden="true"` para fechar o loop.
- CSS fallback: `animation: marqueeSlide 26s linear infinite` em `@media (prefers-reduced-motion: no-preference)`.
- `mask-image` nos extremos cria fade lateral suave.
- `.marquee__item.is-gold` destaca a marca Thyssen em dourado.

---

### Illus panel (`illus-panel`)

Container visual para ilustrações e fotos.

| Variante | Uso |
|---|---|
| `.illus-panel` | Fundo azul-claro (`linear-gradient(160deg, #f2f5fc, #e1eaf8)`) — para SVG de linha (tema blueprint) |
| `.illus-panel--light` | Fundo branco quente (`linear-gradient(160deg, #ffffff, #f3eee2)`) — painéis light |
| `.illus-panel--photo` | `padding: 0; background: none` — para fotos reais (apenas borda dourada + `border-radius: 16px`) |
| `.illus-panel--wide` | `padding: 1.2rem` — variante de padding menor para o case |

Todos têm `border: 1px solid rgba(216,177,90,0.28/0.32/0.35)` e `border-radius: 20px`.

---

### Botões

| Classe | Estilo | Uso |
|---|---|---|
| `.btn-gold` | Gradient `--c-gold-soft → --c-gold`, texto `#1a1205` (quase preto) | CTA primário — um por seção |
| `.btn-ghost` | Outline branco transparente, adapta-se a dark/light | CTA secundário |
| `.btn-emergency` | Outline laranja fino + `emergency-dot` pulsante | Link de emergência 24h WhatsApp |
| `.btn-lg` | `padding: 0.95rem 1.6rem; font-size: 0.98rem` | Tamanho grande (hero, CTA band) |
| `.btn-sm` | `padding: 0.55rem 0.95rem; font-size: 0.82rem` | Tamanho pequeno (nav, footer) |
| `.btn-magnetic` | Sem estilo adicional — JS aplica translate via GSAP no mousemove | Botões de destaque |
| `.link-arrow` | DM Mono, uppercase, gold, sem border — gap aumenta no hover | Link inline em cards |
| `.link-arrow--orange` | Variante laranja para emergência | Card de emergência |

`[data-open-quote]` em qualquer elemento abre o modal de orçamento.

---

### Navegação (`site-nav`)

- `.site-nav` — `position: fixed; top: 0; z-index: 100`; flex centrado com padding 1.1rem
- `.site-nav__pill` — pill translúcida (`rgba(9,14,28,0.55)`, `backdrop-filter: blur(14px)`), max-width `--shell`
- `.site-nav.is-solid` — estado após scroll > 30px: fundo `rgba(7,11,22,0.9)`, borda dourada `rgba(216,177,90,0.22)`
- `.site-nav__name` — "UPTEC" em Clash Display 700, 1.12rem
- `.site-nav__tagline` — "Elevadores" em DM Mono, 0.56rem, `letter-spacing: 0.34em`, gold
- `.nav-link` — 0.88rem Satoshi, estados `.is-active` (gold-soft, fundo gold 10%)
- `.nav-burger` — visível apenas em `max-width: 1100px` (display: flex)

---

### Mobile drawer (`mobile-drawer`)

- `position: fixed; right: 0; width: min(86vw, 360px); z-index: 99`
- Fundo `rgba(10,15,30,0.98)` com `backdrop-filter: blur(20px)`
- Slide-in via `transform: translateX(0)` na classe `.is-open`
- Links em Clash Display 1.5rem, separados por `border-bottom: 1px solid --c-line`
- CTAs na parte inferior: `btn-gold` + `btn-emergency`
- `body.drawer-open` → `overflow: hidden`

---

### Footer (`site-footer`)

- `panel--dark`, grid 3 colunas (1.5fr / 1fr / 1.2fr)
- `.status-dot` com `.status-dot__pulse` pulsante verde (#6fcf97) — "Plantão 24h, 365 dias"
- `.site-footer__data` — rodapé legal em DM Mono com CNPJ e CREA-BA separados por `/` dourado
- `.site-footer__eng` — engenheiros em DM Mono, `--c-text-dim`

---

### Modal de orçamento (`quote-modal`)

- `position: fixed; inset: 0; z-index: 400`; `display: none` → `display: flex` na classe `.is-open`
- `.quote-modal__backdrop` — `rgba(4,7,16,0.72)` + `backdrop-filter: blur(10px)`; clique fecha
- `.quote-modal__dialog` — `width: min(680px, 100%)`, fundo `linear-gradient(165deg, #0d1428, #090f20)`, borda gold 0.35
- `.quote-modal__close` — botão circular com rotate(90deg) no hover
- Formulário montado em `<div id="lead-form-root">` por `form.js`
- `body.modal-open` → `overflow: hidden`
- Trap de foco: Tab/Shift+Tab cicla entre focusáveis; Escape fecha
- Deep-link: `#orcamento` na URL abre o modal automaticamente

---

### Componentes de páginas internas

| Classe | Uso |
|---|---|
| `.inner-hero` | Hero de sub-página com `padding-top: calc(var(--nav-h) + clamp(2.5rem,6vw,5rem))` |
| `.breadcrumb` | DM Mono, 0.74rem, uppercase — trilha de navegação |
| `.split` | Grid 2 colunas igual para layouts cópia + mídia |
| `.recv-list / .recv-item` | Lista de benefícios com ícone em chip dourado |
| `.tile-card` | Card genérico — dark (default) ou light com navy sólido |
| `.check-list` | Lista de checklist 2 colunas com ícone dourado |
| `.feature-box` | Sub-card com fundo levemente destacado, dark e light |
| `.accent-note` | Callout com borda esquerda dourada de 2px |
| `.stat-tiles` | Grid 2 tiles com número e label |
| `.info-card / .data-card` | Cards de contato e dados da empresa |
| `.doc-group / .doc-item` | Lista de documentos de habilitação com `.badge` |
| `.badge-success` | `color: #6fcf97` — documentos vigentes |
| `.badge-brand` | `color: var(--c-gold-soft)` — documentos disponíveis |
| `.porque-grid` | Grid 2 colunas com items de checklist estilizados |
| `.ident-grid` | Grid 2 colunas para dados de identificação da empresa |
| `.srv-block` | Seção de serviço expandida com chip + título + lista |
| `.srv-chip` | Chip de ícone 52x52px, gold — `.srv-chip--emergency` para laranja |
| `.cta-band` | Seção de CTA central com fundo gradiente e shaft dourado decorativo |
| `.mvv` | Grid de Missão/Visão/Valores com `grid-template-columns: 130px 1fr` |
| `.eng-card` | Card de engenheiro responsável — `.eng-card--light` para painéis light |
| `.founder-card` | Card de citação do fundador — `.founder-card--light` para light |
| `.licit__pills` | Pills dourados de habilitação (CREA, CAT, etc.) |
| `.cert-pills` | Pills de certificações (NR-10, NR-12, etc.) |

---

## 6. Imagens

### Fotos de página (otimizadas ~1024px)

Todas em `.jpg` (produção) com `.png` de backup na pasta `images/`.

| Arquivo | Usado em | Contexto |
|---|---|---|
| `uptec-cabine.jpg` | hero (home) | Hero shaft — cabine em aço escovado |
| `uptec-tecnico.jpg` | quem somos (home) | Técnico inspecionando quadro de comando |
| `uptec-quadro.jpg` | case thyssen (home) | Quadro de comando antes/depois |
| `uptec-licitacoes.jpg` | inner-hero (licitações) | Foto decorativa de fundo |
| `uptec-servicos.jpg` | inner-hero (serviços) | Foto decorativa de fundo |
| `uptec-condominios.jpg` | inner-hero (condomínios) | Foto decorativa de fundo |
| `uptec-elevadores.jpg` | inner-hero (elevadores) | Foto decorativa de fundo |
| `uptec-contato.jpg` | inner-hero (contato) | Foto decorativa de fundo |
| `uptec-case-condo.jpg` | case (home/condomínios) | Case de condomínio |
| `uptec-app-rat.jpg` | seção RAT/app | Demonstração do relatório fotográfico |

### Logo

| Arquivo | Uso |
|---|---|
| `logo-uptec-t.png` | Logo transparente — nav pill, footer, quote-modal (44px) |
| `logo-uptec.png` | Logo completa opaca (uso alternativo) |
| `logo-uptec-full.png` | Logo horizontal completa |

### Ilustrações SVG (restantes)

| Arquivo | Uso esperado |
|---|---|
| `illus-building.svg` | Fachada de prédio / condomínio |
| `illus-case-panel.svg` | Painel de case técnico |
| `illus-engineering.svg` | Engenharia / esquema técnico |
| `illus-modernizacao.svg` | Diagrama de modernização |
| `illus-shaft.svg` | Poço do elevador (motivo central) |
| `icons.svg` | Spritesheet de todos os ícones (use `<use href="images/icons.svg#ic-nome">`) |

### IDs de ícones conhecidos no spritesheet

`#ic-rat`, `#ic-emergencia`, `#ic-art`, `#ic-modernizacao`, `#ic-preventiva`, `#ic-corretiva`, `#ic-instalacao`, `#ic-vistoria`, `#ic-check`, `#ic-arrow-right`, `#ic-phone`

---

## 7. Movimento e animações

### Reveal on scroll

```css
/* CSS: esconde por padrão quando JS está ativo */
html.js-ready [data-reveal] {
  opacity: 0;
  transform: translateY(34px);
  transition: opacity 0.7s var(--ease), transform 0.7s var(--ease);
}
html.js-ready [data-reveal].in-view {
  opacity: 1;
  transform: none;
}
```

- `html.js-ready` é adicionado pelo `site.js` no boot. Antes disso, o conteúdo é visível (failsafe).
- JS usa `IntersectionObserver` (threshold 0.08, rootMargin `0px 0px -8% 0px`).
- Failsafe 1: 1200ms após o page show, força todos os elementos visíveis com `.in-view`.
- Failsafe 2: no evento de scroll, força elementos que estejam dentro do viewport.
- Failsafe 3: 2500ms após boot, revela qualquer elemento ainda visível não marcado.
- `@media (prefers-reduced-motion: reduce)` → `opacity: 1; transform: none; transition: none` imediatamente.

### Contadores (rAF)

- `IntersectionObserver` threshold 0.35 aciona a animação.
- Duração: 1600ms com easing `1 - Math.pow(1-p, 3)` (cúbico).
- `requestAnimationFrame` para suavidade; failsafe via `setTimeout(dur + 600ms)`.

### Effects.js

| Efeito | Guard | Comportamento |
|---|---|---|
| **Cursor magnético** | **REMOVIDO a pedido** | Era uma ring dourada de 28px (ID `#uptec-cursor-ring`). O CSS ainda existe em `theme.css` mas `initCursorFollower()` não é chamado no boot. |
| **GlowCard** | `hover:hover AND pointer:fine` (desktop) | Glow radial dourado (`260px circle`) seguindo o mouse dentro de `.srv-card`, `.diff-card`, `.tile-card`. Usa CSS custom props `--mx/--my` + `::before` pseudo-element. |
| **Grid Ripple** | `!prefers-reduced-motion` | Grid de células 52x52px em `#diferenciais`, animação diagonal (`animation-delay: (i+j)*0.1s`, cap 6s). Oculto em mobile (`max-width: 767px`). |

### Regra global de prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .marquee__track { animation: none !important; }
  .emergency-dot, .status-dot__pulse, .nav-plantao__dot, .hero__scroll-line::after {
    animation: none !important;
  }
}
```

---

## 8. Formulário conversacional (`form.js` + `form.css`)

### Fluxo de 8 passos

| Passo | ID | Tipo | Campo principal |
|---|---|---|---|
| 1 | `nome` | `text` | Nome completo (rapport inicial) |
| 2 | `categoria` | `radio` | Tipo de necessidade (emergência, preventiva, etc.) |
| 3 | `segmento` | `radio` | Tipo de cliente (cond. residencial, órgão público, etc.) |
| 4 | `situacao` | `radio` | Situação atual (parado, pessoas presas, etc.) |
| 5 | `equipamentos` | `mixed` | Quantidade + marcas (checkbox) + paradas |
| 6 | `localizacao` | `radio` | Onde fica o equipamento |
| 7 | `telefone` | `text` | WhatsApp / telefone (validação 10-11 dígitos) |
| 8 | `final` | `final` | E-mail (opcional) + observações (opcional) |

### Ponto de montagem

```html
<div id="lead-form-root"></div>
```

O `form.js` injeta todo o HTML dinamicamente. Não existe marcação de formulário no `index.html`.

### Abertura

Qualquer elemento com `[data-open-quote]` — incluindo botões na nav, hero, cards e footer.

### Destino dos leads

1. **Sempre**: `localStorage` na chave `uptec_leads` (array JSON).
2. **Opcional**: endpoint configurado via `window.UPTEC_CONFIG = { LEAD_ENDPOINT: 'https://...' }` antes de carregar o script. Compatível com Google Sheets Apps Script, Supabase REST, Formspree, Make/n8n.

### Objeto lead gerado

```js
{
  id: "UPT-{base36}-{random}",  // ex: UPT-LXYZ123-A4B
  criadoEm: "2026-06-20T...",
  origem: "site",
  status: "novo",
  prioridade: "alta|media|baixa",
  categoria, segmento, situacao,
  equipamentos: { quantidade, marcas: [], paradas },
  localizacao,
  contato: { nome, telefone, email },
  observacoes,
  resumo  // string legível para Kanban
}
```

### Conclusão

Ao finalizar: exibe painel de sucesso, grava o lead e redireciona para `https://wa.me/5571996526835?text={mensagem_formatada}` após 750ms.

### Tema dark no modal

O `form.css` contém uma seção **dark modal theme overrides** (`.quote-modal .lf-*`) que reaplica a paleta "Engineered Midnight" sobre o formulário:

- Barra de progresso: gradient `--df-gold → --df-gold-soft` com glow dourado
- Botão "Continuar/Enviar": gradient dourado com texto `#1a1205`
- Cards de opção selecionados: borda gold, glow `rgba(216,177,90,0.15)`
- Inputs focados: borda gold + box-shadow gold

---

## 9. Dados legais (imutáveis — nunca alterar sem confirmação do cliente)

| Campo | Valor |
|---|---|
| Razão Social | UPTEC Elevadores Ltda. |
| CNPJ | `64.753.094/0001-52` |
| CREA-BA (PJ) | `0010441166` |
| Inscrição Estadual | `240.839.293` |
| Inscrição Municipal (CGA) | `01.065.655/0001-83` |
| Endereço | Av. Tancredo Neves, 3343, Bloco B, Sala 1009/10, Caminho das Árvores, Salvador, BA, CEP 41.820-021 |
| Resp. Técnico | Eng. Mec. Milton Jesus dos Santos — CREA-BA `3000129974` |
| Eng. Responsável | Eng. Mec. Gilva Teixeira dos Santos — CREA-BA `3000129975` |
| Fundador | Luis Felipe Cordeiro |
| Telefone / WhatsApp | `(71) 99652-6835` / `https://wa.me/5571996526835` |
| E-mail geral | `contato@uptecelevadores.com` |
| E-mail licitações | `licitacoes@uptecelevadores.com` |
| E-mail fundador | `luiscordeiro@uptecelevadores.com` |

### Regras de copy (nunca violar)

- **ZERO aspas retas** (`"` ou `'`) na copy visível — use aspas tipográficas (`"` `"` `'` `'`) se necessário, ou prefira reescrever a frase sem aspas.
- **ZERO travessões** (`-`) em substituição a travessão real — se precisar de separação, use `/` ou reescreva.
- Acentos em PT correto: `Plantão`, `Técnico`, `próximo`, `atendimento`, etc.
- Números de resposta: sempre **30 minutos** e **365 dias** — nunca alterar.
- Garantia sempre **365 dias**.
- Visitas preventivas: sempre **12 por ano** e **27 itens críticos**.

---

## 10. Como adicionar uma nova página ou seção

### Nova seção em uma página existente

1. Escolha o painel: `.panel--dark` ou `.panel--light` (mantenha a alternância).
2. Adicione o elemento dentro do `div#page-{nome}` existente:

```html
<section class="section panel panel--dark" id="minha-secao">
  <div class="mx-auto max-w-shell px-6 lg:px-10">
    <div class="section-head" data-reveal>
      <p class="kicker"><span class="kicker-tick" aria-hidden="true"></span>Kicker aqui</p>
      <h2 class="section-title">Título da seção.</h2>
    </div>
    <!-- conteúdo -->
  </div>
</section>
```

3. Use `data-reveal` em qualquer elemento que deve animar ao entrar no viewport.
4. Use componentes da paleta de classes (tabelas acima) — não invente novos estilos sem necessidade.

### Nova página completa

1. Adicione o ID à lista `VALID_PAGES` em `site.js`:
   ```js
   var VALID_PAGES = ['home', 'servicos', 'licitacoes', 'condominios', 'elevadores', 'contato', 'nova-pagina'];
   ```

2. Adicione o link na nav (`site-nav__links`) e no `mobile-drawer`:
   ```html
   <a href="#nova-pagina" data-page="nova-pagina" class="nav-link">Nova Página</a>
   ```

3. Crie o `<div>` da página em `index.html` antes do `</main>`:
   ```html
   <div id="page-nova-pagina" class="page">
     <!-- inner-hero DARK -->
     <section class="inner-hero panel panel--dark">
       <div class="inner-hero__shaft anim-parallax" data-speed="5" aria-hidden="true">
         <div class="illus-panel illus-panel--photo">
           <img src="images/uptec-nova.jpg" alt="" width="1024" height="1024" loading="lazy">
         </div>
       </div>
       <div class="mx-auto max-w-shell px-6 lg:px-10">
         <nav class="breadcrumb" aria-label="Trilha de navegação">
           <a href="#home" data-page="home">Início</a>
           <span class="breadcrumb-sep" aria-hidden="true">/</span>
           <span class="breadcrumb-current">Nova Página</span>
         </nav>
         <p class="kicker" data-reveal>...</p>
         <h1 class="inner-hero__title" data-reveal>Título.</h1>
       </div>
     </section>

     <!-- seções alternando LIGHT / DARK -->
     <!-- termine sempre com .cta-band panel--dark -->
   </div>
   ```

4. Adicione uma foto à pasta `images/` com nome `uptec-{slug}.jpg`, otimizada para ~1024px de largura.

5. O roteamento funciona automaticamente — o site.js detecta o hash e mostra o `div` correspondente, executa os reveals e contadores da nova página.

### Checklist antes de publicar

- [ ] Alternância dark/light respeitada
- [ ] `data-reveal` em todos os elementos que devem animar
- [ ] Nenhum Tailwind CDN adicionado
- [ ] Copy sem aspas retas e sem travessões
- [ ] Dados legais (CNPJ, CREA, engenheiros) copiados do modelo acima sem alteração
- [ ] Imagens com `loading="lazy"` (exceto hero, que usa `fetchpriority="high"`)
- [ ] Botão de CTA primário usa `data-open-quote` para abrir o modal
- [ ] Link de emergência aponta para `https://wa.me/5571996526835?text=Emerg%C3%AAncia%20-%20preciso%20de%20atendimento%20no%20elevador`
