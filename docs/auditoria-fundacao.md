# Auditoria de fundação — uptecelevadores.com

> Aplicação do playbook portátil (`~/.claude/skills/site-fundacao/PLAYBOOK.md`) a
> este site. Auditado em **18 de setembro de 2026**, com verificação em produção.
>
> Documento interno — está em `docs/`, que é excluído do deploy pelo `.vercelignore`.

---

## Resumo

O site tem uma **fundação acima da média**: arquitetura saída de diagnóstico real,
FAQ segmentada por página, prova verificável ao lado de cada afirmação, e SEO
técnico correto. Os problemas encontrados são de **aproveitamento**, não de
construção — com uma exceção que já foi corrigida.

| Severidade | Achados |
|---|---|
| 🔴 QUEBRA | 1 (já corrigido) |
| 🟠 CUSTA VENDA | 2 |
| 🟡 DEIXA NA MESA | 4 |
| 🔵 POLIMENTO | 2 |

---

## 🔴 Já corrigido nesta sessão

**Documentação interna servida publicamente.** `/docs/coleta-depoimentos.md`
respondia 200 em produção — documento que se declara interno e traz o script de
WhatsApp e o raciocínio de qual objeção cada pergunta foi desenhada para quebrar.
Junto dele: `/design.md`, `/scripts/` e `/_source` (160 KB com as 7 páginas, sem
canonical própria).

Corrigido com `.vercelignore` e com a repetição da regra `Disallow: /docs/` em cada
grupo do `robots.txt` — o arquivo anterior tinha a regra só no grupo `*`, que os
bots nomeados ignoram por completo.

---

## 🟠 Custa venda

### 1. A home lista os 4 públicos e não linka para as páginas deles

A seção `#segmentos` tem 4 cards — Condomínios, Empresas e prédios comerciais,
Órgãos públicos, Construtoras — cada um com **ícone de seta** (`ic-arrow-right`),
sugerindo clique. Nenhum tem `href`.

As páginas existem: `/condominios` e `/licitacoes` foram construídas exatamente
para esses públicos.

**Custo duplo:** frustra quem clica, e desperdiça a oportunidade mais forte de link
interno do site inteiro — é a home, a página com mais autoridade, apontando
justamente para as páginas que mais convertem.

**Conserto:** envolver cada card num `<a href="/condominios">` etc. Os dois cards
sem página própria (Empresas, Construtoras) podem apontar para `/servicos` ou
ganhar página própria quando houver prova daqueles públicos.

### 2. Grafo de links internos raso

Medição no corpo das páginas, excluindo nav e rodapé:

```
index         1 link   → /servicos
servicos      2 links  → /, /elevadores
licitacoes    1 link   → /
condominios   1 link   → /
elevadores    1 link   → /
contato       1 link   → /
```

**7 links contextuais em 6 páginas**, quase todos só voltando para a home. As
páginas não se conhecem: `/condominios` não linka para `/servicos`, `/licitacoes`
não linka para nada além da home.

**Conserto:** mínimo de 2 links contextuais por página, com âncora descritiva (não
"saiba mais" — a documentação do Google nomeia essa âncora como ruim, e ela é
péssima para leitor de tela). Ligações naturais:

| De | Para | Gancho |
|---|---|---|
| `/condominios` | `/servicos` | ao falar de manutenção preventiva |
| `/condominios` | `/elevadores` | ao falar de modernização |
| `/licitacoes` | `/servicos` | na capacidade técnica |
| `/elevadores` | `/servicos` | ao citar o serviço de instalação |
| `/servicos` | `/condominios`, `/licitacoes` | nos blocos por público |
| home | todas as 4 páginas internas | pelos cards de segmento |

---

## 🟡 Deixa na mesa

### 3. O JSON-LD está no básico

O `LocalBusiness` tem nome, endereço, telefone, CNPJ, horário e área de
atendimento — o essencial está certo. Faltam propriedades baratas que ajudam na
identificação da entidade:

| Falta | Por quê |
|---|---|
| `@id` | Identificador estável; permite ligar os blocos num grafo coerente |
| `sameAs` | Perfis externos (Google Business, Instagram, LinkedIn) — principal insumo de desambiguação |
| `geo` | Coordenadas |
| `priceRange` | Sinal simples que costuma faltar |
| `BreadcrumbList` | Vivo e barato |
| `Service` | Descreve a oferta ligada ao `@id` da empresa |

⚠️ **Nada de `aggregateRating`.** Marcação de avaliação sobre o próprio negócio é
inelegível a resultado rico — é desperdício, não infração. Depoimento vai como
conteúdo, sem marcação.

### 4. FAQPage virou peso morto (mas não atrapalha)

5 das 6 páginas têm `FAQPage` JSON-LD, gerado automaticamente a partir do acordeão.

O Google **descontinuou o resultado rico de FAQ em maio de 2026** — a documentação
foi removida em junho e o relatório saiu do Search Console. O Bing nunca documentou
suporte a esse tipo.

**Recomendação: deixe como está.** Não gera mais resultado rico, mas também não
prejudica, e o gerador já produz sozinho. Só não invista mais nada nisso — e saiba
que o FAQ **em texto visível** continua valioso para citação por IA; é o schema que
perdeu função, não o conteúdo.

### 5. O sitemap carrega peso morto

Os 6 registros têm `<priority>` e `<changefreq>`. **Google e Bing declaram
ignorar os dois.** Podem sair.

O `<lastmod>` está fixo em `2026-08-05` para todas as URLs — e o site mudou depois
disso. Data que não corresponde à alteração real é descartada pelo buscador. Ou o
gerador passa a emitir a data real por página, ou é melhor omitir.

### 6. Este é um site YMYL — e isso eleva a régua

Manutenção de elevador envolve **segurança física**. Pela definição do Google,
isso entra em "Your Money or Your Life", onde o padrão de qualidade é mais duro e
conteúdo tecnicamente frágil é penalizado com mais severidade.

O site já faz o certo: cita norma pelo número (ABNT NBR 16083, NBR 16858), nomeia
os engenheiros com registro no CREA, e explica a base legal da ART.

**O que reforçar:** em YMYL, a reputação é julgada pelo que **especialistas e
entidades de classe** dizem. Filiação a associação setorial, com listagem no
diretório dela, é o sinal de maior retorno disponível para uma empresa deste porte
— mais que qualquer ajuste no site.

---

## 🔵 Polimento

### 7. `/servicos` não tem FAQ

É a única das 6 sem acordeão. Perguntas de intenção comercial ("quanto custa a
manutenção?", "qual a diferença entre preventiva e corretiva?") cabem ali e
alimentam citação por IA.

### 8. Sem `Organization` separado

Hoje só existe `LocalBusiness`. Para uma empresa que atende em todo o Brasil e
participa de licitações federais, um bloco `Organization` com `sameAs` e
`taxID` ajuda a firmar a entidade além do escopo local.

---

## O que este site faz bem — e vale preservar

Registrado porque é o material que virou padrão no playbook:

1. **A arquitetura saiu de diagnóstico real.** Páginas separadas para síndico
   (`/condominios`) e pregoeiro (`/licitacoes`) — dois públicos que não têm quase
   nada em comum além do produto. Foi a decisão mais acertada do projeto.
2. **FAQ por página, não copiada.** 21 perguntas distribuídas em 6 páginas, apenas
   **1 duplicada**. Cada uma responde a dúvida de quem está naquele momento da
   decisão.
3. **Prova ao lado da afirmação.** "CREA-BA 3000129974", "12 visitas/ano, checklist
   de 27 itens", "365 dias de garantia", "até 30 minutos". Nenhum adjetivo sozinho.
4. **A seção "como escolher uma empresa de elevadores"** no `llms.txt` — sete
   perguntas que o comprador deveria fazer a qualquer fornecedor, com a resposta da
   empresa. Virou o padrão recomendado de citabilidade no playbook.
5. **Página de ICP abre pela dor do cliente**, não pela apresentação da empresa:
   *"A preocupação central do síndico não é o elevador: é a responsabilidade
   pessoal."*

---

## Prioridade sugerida

| # | Ação | Esforço | Retorno |
|---|---|---|---|
| 1 | Linkar os 4 cards de segmento da home | 15 min | Alto |
| 2 | Adicionar 2 links contextuais por página | 1h | Alto |
| 3 | `@id` + `sameAs` + `geo` no JSON-LD | 30 min | Médio |
| 4 | Limpar `priority`/`changefreq` e corrigir `lastmod` | 20 min | Médio |
| 5 | FAQ em `/servicos` | 1h | Médio |
| 6 | `BreadcrumbList` e `Service` | 40 min | Baixo |
| 7 | Filiação a associação setorial | externo | **Alto** (YMYL) |

Os itens 1 a 6 são feitos no `_source.html` + `scripts/gerar-paginas.mjs`. O item 7
é decisão do cliente, não trabalho de site — e é o de maior retorno.
