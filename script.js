  // ── Configuração — edite aqui ──────────────────────────────
  const CONFIG = {
    numero: '5544991736625',   // seu número com código do país (55) + DDD + número
    nomeLoja: 'Ericake'
  };
  // ──────────────────────────────────────────────────────────

  const carrinho = {};

  function getCard(btn) {
    return btn.closest('.produto-card');
  }

  function adicionar(btn) {
    const card = getCard(btn);
    card.classList.add('selecionado');
    const id = card.dataset.id;
    carrinho[id] = { nome: card.dataset.nome, preco: parseFloat(card.dataset.preco), qty: 1 };
    atualizarBarra();
  }

  function incrementar(btn) {
    const card = getCard(btn);
    const id = card.dataset.id;
    carrinho[id].qty++;
    card.querySelector('.qty-num').textContent = carrinho[id].qty;
    atualizarBarra();
  }

  function decrementar(btn) {
    const card = getCard(btn);
    const id = card.dataset.id;
    carrinho[id].qty--;
    if (carrinho[id].qty <= 0) {
      delete carrinho[id];
      card.classList.remove('selecionado');
      card.querySelector('.qty-num').textContent = '1';
    } else {
      card.querySelector('.qty-num').textContent = carrinho[id].qty;
    }
    atualizarBarra();
  }

  function atualizarBarra() {
    const itens = Object.values(carrinho);
    const totalQty = itens.reduce((s, i) => s + i.qty, 0);
    const totalVal = itens.reduce((s, i) => s + i.preco * i.qty, 0);

    const barra = document.getElementById('barraPedido');
    const fab = document.getElementById('fabWpp');

    if (totalQty === 0) {
      barra.classList.remove('visivel');
      fab.classList.add('visivel');
    } else {
      barra.classList.add('visivel');
      fab.classList.remove('visivel');
      document.getElementById('barraItens').textContent =
        totalQty === 1 ? '1 item no pedido' : `${totalQty} itens no pedido`;
      document.getElementById('barraTotal').textContent =
        'R$ ' + totalVal.toFixed(2).replace('.', ',');
    }
  }

  function montarMensagem() {
    const itens = Object.values(carrinho);
    const total = itens.reduce((s, i) => s + i.preco * i.qty, 0);
    const linhas = itens
      .map(i => `  • ${i.qty}x ${i.nome} — R$ ${(i.preco * i.qty).toFixed(2).replace('.', ',')}`)
      .join('\n');
    return `Olá, ${CONFIG.nomeLoja}! 👋\nGostaria de fazer o seguinte pedido:\n\n${linhas}\n\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\nPode confirmar disponibilidade e prazo?`;
  }

  function enviarPedido() {
    const msg = encodeURIComponent(montarMensagem());
    window.open(`https://wa.me/${CONFIG.numero}?text=${msg}`, '_blank');
  }

  function abrirWppSemPedido() {
    const msg = encodeURIComponent(`Olá, ${CONFIG.nomeLoja}! Vi o site de vocês e gostaria de mais informações. 😊`);
    window.open(`https://wa.me/${CONFIG.numero}?text=${msg}`, '_blank');
  }

  // ── Scroll suave para seções ──────────────────────────────
  function scrollSecao(id, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('ativa'));
    btn.classList.add('ativa');
    const el = document.getElementById(id);
    if (el) {
      const offset = document.querySelector('.categorias').offsetHeight + 12;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // ── Atualiza categoria ativa no scroll ───────────────────
  const secoes = ['destaques', 'doces', 'salgados', 'kits', 'info'];
  const catBtns = document.querySelectorAll('.cat-btn');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = secoes.indexOf(entry.target.id);
        if (idx >= 0) {
          catBtns.forEach(b => b.classList.remove('ativa'));
          catBtns[idx].classList.add('ativa');
        }
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  secoes.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });