/* ============================================================
   UPTEC Elevadores — Formulário Conversacional de Captação de Lead
   form.js — Vanilla JS, sem dependências, sem build step.

   Ponto de montagem: <div id="lead-form-root"></div>

   Configuração do endpoint de backend (operador):
   ─────────────────────────────────────────────────────────────
   Para enviar os leads para um backend, defina ANTES de carregar
   este script:

     <script>
       window.UPTEC_CONFIG = { LEAD_ENDPOINT: 'https://...' };
     </script>

   Destinos compatíveis (o objeto lead já está formatado para CRM):
     • Google Sheets via Apps Script Web App (método POST JSON)
     • Supabase REST API  → POST /rest/v1/leads  (com apikey header)
     • Serverless function (Vercel/Netlify/CF Workers)
     • Formspree         → https://formspree.io/f/SEU_FORM_ID
     • Make / n8n webhook

   O objeto lead inclui os campos:
     id, criadoEm, origem, status, prioridade,
     categoria, segmento, situacao,
     equipamentos: { quantidade, marcas, paradas },
     localizacao, contato: { nome, telefone, email },
     observacoes, resumo

   Os campos 'status' e 'prioridade' são adequados para colunas
   de Kanban/CRM (ex.: status = novo | em_atendimento | fechado).

   Os dados SEMPRE são gravados em localStorage (chave: uptec_leads)
   independente de LEAD_ENDPOINT estar configurado ou nao.
   ============================================================ */

/* --- Configuração global (pode ser sobrescrito antes do script) */
window.UPTEC_CONFIG = window.UPTEC_CONFIG || { LEAD_ENDPOINT: '' };

/* ── Constantes ──────────────────────────────────────────── */
const WA_NUMBER = '5571996526835';
const TOTAL_STEPS = 8;

/* Ícone SVG de seta esquerda (inline, sem dependência) */
const ICON_BACK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>`;
const ICON_NEXT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
const ICON_CHECK = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_WARN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_INFO = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const ICON_PHONE = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>`;
const ICON_WA = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.509 5.836L.057 23.875a.5.5 0 00.609.61l6.039-1.452A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.014-1.38l-.36-.214-3.725.896.912-3.634-.235-.373A9.82 9.82 0 012.182 12C2.182 6.584 6.584 2.182 12 2.182S21.818 6.584 21.818 12 17.416 21.818 12 21.818z"/></svg>`;

/* ── Definição dos passos ────────────────────────────────── */
/*
  Cada step tem:
    id         — chave unica
    label      — titulo da pergunta
    sublabel   — (opcional) linha auxiliar pequena
    type       — 'radio' | 'checkbox-text' | 'text' | 'mixed' | 'final'
    options    — (radio) lista de { value, label }
    fields     — (text/mixed) lista de definições de campo
    getInsight — (opcional) fn(respostas) -> { text, emergency? } | null
*/

