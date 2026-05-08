/* ==============================================
   UPFOOD — script.js
   Sistema de Reserva de Refeições - UP Ecoville
   ============================================== */

// === ESTADO GLOBAL ===
const Estado = {
  usuario: null,
  blocoAtual: null,
  estabelecimentoAtual: null,
  carrinho: [],
  horarioRetirada: null,
  metodoPagamento: null
};

// === DADOS DO SISTEMA ===
const BLOCOS = {
  vermelho: {
    nome: 'Bloco Vermelho',
    cor: '#EF4444',
    icon: '🔴',
    estabelecimentos: [
      { id: 'verm_1', nome: 'Cantina Central', tipo: 'Cantina', descricao: 'Refeições completas e lanches rápidos', icon: '🍽️', tempoEspera: '5-10 min', aberto: true, nota: 4.7 },
      { id: 'verm_2', nome: 'Sabor da UP',     tipo: 'Lanchonete', descricao: 'Salgados, sucos e cafezinho', icon: '☕', tempoEspera: '3-7 min',  aberto: true, nota: 4.5 },
      { id: 'verm_3', nome: 'Fit & Fresh',     tipo: 'Saladas',    descricao: 'Opções saudáveis e fit', icon: '🥗', tempoEspera: '8-12 min', aberto: false, nota: 4.8 }
    ]
  },
  azul: {
    nome: 'Bloco Azul',
    cor: '#3B82F6',
    icon: '🔵',
    estabelecimentos: [
      { id: 'azul_1', nome: 'Cantina Azul', tipo: 'Cantina', descricao: 'Pratos do dia e lanches variados', icon: '🍱', tempoEspera: '5-10 min', aberto: true, nota: 4.6 },
      { id: 'azul_2', nome: 'UP Café',       tipo: 'Cafeteria', descricao: 'Café, pães e doces artesanais', icon: '☕', tempoEspera: '2-5 min',  aberto: true, nota: 4.9 }
    ]
  },
  bege: {
    nome: 'Bloco Bege',
    cor: '#D4A96A',
    icon: '🟤',
    estabelecimentos: [
      { id: 'bege_1', nome: 'Cantina Bege',  tipo: 'Cantina',    descricao: 'Comida caseira fresquinha',    icon: '🍲', tempoEspera: '7-12 min', aberto: true, nota: 4.4 },
      { id: 'bege_2', nome: 'Burguer UP',    tipo: 'Fast food',  descricao: 'Hambúrgueres artesanais',      icon: '🍔', tempoEspera: '5-8 min',  aberto: true, nota: 4.7 }
    ]
  },
  amarelo: {
    nome: 'Bloco Amarelo',
    cor: '#EAB308',
    icon: '🟡',
    estabelecimentos: [
      { id: 'amar_1', nome: 'Cantina Amarela', tipo: 'Cantina', descricao: 'Pratos executivos e sobremesas', icon: '🍛', tempoEspera: '6-10 min', aberto: true, nota: 4.5 }
    ]
  },
  marrom: {
    nome: 'Bloco Marrom',
    cor: '#92400E',
    icon: '🟫',
    estabelecimentos: [
      { id: 'marr_1', nome: 'Cantina Marrom',   tipo: 'Cantina',  descricao: 'Refeições e lanches variados', icon: '🥙', tempoEspera: '5-10 min', aberto: true, nota: 4.3 },
      { id: 'marr_2', nome: 'Açaí da Terra',    tipo: 'Açaí',     descricao: 'Açaí, vitaminas e frutas',   icon: '🍇', tempoEspera: '3-6 min',  aberto: false, nota: 4.8 }
    ]
  },
  sul: {
    nome: 'Bloco Sul',
    cor: '#22C55E',
    icon: '🟢',
    estabelecimentos: [
      { id: 'sul_1', nome: 'Cantina Sul',    tipo: 'Cantina',  descricao: 'A cantina mais movimentada da UP', icon: '🍽️', tempoEspera: '5-10 min', aberto: true, nota: 4.6 },
      { id: 'sul_2', nome: 'Sushi UP',       tipo: 'Japonês',  descricao: 'Combinados e hot rolls',          icon: '🍱', tempoEspera: '10-15 min', aberto: true, nota: 4.9 },
      { id: 'sul_3', nome: 'Smoothie Bar',   tipo: 'Bebidas',  descricao: 'Sucos naturais e smoothies',      icon: '🥤', tempoEspera: '3-5 min',  aberto: true, nota: 4.7 }
    ]
  }
};

const CARDAPIO_BASE = {
  lanches: [
    { id: 1, nome: 'Pão de Queijo', descricao: 'Assado na hora, bem quentinho', icon: '🧀', preco: 3.50 },
    { id: 2, nome: 'Coxinha de Frango', descricao: 'Crocante por fora, macia por dentro', icon: '🍗', preco: 5.00 },
    { id: 3, nome: 'Bauru Especial', descricao: 'Queijo, presunto e tomate fresco', icon: '🥪', preco: 12.00 },
    { id: 4, nome: 'Sanduíche Natural', descricao: 'Frango, cream cheese e alface', icon: '🥗', preco: 10.00 }
  ],
  pratos: [
    { id: 5, nome: 'Prato Executivo', descricao: 'Arroz, feijão, salada e proteína', icon: '🍛', preco: 22.00 },
    { id: 6, nome: 'Strogonoff', descricao: 'Arroz, batata palha e creme especial', icon: '🍲', preco: 19.00 },
    { id: 7, nome: 'Macarrão ao Sugo', descricao: 'Macarrão ao molho de tomate fresco', icon: '🍝', preco: 16.00 }
  ],
  bebidas: [
    { id: 8, nome: 'Suco de Laranja', descricao: 'Natural, 300ml', icon: '🍊', preco: 5.00 },
    { id: 9, nome: 'Água Mineral', descricao: 'Gelada, 500ml', icon: '💧', preco: 3.00 },
    { id: 10, nome: 'Guaraná Antarctica', descricao: 'Lata 350ml', icon: '🥤', preco: 4.50 },
    { id: 11, nome: 'Café Coado', descricao: 'Copo 200ml', icon: '☕', preco: 3.50 }
  ],
  sobremesas: [
    { id: 12, nome: 'Brigadeiro', descricao: 'Belga artesanal', icon: '🍫', preco: 4.00 },
    { id: 13, nome: 'Açaí 300ml', descricao: 'Com granola e banana', icon: '🍇', preco: 14.00 }
  ]
};

// Horários disponíveis para retirada (gerado dinâmicamente)
function gerarHorarios() {
  const agora = new Date();
  const horariosBase = [];
  let h = agora.getHours();
  let m = agora.getMinutes();

  // Arredonda para o próximo múltiplo de 15
  m = Math.ceil(m / 15) * 15 + 15;
  if (m >= 60) { h += 1; m -= 60; }

  for (let i = 0; i < 6; i++) {
    if (m >= 60) { h += 1; m -= 60; }
    if (h >= 18) break;
    if (h >= 7) {
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      const vagas = Math.floor(Math.random() * 8) + 2;
      horariosBase.push({ hora: `${hStr}:${mStr}`, vagas });
    }
    m += 15;
  }

  // Garante pelo menos 3 horários
  if (horariosBase.length === 0) {
    horariosBase.push(
      { hora: '10:00', vagas: 5 },
      { hora: '10:15', vagas: 3 },
      { hora: '10:30', vagas: 8 }
    );
  }

  return horariosBase;
}

// === SESSÃO / LOCALSTORAGE ===
function salvarEstado() {
  try {
    localStorage.setItem('upfood_usuario',     JSON.stringify(Estado.usuario));
    localStorage.setItem('upfood_bloco',        Estado.blocoAtual  || '');
    localStorage.setItem('upfood_estab',        JSON.stringify(Estado.estabelecimentoAtual));
    localStorage.setItem('upfood_carrinho',     JSON.stringify(Estado.carrinho));
    localStorage.setItem('upfood_horario',      Estado.horarioRetirada || '');
    localStorage.setItem('upfood_pagamento',    Estado.metodoPagamento || '');
  } catch(e) { /* silencioso */ }
}

