
  const CONFIG = {
    numero: '5544991736625',
    nomeLoja: 'Ericake'
  };

  const carrinho = {};

  function getCard(btn) {
    return btn.closest('.produto-card');
  }

  function adicionar(btn) {
    const card = getCard(btn);
    card.classList.add('selecionado');
    const id = card.dataset.id;

    if (card.dataset.tipo === 'peso') {
      carrinho[id] = {
        nome: card.dataset.nome,
        precoPorKg: parseFloat(card.dataset.precoKg),
        qty: 1,
        peso: 0.5,
        tipo: 'peso'
      };
      atualizarSubtotalPeso(card);
    } else {
      carrinho[id] = {
        nome: card.dataset.nome,
        preco: parseFloat(card.dataset.preco),
        qty: 1
      };
    }
    atualizarBarra();
  }

  function incrementar(btn) {
    const card = getCard(btn);
    const id = card.dataset.id;
    carrinho[id].qty++;
    card.querySelector('.qty-num').textContent = carrinho[id].qty;
    if (card.dataset.tipo === 'peso') atualizarSubtotalPeso(card);
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
      if (card.dataset.tipo === 'peso') {
        card.querySelector('.qty-peso').textContent = '0,50 kg';
        card.querySelector('.qty-subtotal').textContent = '';
      }
    } else {
      card.querySelector('.qty-num').textContent = carrinho[id].qty;
      if (card.dataset.tipo === 'peso') atualizarSubtotalPeso(card);
    }
    atualizarBarra();
  }

  function incrementarPeso(btn) {
    const card = getCard(btn);
    const id = card.dataset.id;
    carrinho[id].peso = Math.round((carrinho[id].peso + 0.5) * 10) / 10;
    card.querySelector('.qty-peso').textContent =
      carrinho[id].peso.toFixed(2).replace('.', ',') + ' kg';
    atualizarSubtotalPeso(card);
    atualizarBarra();
  }

  function decrementarPeso(btn) {
    const card = getCard(btn);
    const id = card.dataset.id;
    if (carrinho[id].peso <= 0.5) return;
    carrinho[id].peso = Math.round((carrinho[id].peso - 0.5) * 10) / 10;
    card.querySelector('.qty-peso').textContent =
      carrinho[id].peso.toFixed(2).replace('.', ',') + ' kg';
    atualizarSubtotalPeso(card);
    atualizarBarra();
  }

  function atualizarSubtotalPeso(card) {
    const id = card.dataset.id;
    const item = carrinho[id];
    const subtotal = item.precoPorKg * item.peso * item.qty;
    card.querySelector('.qty-subtotal').textContent =
      'Subtotal: R$ ' + subtotal.toFixed(2).replace('.', ',');
  }

  function atualizarBarra() {
    const itens = Object.values(carrinho);
    const totalQty = itens.reduce((s, i) => s + i.qty, 0);
    const totalVal = itens.reduce((s, i) => {
      if (i.tipo === 'peso') return s + i.precoPorKg * i.peso * i.qty;
      return s + i.preco * i.qty;
    }, 0);

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
    const itensPeso = itens.filter(i => i.tipo === 'peso');
    const itensNormais = itens.filter(i => i.tipo !== 'peso');
    let totalGeral = 0;
    let partes = [];

    // Bloco: bolos por kilo
    if (itensPeso.length > 0) {
      let totalBolos = 0;
      const linhasBolos = itensPeso.map(i => {
        const subtotal = i.precoPorKg * i.peso * i.qty;
        totalBolos += subtotal;
        totalGeral += subtotal;
        const pesoFmt = i.peso.toFixed(2).replace('.', ',');
        const subFmt = subtotal.toFixed(2).replace('.', ',');
        return `  • ${i.qty}x ${i.nome} — ${pesoFmt} kg cada (R$ ${i.precoPorKg.toFixed(2).replace('.', ',')}/kg) = R$ ${subFmt}`;
      });
      const boloPeso = itensPeso[0];
      const cabecalho = `*Encomenda de bolo por quilo:*\nOlá, ${CONFIG.nomeLoja}!\nGostaria de encomendar ${boloPeso.qty > 1 ? boloPeso.qty + ' bolos' : 'um bolo'} por quilo:\n\n${linhasBolos.join('\n')}\n\n*Subtotal bolos: R$ ${totalBolos.toFixed(2).replace('.', ',')}*\n\n_Sabores e data de retirada/entrega combino na sequência! `;
      partes.push(cabecalho);
    }

    // Bloco: demais produtos
    if (itensNormais.length > 0) {
      let totalNormal = 0;
      const linhasNormal = itensNormais.map(i => {
        const subtotal = i.preco * i.qty;
        totalNormal += subtotal;
        totalGeral += subtotal;
        return `  • ${i.qty}x ${i.nome} — R$ ${subtotal.toFixed(2).replace('.', ',')}`;
      });
      const cabecalho = itensPeso.length > 0
        ? `*Demais produtos:*\n${linhasNormal.join('\n')}\n\n*Subtotal demais: R$ ${totalNormal.toFixed(2).replace('.', ',')}*`
        : `Olá, ${CONFIG.nomeLoja}!\nGostaria de fazer o seguinte pedido:\n\n${linhasNormal.join('\n')}\n\n*Total: R$ ${totalNormal.toFixed(2).replace('.', ',')}*`;
      partes.push(cabecalho);
    }

    // Rodapé com total geral (só quando há os dois tipos)
    if (itensPeso.length > 0 && itensNormais.length > 0) {
      partes.push(`*Total geral: R$ ${totalGeral.toFixed(2).replace('.', ',')}*`);
    }

    partes.push('Pode confirmar disponibilidade e prazo?');
    return partes.join('\n\n---\n\n');
  }

  function enviarPedido() {
    const msg = encodeURIComponent(montarMensagem());
    window.open(`https://wa.me/${CONFIG.numero}?text=${msg}`, '_blank');
  }

  function abrirWppSemPedido() {
    const msg = encodeURIComponent(`Olá, ${CONFIG.nomeLoja}! Vi o site de vocês e gostaria de mais informações.`);
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