const STEPS = [
  /* ── Nome (primeiro, para criar rapport) ── */
  {
    id: 'nome',
    label: 'Para começar, qual é o seu nome?',
    type: 'text',
    fields: [
      {
        id: 'contato_nome',
        label: 'Nome completo',
        type: 'text',
        placeholder: 'Ex.: Maria da Silva',
        required: true,
        errorMsg: 'Por favor, informe seu nome.',
      },
    ],
    getInsight: null,
  },

  /* ── Tipo de necessidade ── */
  {
    id: 'categoria',
    label: 'O que você precisa?',
    type: 'radio',
    options: [
      { value: 'emergencia',          label: 'Emergência' },
      { value: 'manutencao_prev',     label: 'Manutenção preventiva' },
      { value: 'manutencao_corr',     label: 'Manutenção corretiva' },
      { value: 'modernizacao',        label: 'Modernização / retrofit' },
      { value: 'instalacao',          label: 'Instalação de elevador novo' },
      { value: 'vistoria',            label: 'Vistoria / Laudo técnico' },
      { value: 'licitacao',           label: 'Licitação pública' },
    ],
    getInsight(r) {
      if (r.categoria === 'emergencia') {
        return { text: 'Nosso plantão atende em até 30 minutos, 24h por dia, 365 dias por ano.', emergency: true };
      }
      if (r.categoria === 'licitacao') {
        return { text: 'Documentação completa: certidões em dia, atestados técnicos (CREMEB) e engenheiros CREA-BA.' };
      }
      if (r.categoria === 'modernizacao') {
        return { text: 'Modernização sem troca do poço: comando microprocessado, operadores de porta e redução de chamados.' };
      }
      if (r.categoria === 'instalacao') {
        return { text: 'Linha UPTEC (parceria STEP): projeto por engenheiro, ART e treinamento da equipe.' };
      }
      return null;
    },
  },

  /* ── Step 2: Segmento ── */
  {
    id: 'segmento',
    label: 'Qual é o seu tipo de cliente?',
    type: 'radio',
    options: [
      { value: 'cond_residencial', label: 'Condomínio residencial' },
      { value: 'cond_comercial',   label: 'Condomínio comercial' },
      { value: 'empresa_privada',  label: 'Empresa privada' },
      { value: 'orgao_publico',    label: 'Órgão público' },
      { value: 'construtora',      label: 'Construtora / incorporadora' },
    ],
    getInsight(r) {
      if (r.segmento === 'orgao_publico') {
        return { text: 'Para órgãos públicos: documentação de habilitação pronta em 24h para pregões e concorrências.' };
      }
      if (r.segmento === 'construtora') {
        return { text: 'Instalação de elevadores novos com ART, projeto de engenharia e treinamento de equipe inclusos.' };
      }
      return null;
    },
  },

  /* ── Step 3: Situacao atual ── */
  {
    id: 'situacao',
    label: 'Como está a situação agora?',
    type: 'radio',
    options: [
      { value: 'parado',          label: 'Elevador parado' },
      { value: 'pessoas_presas',  label: 'Há pessoas presas no elevador' },
      { value: 'barulho',         label: 'Barulho ou vibração incomum' },
      { value: 'porta_defeito',   label: 'Porta com defeito' },
      { value: 'so_orcamento',    label: 'Apenas orçamento preventivo' },
      { value: 'outro',           label: 'Outra situação' },
    ],
    getInsight(r) {
      const s = r.situacao;
      if (s === 'pessoas_presas') {
        return {
          text: 'PRIORIDADE ALTA. Acionando emergência - ligue agora ou clique em WhatsApp abaixo.',
          emergency: true,
        };
      }
      if (s === 'parado') {
        return {
          text: 'Elevador parado: marcamos como PRIORIDADE ALTA. Atendimento emergencial em até 30 minutos.',
          emergency: true,
        };
      }
      if (s === 'barulho') {
        return { text: 'Barulho ou vibração pode indicar desgaste em cabos, guias ou mancais - importante agir antes de uma parada.' };
      }
      return null;
    },
  },

  /* ── Step 4: Equipamentos ── */
  {
    id: 'equipamentos',
    label: 'Quantos equipamentos e quais marcas?',
    sublabel: 'Informe a quantidade de elevadores e as marcas. Número de paradas é opcional.',
    type: 'mixed',
    fields: [
      {
        id: 'eq_quantidade',
        label: 'Quantidade de elevadores',
        type: 'number',
        placeholder: 'Ex.: 2',
        min: 1,
        required: true,
      },
      {
        id: 'eq_marcas',
        label: 'Marca(s)',
        type: 'checkboxes',
        options: ['Thyssen', 'Atlas', 'Otis', 'Schindler', 'Outra'],
        required: true,
        errorMsg: 'Selecione ao menos uma marca.',
      },
      {
        id: 'eq_paradas',
        label: 'Número de paradas',
        type: 'number',
        placeholder: 'Ex.: 10',
        min: 2,
        required: false,
        optional: true,
      },
    ],
    getInsight(r) {
      const qtd = parseInt(r.eq_quantidade, 10);
      const paradas = parseInt(r.eq_paradas, 10);
      if (!isNaN(paradas) && paradas > 10) {
        return { text: 'Equipamentos de grande porte (+10 paradas): orçamento personalizado com engenheiro responsável.' };
      }
      if (!isNaN(qtd) && qtd >= 5) {
        return { text: 'Parque com vários elevadores: contratos multi-equipamento com SLA dedicado e RAT por unidade.' };
      }
      return null;
    },
  },

  /* ── Step 5: Localizacao ── */
  {
    id: 'localizacao',
    label: 'Onde fica o equipamento?',
    type: 'radio',
    options: [
      { value: 'salvador',      label: 'Salvador (capital)' },
      { value: 'rms',           label: 'Região Metropolitana de Salvador' },
      { value: 'interior_ba',   label: 'Interior da Bahia' },
      { value: 'outro_estado',  label: 'Outro estado' },
    ],
    getInsight(r) {
      if (r.localizacao === 'outro_estado') {
        return { text: 'Para licitações em outros estados atendemos em todo o território nacional. Para manutenção, confirmaremos disponibilidade.' };
      }
      if (r.localizacao === 'interior_ba') {
        return { text: 'Atendemos todo o interior da Bahia - confirmaremos prazo e disponibilidade no retorno.' };
      }
      return null;
    },
  },

  /* ── Telefone ── */
  {
    id: 'telefone',
    label: 'Qual é o seu WhatsApp ou telefone?',
    sublabel: 'Formato aceito: (71) 99999-9999 ou 71999999999',
    type: 'text',
    fields: [
      {
        id: 'contato_telefone',
        label: 'Telefone / WhatsApp',
        type: 'tel',
        placeholder: '(71) 9 9999-9999',
        required: true,
        errorMsg: 'Informe um telefone válido no formato brasileiro.',
        validate: validatePhone,
      },
    ],
    getInsight: null,
  },

  /* ── Step 8: E-mail + observacoes ── */
  {
    id: 'final',
    label: 'Mais alguma informação?',
    sublabel: 'E-mail e observações são opcionais - pode pular se preferir.',
    type: 'final',
    fields: [
      {
        id: 'contato_email',
        label: 'E-mail',
        type: 'email',
        placeholder: 'você@exemplo.com',
        required: false,
        optional: true,
        errorMsg: 'Informe um e-mail válido ou deixe em branco.',
        validate: validateEmailOpt,
      },
      {
        id: 'observacoes',
        label: 'Observações adicionais',
        type: 'textarea',
        placeholder: 'Descreva qualquer detalhe que ajude nosso técnico...',
        required: false,
        optional: true,
      },
    ],
    getInsight: null,
  },
];