function restaurarEstado() {
  try {
    const u = localStorage.getItem('upfood_usuario');
    const b = localStorage.getItem('upfood_bloco');
    const e = localStorage.getItem('upfood_estab');
    const c = localStorage.getItem('upfood_carrinho');
    const h = localStorage.getItem('upfood_horario');
    const p = localStorage.getItem('upfood_pagamento');

    if (u) Estado.usuario             = JSON.parse(u);
    if (b) Estado.blocoAtual          = b;
    if (e) Estado.estabelecimentoAtual = JSON.parse(e);
    if (c) Estado.carrinho            = JSON.parse(c);
    if (h) Estado.horarioRetirada     = h;
    if (p) Estado.metodoPagamento     = p;
  } catch(e) { /* silencioso */ }
}

// === TOAST ===
let __toastTimer = null;
function toast(msg, tipo = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.className = '';
  el.textContent = msg;
  void el.offsetWidth;
  el.classList.add('visivel', tipo);
  clearTimeout(__toastTimer);
  __toastTimer = setTimeout(() => {
    el.classList.remove('visivel');
  }, 3500);
}

// === FORMATAÇÃO ===
function formatarPreco(val) {
  return `R$ ${val.toFixed(2).replace('.', ',')}`;
}

function primeiroNome(nome) {
  if (!nome) return '';
  return nome.split(' ')[0];
}

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// === CARRINHO ===
function totalCarrinho() {
  return Estado.carrinho.reduce((acc, item) => acc + item.preco * item.qty, 0);
}

function qtdCarrinho() {
  return Estado.carrinho.reduce((acc, item) => acc + item.qty, 0);
}

function adicionarItem(item) {
  const existente = Estado.carrinho.find(i => i.id === item.id);
  if (existente) {
    existente.qty += 1;
  } else {
    Estado.carrinho.push({ ...item, qty: 1 });
  }
  salvarEstado();
  atualizarCarrinhoUI();
}

function removerItem(id) {
  const existente = Estado.carrinho.find(i => i.id === id);
  if (!existente) return;
  if (existente.qty > 1) {
    existente.qty -= 1;
  } else {
    Estado.carrinho = Estado.carrinho.filter(i => i.id !== id);
  }
  salvarEstado();
  atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
  // Atualizar contadores nos botões
  document.querySelectorAll('[data-item-id]').forEach(card => {
    const id = parseInt(card.dataset.itemId);
    const item = Estado.carrinho.find(i => i.id === id);
    const qtyEl = card.querySelector('.qty-num');
    const btnRem = card.querySelector('.qty-btn.rem');

    if (qtyEl) {
      qtyEl.textContent = item ? item.qty : 0;
    }

    if (btnRem) {
      btnRem.style.display = item && item.qty > 0 ? 'flex' : 'none';
      if (qtyEl) qtyEl.style.display = item && item.qty > 0 ? 'block' : 'none';
    }
  });

  // Atualizar carrinho flutuante
  const carrinhoFloat = document.getElementById('carrinhoFloat');
  if (carrinhoFloat) {
    const qty = qtdCarrinho();
    const total = totalCarrinho();

    if (qty > 0) {
      carrinhoFloat.classList.remove('oculto');
      const countEl = carrinhoFloat.querySelector('.carrinho-count');
      const totalEl = carrinhoFloat.querySelector('.carrinho-total');
      if (countEl) countEl.textContent = qty;
      if (totalEl) totalEl.textContent = formatarPreco(total);
    } else {
      carrinhoFloat.classList.add('oculto');
    }
  }
}

// === PÁGINAS ===