/* ── Estado da aplicação ─────────────────────────────────── */
const state = {
  currentStep: 0,  // index 0..TOTAL_STEPS-1
  respostas: {},   // acumula todas as respostas
  isSubmitting: false,
};

/* ── Validação de telefone BR ────────────────────────────── */
function validatePhone(v) {
  // Aceita formatos: (71)99999-9999, 71999999999, (71) 9 9999-9999, etc.
  const digits = v.replace(/\D/g, '');
  // Com DDD: 10 ou 11 digitos
  return digits.length === 10 || digits.length === 11;
}

/* ── Validação de e-mail opcional ────────────────────────── */
function validateEmailOpt(v) {
  // Vazio e valido (campo opcional)
  if (!v || v.trim() === '') return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/* ── Gerador de ID curto ─────────────────────────────────── */
function generateId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `UPT-${ts}-${rnd}`;
}

/* ── Calcula prioridade com base nas respostas ───────────── */
function calcPrioridade(r) {
  if (
    r.categoria === 'emergencia' ||
    r.situacao === 'pessoas_presas' ||
    r.situacao === 'parado'
  ) {
    return 'alta';
  }
  if (
    r.situacao === 'barulho' ||
    r.situacao === 'porta_defeito' ||
    r.categoria === 'manutencao_corr'
  ) {
    return 'media';
  }
  return 'baixa';
}

/* ── Monta o label legível de uma resposta ───────────────── */
function labelFor(stepId, value) {
  const step = STEPS.find(s => s.id === stepId);
  if (!step || !step.options) return value;
  const opt = step.options.find(o => o.value === value);
  return opt ? opt.label : value;
}

/* ── Constrói o objeto lead ──────────────────────────────── */
function buildLead() {
  const r = state.respostas;
  const prioridade = calcPrioridade(r);
  const marcas = r.eq_marcas || [];

  const resumo = [
    labelFor('categoria', r.categoria),
    labelFor('segmento', r.segmento),
    r.eq_quantidade ? `${r.eq_quantidade} elevador(es)` : '',
    marcas.length ? marcas.join('/') : '',
    labelFor('localizacao', r.localizacao),
    `Prioridade ${prioridade}`,
  ].filter(Boolean).join(' | ');

  return {
    id: generateId(),
    criadoEm: new Date().toISOString(),
    origem: 'site',
    status: 'novo',
    prioridade,
    categoria: r.categoria || '',
    segmento: r.segmento || '',
    situacao: r.situacao || '',
    equipamentos: {
      quantidade: r.eq_quantidade ? parseInt(r.eq_quantidade, 10) : null,
      marcas,
      paradas: r.eq_paradas ? parseInt(r.eq_paradas, 10) : null,
    },
    localizacao: r.localizacao || '',
    contato: {
      nome: r.contato_nome || '',
      telefone: r.contato_telefone || '',
      email: r.contato_email || '',
    },
    observacoes: r.observacoes || '',
    resumo,
  };
}

/* ── Monta mensagem do WhatsApp ──────────────────────────── */
function buildWhatsAppMsg(lead) {
  const sep = ' | ';
  const marcas = lead.equipamentos.marcas.length
    ? lead.equipamentos.marcas.join(', ')
    : 'não informado';

  const paradas = lead.equipamentos.paradas
    ? `${lead.equipamentos.paradas} paradas`
    : 'não informado';

  const qtd = lead.equipamentos.quantidade
    ? `${lead.equipamentos.quantidade} elevador(es)`
    : 'não informado';

  const lines = [
    `Olá, UPTEC! Sou ${lead.contato.nome}.`,
    '',
    `Tipo de necessidade: ${labelFor('categoria', lead.categoria)}`,
    `Segmento: ${labelFor('segmento', lead.segmento)}`,
    `Situação atual: ${labelFor('situacao', lead.situacao)}`,
    `Equipamentos: ${qtd} | Marca(s): ${marcas} | Paradas: ${paradas}`,
    `Localização: ${labelFor('localizacao', lead.localizacao)}`,
    '',
    `Prioridade: ${lead.prioridade.toUpperCase()}`,
    `Ref.: ${lead.id}`,
  ];

  if (lead.observacoes) {
    lines.push('', `Obs.: ${lead.observacoes}`);
  }

  return lines.join('\n');
}

/* ── Submete o lead (localStorage + fetch opcional) ─────── */
async function submitLead(lead) {
  /* 1. Sempre grava no localStorage */
  try {
    const arr = JSON.parse(localStorage.getItem('uptec_leads') || '[]');
    arr.push(lead);
    localStorage.setItem('uptec_leads', JSON.stringify(arr));
  } catch (e) {
    // localStorage pode estar bloqueado em alguns contextos — nao bloquear o fluxo
    console.warn('[UPTEC] Nao foi possivel gravar em localStorage:', e);
  }

  /* 2. Se LEAD_ENDPOINT configurado, envia via fetch (nao bloqueante) */
  const endpoint = window.UPTEC_CONFIG && window.UPTEC_CONFIG.LEAD_ENDPOINT;
  if (endpoint) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      // Falha silenciosa — o lead ja esta no localStorage
      console.warn('[UPTEC] Envio ao endpoint falhou (lead salvo em localStorage):', err);
    }
  }
}

/* ══════════════════════════════════════════════════════════
   RENDERIZAÇÃO
   ══════════════════════════════════════════════════════════ */

/* ── Renderiza opções radio ──────────────────────────────── */
function renderRadio(step, savedValue) {
  const name = `lf-${step.id}`;
  return `
    <ul class="lf-options" role="list" aria-label="${step.label}">
      ${step.options.map(opt => {
        const checked = savedValue === opt.value ? 'checked' : '';
        const id = `lf-opt-${step.id}-${opt.value}`;
        return `
          <li class="lf-option-item">
            <input
              class="lf-option-input"
              type="radio"
              name="${name}"
              id="${id}"
              value="${opt.value}"
              ${checked}
              aria-label="${opt.label}"
            />
            <label class="lf-option-label" for="${id}">
              <span class="lf-option-marker" aria-hidden="true"></span>
              <span class="lf-option-text">${opt.label}</span>
            </label>
          </li>`;
      }).join('')}
    </ul>`;
}

/* ── Renderiza campo de texto / tel / email / number ─────── */
function renderInputField(fieldDef, savedValue) {
  const val = savedValue || '';
  const optLabel = fieldDef.optional
    ? `<span class="lf-label-optional">(opcional)</span>`
    : '';
  const errId = `err-${fieldDef.id}`;

  if (fieldDef.type === 'textarea') {
    return `
      <div class="lf-field">
        <label class="lf-label" for="${fieldDef.id}">
          ${fieldDef.label}${optLabel}
        </label>
        <textarea
          class="lf-textarea"
          id="${fieldDef.id}"
          name="${fieldDef.id}"
          placeholder="${fieldDef.placeholder || ''}"
          aria-describedby="${errId}"
          ${fieldDef.required ? 'required' : ''}
        >${val}</textarea>
        <span class="lf-error-msg" id="${errId}" role="alert" aria-live="polite"></span>
      </div>`;
  }

  const minAttr = fieldDef.min !== undefined ? `min="${fieldDef.min}"` : '';
  return `
    <div class="lf-field">
      <label class="lf-label" for="${fieldDef.id}">
        ${fieldDef.label}${optLabel}
      </label>
      <input
        class="lf-input"
        type="${fieldDef.type}"
        id="${fieldDef.id}"
        name="${fieldDef.id}"
        placeholder="${fieldDef.placeholder || ''}"
        value="${val}"
        ${minAttr}
        ${fieldDef.required ? 'required' : ''}
        aria-describedby="${errId}"
        ${fieldDef.type === 'tel' ? 'autocomplete="tel"' : ''}
        ${fieldDef.type === 'email' ? 'autocomplete="email"' : ''}
      />
      <span class="lf-error-msg" id="${errId}" role="alert" aria-live="polite"></span>
    </div>`;
}