// ----- index.html -----
function initIndex() {
  restaurarEstado();

  // Se já logado, redirecionar
  if (Estado.usuario) {
    window.location.href = 'home.html';
    return;
  }

  const form = document.getElementById('formLogin');
  if (!form) return;

  // Foco automático
  setTimeout(() => {
    const campoEmail = document.getElementById('campoEmail');
    if (campoEmail) campoEmail.focus();
  }, 300);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('campoEmail')?.value?.trim() || '';
    const rgm   = document.getElementById('campoRGM')?.value?.trim() || '';
    const btn   = form.querySelector('button[type="submit"]');

    // Validações
    let valido = true;

    if (!email.endsWith('@up.edu.br') && !email.endsWith('@positivo.br') && email.length < 5) {
      marcarErro('campoEmail', 'Use seu e-mail institucional (@up.edu.br)');
      valido = false;
    } else {
      limparErro('campoEmail');
    }

    if (rgm.length < 4) {
      marcarErro('campoRGM', 'RGM inválido');
      valido = false;
    } else {
      limparErro('campoRGM');
    }

    if (!valido) return;

    // Loading state
    const textoBtn = btn.innerHTML;
    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 1200)); // simulação

    const nome = email.split('@')[0].replace('.', ' ');
    Estado.usuario = {
      nome: nome.charAt(0).toUpperCase() + nome.slice(1),
      email,
      rgm,
      avatar: iniciais(nome)
    };
    salvarEstado();

    btn.innerHTML = '✅ Entrando...';
    await new Promise(r => setTimeout(r, 400));

    window.location.href = 'home.html';
  });
}

function marcarErro(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('erro');

  let msgEl = el.parentElement.querySelector('.form-erro-msg');
  if (!msgEl) {
    msgEl = document.createElement('span');
    msgEl.className = 'form-erro-msg';
    el.parentElement.appendChild(msgEl);
  }
  msgEl.textContent = msg;
}

function limparErro(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('erro');
  const msgEl = el.parentElement.querySelector('.form-erro-msg');
  if (msgEl) msgEl.remove();
}

// ----- home.html -----
function initHome() {
  restaurarEstado();
  protegerPagina();

  // Saudação
  const nomeEl = document.getElementById('nomeUsuario');
  const avatarEl = document.getElementById('avatarUsuario');

  if (nomeEl && Estado.usuario) {
    nomeEl.textContent = primeiroNome(Estado.usuario.nome) + '!';
  }
  if (avatarEl && Estado.usuario) {
    avatarEl.textContent = iniciais(Estado.usuario.nome);
  }

  // Links de blocos
  document.querySelectorAll('[data-bloco]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const bloco = el.dataset.bloco;
      Estado.blocoAtual = bloco;
      Estado.carrinho = [];
      salvarEstado();
      window.location.href = 'estabelecimentos.html';
    });
  });

  // Pedidos rápidos
  document.querySelectorAll('.pedido-rapido-card').forEach(el => {
    el.addEventListener('click', () => {
      // Simula seleção rápida
      Estado.blocoAtual = 'vermelho';
      Estado.estabelecimentoAtual = BLOCOS.vermelho.estabelecimentos[0];
      salvarEstado();
      window.location.href = 'cardapio.html';
    });
  });
}