/* ── Renderiza checkboxes de marcas ──────────────────────── */
function renderCheckboxes(fieldDef, savedArr) {
  const saved = savedArr || [];
  const errId = `err-${fieldDef.id}`;
  return `
    <div class="lf-field">
      <span class="lf-label" id="lbl-${fieldDef.id}">${fieldDef.label}</span>
      <ul class="lf-checkboxes" role="list" aria-labelledby="lbl-${fieldDef.id}">
        ${fieldDef.options.map(opt => {
          const cbId = `cb-${fieldDef.id}-${opt.replace(/\s/g, '_')}`;
          const checked = saved.includes(opt) ? 'checked' : '';
          return `
            <li>
              <label class="lf-checkbox-item" for="${cbId}">
                <input
                  class="lf-checkbox-input"
                  type="checkbox"
                  id="${cbId}"
                  name="${fieldDef.id}"
                  value="${opt}"
                  ${checked}
                  aria-describedby="${errId}"
                />
                <span class="lf-checkbox-box" aria-hidden="true">
                  <span class="lf-checkbox-tick">
                    ${ICON_CHECK.replace('width="28" height="28"', 'width="12" height="12"').replace('var(--success)', 'white')}
                  </span>
                </span>
                <span class="lf-checkbox-label-text">${opt}</span>
              </label>
            </li>`;
        }).join('')}
      </ul>
      <span class="lf-error-msg" id="${errId}" role="alert" aria-live="polite"></span>
    </div>`;
}

/* ── Renderiza um step completo ──────────────────────────── */
function renderStepHTML(stepIndex) {
  const step = STEPS[stepIndex];
  const r = state.respostas;

  let fieldsHTML = '';

  if (step.type === 'radio') {
    fieldsHTML = renderRadio(step, r[step.id]);
  } else if (step.type === 'text' || step.type === 'final') {
    fieldsHTML = step.fields.map(f => {
      if (f.type === 'textarea') return renderInputField(f, r[f.id]);
      return renderInputField(f, r[f.id]);
    }).join('');
  } else if (step.type === 'mixed') {
    fieldsHTML = step.fields.map(f => {
      if (f.type === 'checkboxes') return renderCheckboxes(f, r[f.id]);
      return renderInputField(f, r[f.id]);
    }).join('');
  }

  /* Banner de emergência (step 3 — situação) */
  let emergencyBanner = '';
  if (step.id === 'situacao') {
    const s = r.situacao;
    const isEmergency = s === 'pessoas_presas' || s === 'parado';
    emergencyBanner = `
      <div class="lf-emergency-banner${isEmergency ? ' lf-emergency-banner--visible' : ''}" id="lf-emergency-banner" aria-live="polite">
        <div class="lf-emergency-banner-title">
          ${ICON_WARN}
          Atendimento de emergência disponível agora
        </div>
        <div class="lf-emergency-actions">
          <a
            href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Emergência - preciso de atendimento no elevador AGORA')}"
            target="_blank"
            rel="noopener noreferrer"
            class="lf-btn-emergency-wa"
            aria-label="Abrir WhatsApp de emergência"
          >
            ${ICON_WA} WhatsApp agora
          </a>
          <a
            href="tel:+5571996526835"
            class="lf-emergency-phone"
            aria-label="Ligar para a UPTEC Elevadores"
          >
            ${ICON_PHONE} (71) 99652-6835
          </a>
        </div>
      </div>`;
  }

  const sublabelHTML = step.sublabel
    ? `<span class="lf-question-sub">${step.sublabel}</span>`
    : '';

  return `
    <div
      class="lf-step"
      id="lf-step-${stepIndex}"
      data-step="${stepIndex}"
      role="group"
      aria-labelledby="lf-step-title-${stepIndex}"
    >
      <h2 class="lf-question" id="lf-step-title-${stepIndex}">
        ${step.label}
        ${sublabelHTML}
      </h2>
      ${emergencyBanner}
      <div class="lf-insight" id="lf-insight-${stepIndex}" aria-live="polite" aria-atomic="true">
        <span class="lf-insight-icon">${ICON_INFO}</span>
        <span class="lf-insight-text"></span>
      </div>
      ${fieldsHTML}
    </div>`;
}

/* ── Monta toda a estrutura HTML do formulario ───────────── */
function buildFormHTML() {
  const stepsHTML = STEPS.map((_, i) => renderStepHTML(i)).join('');
  return `
    <div class="lf-card">
      <!-- Anuncio de mudanca de passo para leitores de tela -->
      <div class="lf-aria-live" aria-live="polite" aria-atomic="true" id="lf-aria-announce"></div>

      <!-- Cabecalho com progresso -->
      <div class="lf-header">
        <div class="lf-progress-meta">
          <span class="lf-step-label" id="lf-step-label">Passo 1 de ${TOTAL_STEPS}</span>
          <span class="lf-step-fraction" id="lf-step-fraction" aria-hidden="true">1 / ${TOTAL_STEPS}</span>
        </div>
        <div class="lf-progress-bar-track" role="progressbar" aria-valuenow="1" aria-valuemin="1" aria-valuemax="${TOTAL_STEPS}" aria-label="Progresso do formulário">
          <div class="lf-progress-bar-fill" id="lf-progress-fill" style="width:${(1/TOTAL_STEPS*100).toFixed(1)}%"></div>
        </div>
      </div>

      <!-- Area dos passos -->
      <div class="lf-body">
        <div class="lf-steps-wrap" id="lf-steps-wrap">
          ${stepsHTML}
        </div>

        <!-- Painel de sucesso (oculto ate o envio) -->
        <div class="lf-success" id="lf-success" role="region" aria-label="Formulário enviado com sucesso">
          <div class="lf-success-icon" aria-hidden="true">${ICON_CHECK}</div>
          <h2 class="lf-success-title">Tudo certo! Abrindo o WhatsApp...</h2>
          <p class="lf-success-sub">
            Sua solicitação foi registrada. Estamos abrindo o WhatsApp para você finalizar o contato
            com nossa equipe técnica.
          </p>
          <span class="lf-success-id" id="lf-success-id" aria-label="Número de referência da solicitação"></span>
          <p style="font-size:var(--text-sm);color:var(--ink-dim);margin-bottom:var(--space-4);">
            Se o WhatsApp não abrir automaticamente:
          </p>
          <a
            id="lf-success-wa-link"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="lf-btn-emergency-wa"
            aria-label="Abrir WhatsApp manualmente"
          >
            ${ICON_WA} Abrir WhatsApp manualmente
          </a>
        </div>
      </div>

      <!-- Rodape com navegacao -->
      <div class="lf-footer" id="lf-footer">
        <button
          class="lf-btn-back"
          id="lf-btn-back"
          type="button"
          aria-label="Voltar ao passo anterior"
        >
          ${ICON_BACK} Voltar
        </button>
        <button
          class="lf-btn-next"
          id="lf-btn-next"
          type="button"
          aria-label="Continuar para o próximo passo"
        >
          Continuar ${ICON_NEXT}
        </button>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   LÓGICA DE NAVEGAÇÃO
   ══════════════════════════════════════════════════════════ */

/* ── Mostra / oculta steps com animação ──────────────────── */
function showStep(index, direction) {
  const allSteps = document.querySelectorAll('.lf-step');

  /* Esconde o step atual com animação de saida */
  allSteps.forEach(el => {
    if (!el.hidden) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        el.classList.add('lf-step--exit');
        el.addEventListener('animationend', () => {
          el.hidden = true;
          el.classList.remove('lf-step--exit');
        }, { once: true });
      } else {
        el.hidden = true;
      }
    }
  });

  /* Mostra o novo step */
  const target = document.getElementById(`lf-step-${index}`);
  if (!target) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const reveal = () => {
    target.hidden = false;
    if (!prefersReduced) {
      target.classList.add('lf-step--enter');
      target.addEventListener('animationend', () => {
        target.classList.remove('lf-step--enter');
      }, { once: true });
    }
    /* Foca no titulo do passo para leitores de tela */
    const title = target.querySelector('.lf-question');
    if (title) {
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: false });
    }
    /* Atualiza insight */
    updateInsight(index);
  };

  if (!prefersReduced) {
    // Pequeno delay para a animacao de saida iniciar antes da entrada
    setTimeout(reveal, 60);
  } else {
    reveal();
  }
}

/* ── Atualiza a barra de progresso e meta ────────────────── */
function updateProgress(index) {
  const stepNum = index + 1;
  const pct = (stepNum / TOTAL_STEPS * 100).toFixed(1);

  const fill = document.getElementById('lf-progress-fill');
  const label = document.getElementById('lf-step-label');
  const fraction = document.getElementById('lf-step-fraction');
  const bar = fill ? fill.parentElement : null;

  if (fill) fill.style.width = `${pct}%`;
  if (label) label.textContent = `Passo ${stepNum} de ${TOTAL_STEPS}`;
  if (fraction) fraction.textContent = `${stepNum} / ${TOTAL_STEPS}`;
  if (bar) {
    bar.setAttribute('aria-valuenow', stepNum);
  }

  /* Anuncio para leitores de tela */
  const announce = document.getElementById('lf-aria-announce');
  if (announce) {
    announce.textContent = `Passo ${stepNum} de ${TOTAL_STEPS}: ${STEPS[index].label}`;
  }
}

/* ── Atualiza o insight dinâmico do step ─────────────────── */
function updateInsight(stepIndex) {
  const step = STEPS[stepIndex];
  if (!step || !step.getInsight) return;

  const insight = step.getInsight(state.respostas);
  const el = document.getElementById(`lf-insight-${stepIndex}`);
  if (!el) return;

  const textEl = el.querySelector('.lf-insight-text');
  const iconEl = el.querySelector('.lf-insight-icon');

  if (insight) {
    if (textEl) textEl.textContent = insight.text;
    el.classList.add('lf-insight--visible');
    if (insight.emergency) {
      el.classList.add('lf-insight--emergency');
      if (iconEl) iconEl.innerHTML = ICON_WARN;
    } else {
      el.classList.remove('lf-insight--emergency');
      if (iconEl) iconEl.innerHTML = ICON_INFO;
    }
  } else {
    el.classList.remove('lf-insight--visible', 'lf-insight--emergency');
  }

  /* Atualiza banner de emergencia no step 3 */
  if (step.id === 'situacao') {
    const banner = document.getElementById('lf-emergency-banner');
    if (banner) {
      const isEmergency = ['pessoas_presas', 'parado'].includes(state.respostas.situacao);
      banner.classList.toggle('lf-emergency-banner--visible', isEmergency);
    }
  }
}

/* ── Controla visibilidade do botao Voltar ───────────────── */
function updateNavButtons(index) {
  const back = document.getElementById('lf-btn-back');
  const next = document.getElementById('lf-btn-next');

  if (back) {
    back.style.visibility = index === 0 ? 'hidden' : 'visible';
  }

  if (next) {
    const isLast = index === TOTAL_STEPS - 1;
    next.textContent = isLast ? 'Enviar solicitação' : 'Continuar';
    if (isLast) {
      next.insertAdjacentHTML('beforeend', ` ${ICON_NEXT}`);
    } else {
      next.innerHTML = `Continuar ${ICON_NEXT}`;
    }
  }
}

/* ══════════════════════════════════════════════════════════
   COLETA E VALIDAÇÃO DE DADOS
   ══════════════════════════════════════════════════════════ */

/* ── Coleta os valores do step atual ─────────────────────── */
function collectStepValues(stepIndex) {
  const step = STEPS[stepIndex];
  const container = document.getElementById(`lf-step-${stepIndex}`);
  if (!container) return;

  if (step.type === 'radio') {
    const checked = container.querySelector(`input[name="lf-${step.id}"]:checked`);
    if (checked) {
      state.respostas[step.id] = checked.value;
    }
  } else if (step.type === 'text' || step.type === 'final' || step.type === 'mixed') {
    step.fields.forEach(f => {
      if (f.type === 'checkboxes') {
        const boxes = container.querySelectorAll(`input[name="${f.id}"]:checked`);
        state.respostas[f.id] = Array.from(boxes).map(b => b.value);
      } else {
        const input = container.querySelector(`#${f.id}`);
        if (input) {
          state.respostas[f.id] = input.value.trim();
        }
      }
    });
  }
}