// ----- estabelecimentos.html -----
function initEstabelecimentos() {
  restaurarEstado();
  protegerPagina();

  const bloco = BLOCOS[Estado.blocoAtual];
  if (!bloco) {
    window.location.href = 'home.html';
    return;
  }

  // Nome do bloco no header
  const labelEl = document.getElementById('blocoLabel');
  const nomeEl  = document.getElementById('blocoNome');
  if (labelEl) labelEl.textContent = 'Você está no';
  if (nomeEl)  nomeEl.textContent  = bloco.nome;

  // Renderizar estabelecimentos
  const lista = document.getElementById('listaEstabs');
  if (!lista) return;

  lista.innerHTML = '';

  bloco.estabelecimentos.forEach((estab, i) => {
    const card = document.createElement('a');
    card.href = '#';
    card.className = `estab-card anim-fadein anim-delay-${Math.min(i + 1, 3)}`;

    card.innerHTML = `
      <div class="estab-img">${estab.icon}</div>
      <div class="estab-info">
        <div class="estab-top">
          <div class="estab-nome">${estab.nome}</div>
          <span class="badge ${estab.aberto ? 'badge-green' : 'badge-red'}">
            ${estab.aberto ? '● Aberto' : '● Fechado'}
          </span>
        </div>
        <p class="estab-desc">${estab.descricao}</p>
        <div class="estab-meta">
          <span>⭐ ${estab.nota}</span>
          <span>⏱ ${estab.tempoEspera}</span>
          <span>📍 ${bloco.nome}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      if (!estab.aberto) {
        toast('Este estabelecimento está fechado no momento.', 'warn');
        return;
      }
      Estado.estabelecimentoAtual = estab;
      Estado.carrinho = [];
      salvarEstado();
      window.location.href = 'cardapio.html';
    });

    lista.appendChild(card);
  });
}

// ----- cardapio.html -----
function initCardapio() {
  restaurarEstado();
  protegerPagina();

  if (!Estado.estabelecimentoAtual) {
    window.location.href = 'home.html';
    return;
  }

  // Header info
  const estabNomeEl = document.getElementById('estabNome');
  const cardapioNomeEl = document.getElementById('cardapioNome');
  if (estabNomeEl) estabNomeEl.textContent = BLOCOS[Estado.blocoAtual]?.nome || '';
  if (cardapioNomeEl) cardapioNomeEl.textContent = Estado.estabelecimentoAtual.nome;

  // Filtros
  let filtroAtivo = 'todos';
  const filtros = document.querySelectorAll('.filtro-btn');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('ativo'));
      btn.classList.add('ativo');
      filtroAtivo = btn.dataset.filtro;
      renderCardapio(filtroAtivo);
    });
  });

  renderCardapio('todos');
  atualizarCarrinhoUI();

  // Carrinho flutuante → ir para pagamento
  const carrinhoFloat = document.getElementById('carrinhoFloat');
  if (carrinhoFloat) {
    carrinhoFloat.addEventListener('click', () => {
      if (qtdCarrinho() === 0) return;
      window.location.href = 'pagamento.html';
    });
  }
}

function renderCardapio(filtro) {
  const container = document.getElementById('cardapioContainer');
  if (!container) return;

  container.innerHTML = '';

  const secoes = filtro === 'todos'
    ? Object.entries(CARDAPIO_BASE)
    : Object.entries(CARDAPIO_BASE).filter(([key]) => key === filtro);

  const nomes = {
    lanches: 'Lanches',
    pratos: 'Pratos do Dia',
    bebidas: 'Bebidas',
    sobremesas: 'Sobremesas'
  };

  secoes.forEach(([key, itens]) => {
    const secao = document.createElement('div');
    secao.innerHTML = `<h3 class="cardapio-secao-titulo">${nomes[key] || key}</h3>`;

    itens.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'item-card';
      itemEl.dataset.itemId = item.id;

      const noCarrinho = Estado.carrinho.find(i => i.id === item.id);
      const qty = noCarrinho ? noCarrinho.qty : 0;

      itemEl.innerHTML = `
        <div class="item-thumb">${item.icon}</div>
        <div class="item-info">
          <div class="item-nome">${item.nome}</div>
          <div class="item-desc">${item.descricao}</div>
          <div class="item-preco">${formatarPreco(item.preco)}</div>
        </div>
        <div class="item-qty">
          <button class="qty-btn rem" style="display:${qty > 0 ? 'flex' : 'none'}" aria-label="Remover">−</button>
          <span class="qty-num" style="display:${qty > 0 ? 'block' : 'none'}">${qty}</span>
          <button class="qty-btn add" aria-label="Adicionar">+</button>
        </div>
      `;

      itemEl.querySelector('.qty-btn.add').addEventListener('click', () => {
        adicionarItem(item);
        toast(`${item.nome} adicionado! 🛒`, 'ok');
      });

      itemEl.querySelector('.qty-btn.rem').addEventListener('click', () => {
        removerItem(item.id);
      });

      secao.appendChild(itemEl);
    });

    container.appendChild(secao);
  });
}

// ----- pagamento.html -----
function initPagamento() {
  restaurarEstado();
  protegerPagina();

  if (Estado.carrinho.length === 0) {
    window.location.href = 'cardapio.html';
    return;
  }

  renderResumo();
  renderHorarios();
  renderMetodosPagamento();

  // Botão confirmar
  const btnConfirmar = document.getElementById('btnConfirmar');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', confirmarPedido);
  }
}

function renderResumo() {
  const container = document.getElementById('resumoItens');
  if (!container) return;

  container.innerHTML = '';

  Estado.carrinho.forEach(item => {
    const el = document.createElement('div');
    el.className = 'resumo-item';
    el.innerHTML = `
      <div class="resumo-item-thumb">${item.icon}</div>
      <div class="resumo-item-info">
        <div class="resumo-item-nome">${item.nome}</div>
        <div class="resumo-item-qtd">Qtd: ${item.qty}</div>
      </div>
      <div class="resumo-item-preco">${formatarPreco(item.preco * item.qty)}</div>
    `;
    container.appendChild(el);
  });

  // Totais
  const sub  = totalCarrinho();
  const taxa = 0;
  const total = sub + taxa;

  const subtotalEl = document.getElementById('subtotal');
  const totalEl    = document.getElementById('totalFinal');

  if (subtotalEl) subtotalEl.textContent = formatarPreco(sub);
  if (totalEl)    totalEl.textContent    = formatarPreco(total);
}

function renderHorarios() {
  const container = document.getElementById('horarioGrid');
  if (!container) return;

  const horarios = gerarHorarios();
  container.innerHTML = '';

  horarios.forEach((h, i) => {
    const opt = document.createElement('div');
    opt.className = `horario-opt${i === 0 ? ' selecionado' : ''}`;

    opt.innerHTML = `
      <div class="horario-opt-hora">${h.hora}</div>
      <div class="horario-opt-vagas">${h.vagas} vagas</div>
    `;

    opt.addEventListener('click', () => {
      document.querySelectorAll('.horario-opt').forEach(el => el.classList.remove('selecionado'));
      opt.classList.add('selecionado');
      Estado.horarioRetirada = h.hora;
      salvarEstado();
    });

    container.appendChild(opt);

    // Selecionar o primeiro por padrão
    if (i === 0) Estado.horarioRetirada = h.hora;
  });

  salvarEstado();
}

function renderMetodosPagamento() {
  const metodos = [
    { id: 'pix',       nome: 'Pix',       icon: '🔑' },
    { id: 'cartao',    nome: 'Cartão',    icon: '💳' },
    { id: 'carteira',  nome: 'Carteira UP', icon: '🎓' },
    { id: 'dinheiro',  nome: 'Dinheiro',  icon: '💵' }
  ];

  const container = document.getElementById('pagMethodGrid');
  if (!container) return;

  container.innerHTML = '';

  metodos.forEach((m, i) => {
    const el = document.createElement('div');
    el.className = `pag-method${i === 0 ? ' selecionado' : ''}`;

    el.innerHTML = `
      <div class="pag-method-icon">${m.icon}</div>
      <div class="pag-method-nome">${m.nome}</div>
    `;

    el.addEventListener('click', () => {
      document.querySelectorAll('.pag-method').forEach(p => p.classList.remove('selecionado'));
      el.classList.add('selecionado');
      Estado.metodoPagamento = m.id;
      salvarEstado();
    });

    container.appendChild(el);

    if (i === 0) Estado.metodoPagamento = m.id;
  });

  salvarEstado();
}

async function confirmarPedido() {
  if (!Estado.horarioRetirada) {
    toast('Selecione um horário de retirada', 'warn');
    return;
  }

  if (!Estado.metodoPagamento) {
    toast('Selecione uma forma de pagamento', 'warn');
    return;
  }

  const btn = document.getElementById('btnConfirmar');
  if (btn) {
    btn.innerHTML = '<div class="spinner"></div> Processando...';
    btn.disabled = true;
  }

  await new Promise(r => setTimeout(r, 1800)); // simulação de pagamento

  salvarEstado();
  window.location.href = 'confirmacao.html';
}

// ----- confirmacao.html -----
function initConfirmacao() {
  restaurarEstado();
  protegerPagina();

  if (Estado.carrinho.length === 0) {
    window.location.href = 'home.html';
    return;
  }

  // Número do pedido
  const numPedido = '#UP' + Math.floor(Math.random() * 9000 + 1000);
  const numEl = document.getElementById('numPedido');
  if (numEl) numEl.textContent = numPedido;

  // QR Code (visual decorativo)
  renderQR();

  // Detalhes
  const horarioEl  = document.getElementById('horarioConfirm');
  const localEl    = document.getElementById('localConfirm');
  const totalEl    = document.getElementById('totalConfirm');
  const pagamentoEl = document.getElementById('pagamentoConfirm');

  const nomesPag = {
    pix: 'Pix', cartao: 'Cartão de Crédito',
    carteira: 'Carteira UP', dinheiro: 'Dinheiro na retirada'
  };

  if (horarioEl)   horarioEl.textContent   = Estado.horarioRetirada || '--:--';
  if (localEl)     localEl.textContent     = Estado.estabelecimentoAtual?.nome || 'Cantina';
  if (totalEl)     totalEl.textContent     = formatarPreco(totalCarrinho());
  if (pagamentoEl) pagamentoEl.textContent = nomesPag[Estado.metodoPagamento] || Estado.metodoPagamento;

  // Botão novo pedido
  const btnNovo = document.getElementById('btnNovoPedido');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      Estado.carrinho = [];
      Estado.horarioRetirada = null;
      Estado.metodoPagamento = null;
      salvarEstado();
      window.location.href = 'home.html';
    });
  }

  // Countdown timer
  iniciarTimer();
}

function renderQR() {
  const grid = document.getElementById('qrGrid');
  if (!grid) return;

  grid.innerHTML = '';

  // QR code decorativo (padrão aleatório coeso)
  const pattern = [
    1,1,1,0,1,0,1,1,1,0,
    1,0,1,0,0,1,1,0,1,0,
    1,1,1,0,1,0,1,1,1,0,
    0,0,0,1,0,1,0,0,0,1,
    1,0,1,1,0,0,1,0,1,0,
    0,1,0,0,1,1,0,1,0,1,
    1,1,1,0,0,1,1,1,1,0,
    1,0,1,1,1,0,0,0,1,1,
    1,1,1,0,1,1,1,0,1,0,
    0,0,0,1,0,0,0,1,0,1
  ];

  pattern.forEach(on => {
    const cell = document.createElement('div');
    cell.className = `qr-cell${on ? ' on' : ''}`;
    grid.appendChild(cell);
  });
}

function iniciarTimer() {
  const timerEl = document.getElementById('timerRetirada');
  if (!timerEl || !Estado.horarioRetirada) return;

  const [h, m] = Estado.horarioRetirada.split(':').map(Number);
  const agora = new Date();
  const alvo  = new Date(agora);
  alvo.setHours(h, m, 0, 0);

  function atualizar() {
    const diff = alvo - new Date();
    if (diff <= 0) {
      timerEl.textContent = 'Pronto para retirada! 🎉';
      return;
    }
    const mins = Math.floor(diff / 60000);
    const segs = Math.floor((diff % 60000) / 1000);
    timerEl.textContent = `${String(mins).padStart(2,'0')}:${String(segs).padStart(2,'0')}`;
    setTimeout(atualizar, 1000);
  }

  atualizar();
}

// === UTILITÁRIOS ===
function protegerPagina() {
  if (!Estado.usuario) {
    window.location.href = 'index.html';
  }
}

function voltarPagina() {
  history.back();
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
  const pagina = window.location.pathname.split('/').pop() || 'index.html';

  switch (pagina) {
    case 'index.html':
    case '':
      initIndex(); break;
    case 'home.html':
      initHome(); break;
    case 'estabelecimentos.html':
      initEstabelecimentos(); break;
    case 'cardapio.html':
      initCardapio(); break;
    case 'pagamento.html':
      initPagamento(); break;
    case 'confirmacao.html':
      initConfirmacao(); break;
  }
});