/* ── Valida o step atual; retorna true se valido ─────────── */
function validateCurrentStep() {
  const stepIndex = state.currentStep;
  const step = STEPS[stepIndex];
  const container = document.getElementById(`lf-step-${stepIndex}`);
  if (!container) return true;

  let valid = true;

  /* Radio: ao menos um selecionado */
  if (step.type === 'radio') {
    const checked = container.querySelector(`input[name="lf-${step.id}"]:checked`);
    if (!checked) {
      /* Nao ha campo de erro visivel no radio — foca na primeira opcao */
      const first = container.querySelector('.lf-option-input');
      if (first) first.focus();
      valid = false;
    }
  } else if (step.type === 'text' || step.type === 'final' || step.type === 'mixed') {
    step.fields.forEach(f => {
      if (f.type === 'checkboxes') {
        const boxes = container.querySelectorAll(`input[name="${f.id}"]:checked`);
        const errEl = container.querySelector(`#err-${f.id}`);
        if (f.required && boxes.length === 0) {
          if (errEl) {
            errEl.textContent = f.errorMsg || 'Selecione ao menos uma opção.';
            errEl.classList.add('lf-error-msg--visible');
          }
          valid = false;
        } else {
          if (errEl) errEl.classList.remove('lf-error-msg--visible');
        }
      } else {
        const input = container.querySelector(`#${f.id}`);
        const errEl = container.querySelector(`#err-${f.id}`);
        if (!input) return;

        const val = input.value.trim();
        let fieldOk = true;

        if (f.required && !val) {
          fieldOk = false;
        } else if (val && f.validate && !f.validate(val)) {
          fieldOk = false;
        }

        if (!fieldOk) {
          input.classList.add(`lf-${input.tagName.toLowerCase()}--error`);
          if (errEl) {
            errEl.textContent = f.errorMsg || 'Verifique este campo.';
            errEl.classList.add('lf-error-msg--visible');
          }
          if (valid) input.focus(); // foca no primeiro campo com erro
          valid = false;
        } else {
          input.classList.remove(`lf-input--error`, `lf-textarea--error`);
          if (errEl) errEl.classList.remove('lf-error-msg--visible');
        }
      }
    });
  }

  return valid;
}

/* ── Vai para o próximo passo ────────────────────────────── */
function goNext() {
  if (!validateCurrentStep()) return;
  collectStepValues(state.currentStep);
  updateInsight(state.currentStep);

  if (state.currentStep >= TOTAL_STEPS - 1) {
    finishForm();
    return;
  }

  state.currentStep++;
  updateProgress(state.currentStep);
  updateNavButtons(state.currentStep);
  showStep(state.currentStep, 'forward');
}

/* ── Volta ao passo anterior ─────────────────────────────── */
function goBack() {
  if (state.currentStep <= 0) return;
  collectStepValues(state.currentStep);
  state.currentStep--;
  updateProgress(state.currentStep);
  updateNavButtons(state.currentStep);
  showStep(state.currentStep, 'back');
}

/* ── Finaliza o formulario ───────────────────────────────── */
async function finishForm() {
  if (state.isSubmitting) return;
  state.isSubmitting = true;

  collectStepValues(state.currentStep);
  const lead = buildLead();
  const waMsg = buildWhatsAppMsg(lead);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  /* Mostra painel de sucesso antes do redirect */
  const stepsWrap = document.getElementById('lf-steps-wrap');
  const successEl = document.getElementById('lf-success');
  const footerEl = document.getElementById('lf-footer');
  const successId = document.getElementById('lf-success-id');
  const successLink = document.getElementById('lf-success-wa-link');

  if (stepsWrap) stepsWrap.style.display = 'none';
  if (footerEl) footerEl.style.display = 'none';
  if (successEl) successEl.classList.add('lf-success--visible');
  if (successId) successId.textContent = `Ref. ${lead.id}`;
  if (successLink) successLink.href = waUrl;

  /* Grava o lead (localStorage + endpoint opcional) */
  await submitLead(lead);

  /* Redireciona para WhatsApp apos breve pausa (750ms para exibir o painel) */
  setTimeout(() => {
    window.location.href = waUrl;
  }, 750);
}

/* ══════════════════════════════════════════════════════════
   INICIALIZAÇÃO
   ══════════════════════════════════════════════════════════ */

function init() {
  const root = document.getElementById('lead-form-root');
  if (!root) return; // nao existe no DOM, nao monta

  /* Injeta HTML */
  root.innerHTML = buildFormHTML();

  /* Inicia no step 0 */
  const allSteps = root.querySelectorAll('.lf-step');
  allSteps.forEach((el, i) => {
    el.hidden = i !== 0;
  });

  updateProgress(0);
  updateNavButtons(0);

  /* Foco inicial no titulo do primeiro step */
  const firstTitle = root.querySelector('.lf-question');
  if (firstTitle) {
    firstTitle.setAttribute('tabindex', '-1');
  }

  /* ── Event listeners ── */

  root.addEventListener('click', e => {
    if (e.target.closest('#lf-btn-next')) goNext();
    if (e.target.closest('#lf-btn-back')) goBack();
  });

  /* Enter avanca (exceto em textarea) */
  root.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const activeEl = e.target;

      /* Se for uma opcao radio, marca-a e avanca */
      if (activeEl.classList.contains('lf-option-input')) {
        activeEl.checked = true;
        /* Atualiza insight imediatamente */
        collectStepValues(state.currentStep);
        updateInsight(state.currentStep);
        goNext();
        return;
      }
      goNext();
    }
  });

  /* Atualiza insight em tempo real ao mudar selecao */
  root.addEventListener('change', e => {
    collectStepValues(state.currentStep);
    updateInsight(state.currentStep);
  });

  /* Limpa erros ao digitar */
  root.addEventListener('input', e => {
    const input = e.target;
    if (input.classList.contains('lf-input') || input.classList.contains('lf-textarea')) {
      input.classList.remove('lf-input--error', 'lf-textarea--error');
      const errEl = document.getElementById(`err-${input.id}`);
      if (errEl) errEl.classList.remove('lf-error-msg--visible');
    }
  });
}

/* Executa quando o DOM estiver pronto */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
