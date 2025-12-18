// ======================================================
// ✅ 1. CONFIGURAÇÕES GERAIS
// ======================================================

const numeroWhatsApp = "5532984801891";

// Coordenadas da hamburgueria
const lojaLat = -21.76094;
const lojaLon = -43.35041;

// Tabela de preços por distância (em KM)
const tabelaDistancia = [
  { km: 2, preco: 5 },
  { km: 4, preco: 7 },
  { km: 6, preco: 10 },
  { km: 8, preco: 12 },
  { km: 10, preco: 15 }
];

const taxaPadrao = 20;

let numeroPedido = Number(localStorage.getItem("numeroPedido")) || 1;
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let categoriasGlobais = [];


// ======================================================
// ✅ 2. FUNÇÕES UTILITÁRIAS
// ======================================================

function formatar(valor) {
  return valor.toFixed(2).replace(".", ",");
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function salvarFavoritos() {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function calcularTotal() {
  return carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
}

function calcularDesconto(total, cupom) {
  cupom = cupom.trim().toUpperCase();
  if (cupom === "DESCONTO10") return total * 0.1;
  if (cupom === "DESCONTO5") return total * 0.05;
  return 0;
}

function calcularHorarioEntrega() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() + 40);
  return agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}


// ======================================================
// ✅ 3. DISTÂNCIA E TAXA (Haversine + tabela)
// ======================================================

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function buscarCoordenadas(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
  const resposta = await fetch(url);
  const dados = await resposta.json();
  if (!Array.isArray(dados) || dados.length === 0) return null;
  return { lat: parseFloat(dados[0].lat), lon: parseFloat(dados[0].lon) };
}

function calcularTaxaPorDistancia(distanciaKm) {
  for (let faixa of tabelaDistancia) {
    if (distanciaKm <= faixa.km) {
      return faixa.preco;
    }
  }
  return taxaPadrao;
}


// ======================================================
// ✅ 4. FAVORITOS
// ======================================================

function toggleFavorito(nome) {
  if (favoritos.includes(nome)) {
    favoritos = favoritos.filter(f => f !== nome);
  } else {
    favoritos.push(nome);
  }
  salvarFavoritos();
  atualizarFavoritosVisual();
  atualizarFavoritosLista();
}

function atualizarFavoritosVisual() {
  document.querySelectorAll(".btn-fav").forEach(btn => {
    const nome = btn.getAttribute("data-produto");
    if (favoritos.includes(nome)) {
      btn.classList.add("favorito");
    } else {
      btn.classList.remove("favorito");
    }
  });
}

function atualizarFavoritosLista() {
  const favContainer = document.getElementById("cards-favoritos");
  if (!favContainer || !categoriasGlobais.length) return;

  favContainer.innerHTML = "";

  categoriasGlobais.forEach(cat => {
    cat.produtos.forEach(prod => {
      if (favoritos.includes(prod.nome)) {
        const card = document.createElement("div");
        card.classList.add("card");
        if (prod.combo) card.classList.add("combo");

        const comboTag = prod.combo ? `<span class="combo-tag">COMBO</span>` : "";

        card.innerHTML = `
          ${comboTag}
          <img src="${prod.imagem}" alt="${prod.nome}">
          <h3>${prod.nome}</h3>

          <p class="descricao curta">${prod.descricao}</p>
          <button class="ver-mais">Ver mais</button>

          <span class="preco">R$ ${formatar(prod.preco)}</span>
          <div class="card-actions">
            <button class="btn-add" data-produto="${prod.nome}" data-preco="${prod.preco}">
              Adicionar
            </button>
            <button class="btn-fav favorito" data-produto="${prod.nome}">⭐</button>
          </div>
        `;

        favContainer.appendChild(card);
      }
    });
  });

  atualizarFavoritosVisual();
}


// ======================================================
// ✅ 5. BUSCA NO CATÁLOGO (para combos, etc.)
// ======================================================

function encontrarProdutoPorNome(nome) {
  for (const cat of categoriasGlobais) {
    for (const prod of cat.produtos) {
      if (prod.nome === nome) return prod;
    }
  }
  return null;
}


// ======================================================
// ✅ 6. HISTÓRICO DE PEDIDOS
// ======================================================

function salvarPedidoHistorico(pedido) {
  let historico = JSON.parse(localStorage.getItem("historicoPedidos")) || [];
  historico.push(pedido);
  localStorage.setItem("historicoPedidos", JSON.stringify(historico));
}

function carregarHistoricoPedidos() {
  const container = document.getElementById("lista-pedidos");
  if (!container) return;

  container.innerHTML = "";

  let historico = JSON.parse(localStorage.getItem("historicoPedidos")) || [];

  if (historico.length === 0) {
    container.innerHTML = "<p>Você ainda não fez nenhum pedido.</p>";
    return;
  }

  historico.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("pedido-card");

    div.innerHTML = `
      <h3>Pedido #${p.numero}</h3>
      <p><strong>Data:</strong> ${p.data}</p>
      <p><strong>Total:</strong> R$ ${formatar(p.total)}</p>
      <p><strong>Status:</strong> ${p.status}</p>
      <p><strong>Tipo:</strong> ${p.tipo === "entrega" ? "Entrega" : "Retirada"}</p>
      ${p.endereco ? `<p><strong>Endereço:</strong> ${p.endereco}</p>` : ""}
      ${p.pagamento ? `<p><strong>Pagamento:</strong> ${p.pagamento}</p>` : ""}
      ${p.taxaEntrega !== undefined ? `<p><strong>Taxa de entrega:</strong> R$ ${formatar(p.taxaEntrega)}</p>` : ""}
      ${p.distanciaKm !== undefined ? `<p><strong>Distância:</strong> ${p.distanciaKm.toFixed(2)} km</p>` : ""}
      ${p.obs ? `<p><strong>Observações:</strong> ${p.obs}</p>` : ""}
      <h4>Itens:</h4>
      <ul>
        ${p.itens.map(i => `<li>${i.nome} x${i.qtd}</li>`).join("")}
      </ul>
    `;

    container.appendChild(div);
  });
}


// ======================================================
// ✅ 7. INICIALIZAÇÃO DO SITE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  const cardapioEl        = document.getElementById("cardapio");
  const carrinhoContainer = document.getElementById("carrinho-container");
  const listaCarrinho     = document.getElementById("lista-carrinho");
  const badge             = document.getElementById("badge");
  const totalEl           = document.getElementById("total");
  const btnCarrinho       = document.getElementById("btn-carrinho");
  const btnFinalizar      = document.getElementById("btn-finalizar");
  const modal             = document.getElementById("modal");
  const fecharModal       = document.getElementById("fechar");
  const pagamentoSelect   = document.getElementById("pagamento");
  const trocoContainer    = document.getElementById("troco-container");
  const btnConfirmar      = document.getElementById("confirmar");
  const enderecoPremium   = document.getElementById("endereco-premium");
  const resumoTotalEl     = document.getElementById("resumo-total");

  // ====================================================
  // ✅ 7.0 BOTÃO VER MAIS/VER MENOS (DESCRIÇÃO)
// ====================================================

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("ver-mais")) {
      const p = e.target.previousElementSibling;

      if (p && p.classList.contains("descricao")) {
        if (p.classList.contains("curta")) {
          p.classList.remove("curta");
          e.target.textContent = "Ver menos";
        } else {
          p.classList.add("curta");
          e.target.textContent = "Ver mais";
        }
      }
    }
  });

  // ====================================================
  // ✅ 7.1 ATUALIZAR RESUMO TOTAL (TOTAL + ENTREGA)
// ====================================================

  async function atualizarResumoTotal() {
    if (!resumoTotalEl) return;

    const tipo = document.querySelector("input[name='tipo']:checked")?.value || "retirada";
    let total = calcularTotal();

    // Retirada: só total
    if (tipo === "retirada") {
      resumoTotalEl.textContent = `💰 Total do Pedido: R$ ${formatar(total)}`;
      return;
    }

    // Entrega: tentar calcular taxa se endereço estiver completo
    const rua    = document.getElementById("rua").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const bairro = document.getElementById("bairroAuto").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const uf     = document.getElementById("uf").value.trim();

    if (!rua || !numero || !bairro || !cidade || !uf) {
      resumoTotalEl.textContent = `💰 Total do Pedido: R$ ${formatar(total)} (Preencha o endereço para calcular a entrega)`;
      return;
    }

    const enderecoCompleto = `${rua}, ${numero}, ${bairro}, ${cidade} - ${uf}`;

    const coordsCliente = await buscarCoordenadas(enderecoCompleto);
    if (!coordsCliente) {
      resumoTotalEl.textContent = `💰 Total do Pedido: R$ ${formatar(total)} (Endereço não localizado)`;
      return;
    }

    const distancia = calcularDistancia(lojaLat, lojaLon, coordsCliente.lat, coordsCliente.lon);
    const taxaEntrega = calcularTaxaPorDistancia(distancia);
    const totalComTaxa = total + taxaEntrega;

    resumoTotalEl.textContent =
      `💰 Total do Pedido: R$ ${formatar(totalComTaxa)}  |  🚚 Entrega: R$ ${formatar(taxaEntrega)}`;
  }

  document.addEventListener("input", atualizarResumoTotal);
  document.addEventListener("change", atualizarResumoTotal);
  if (btnFinalizar) btnFinalizar.addEventListener("click", atualizarResumoTotal);


  // ====================================================
  // ✅ 7.2 CARREGAR CARDÁPIO (produtos.json)
// ====================================================

  fetch("produtos.json")
    .then(res => res.json())
    .then(categorias => {
      categoriasGlobais = categorias;
      categorias.forEach(cat => criarCategoria(cat, cardapioEl));
      atualizarFavoritosLista();
      atualizarFavoritosVisual();
      atualizarCarrinho();
      carregarHistoricoPedidos();
    })
    .catch(err => console.error("Erro ao carregar produtos.json:", err));

  function criarCategoria(cat, container) {
    const secao = document.createElement("section");
  secao.classList.add("categoria");

  secao.innerHTML = `
    <h2>${cat.categoria}</h2>
    <div class="cards"></div>
    <button class="btn-ver-categoria">Ver mais</button>
  `;

  const cardsEl = secao.querySelector(".cards");
  const btnVer = secao.querySelector(".btn-ver-categoria");

  // Renderizar apenas 4 itens
  const produtosVisiveis = cat.produtos.slice(0, 4);

  function renderizar(lista) {
    cardsEl.innerHTML = "";
    lista.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("card");
      if (prod.combo) card.classList.add("combo");

      const comboTag = prod.combo ? `<span class="combo-tag">COMBO</span>` : "";

      card.innerHTML = `
        ${comboTag}
        <img src="${prod.imagem}">
        <h3>${prod.nome}</h3>
        <p class="descricao curta">${prod.descricao}</p>
        <button class="ver-mais">Ver mais</button>
        <span class="preco">R$ ${formatar(prod.preco)}</span>
        <div class="card-actions">
          <button class="btn-add" data-produto="${prod.nome}" data-preco="${prod.preco}">Adicionar</button>
          <button class="btn-fav" data-produto="${prod.nome}">⭐</button>
        </div>
      `;
      cardsEl.appendChild(card);
    });
  }

  renderizar(produtosVisiveis);

  let expandido = false;

  btnVer.addEventListener("click", () => {
    expandido = !expandido;

    if (expandido) {
      renderizar(cat.produtos);
      btnVer.textContent = "Ver menos";
    } else {
      renderizar(produtosVisiveis);
      btnVer.textContent = "Ver mais";
    }

    atualizarFavoritosVisual();
  });

  container.appendChild(secao);
}


  // ======================================================
  // ✅ 7.3 EVENT DELEGATION (ADD AO CARRINHO + FAVORITOS)
// ======================================================

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".btn-add");
    if (addBtn) {
      const nome  = addBtn.getAttribute("data-produto");
      const preco = Number(addBtn.getAttribute("data-preco"));
      adicionarAoCarrinho(nome, preco);
      animarBadge();
    }

    const favBtn = e.target.closest(".btn-fav");
    if (favBtn) {
      const nome = favBtn.getAttribute("data-produto");
      toggleFavorito(nome);
    }
  });


  // ======================================================
  // ✅ 7.4 CARRINHO
// ======================================================

  function adicionarAoCarrinho(nome, preco) {
    const produto = encontrarProdutoPorNome(nome);
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
      itemExistente.qtd++;
    } else {
      if (produto && produto.combo) {
        carrinho.push({
          nome,
          preco,
          qtd: 1,
          itens: produto.itens || []
        });
      } else {
        carrinho.push({ nome, preco, qtd: 1 });
      }
    }

    salvarCarrinho();
    atualizarCarrinho();
  }

  function removerItem(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho();
  }

  function atualizarCarrinho() {
    listaCarrinho.innerHTML = "";

    carrinho.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.nome} x${item.qtd}</span>
        <span>
          R$ ${formatar(item.preco * item.qtd)}
          <span class="remover" data-index="${index}">❌</span>
        </span>
      `;
      listaCarrinho.appendChild(li);
    });

    const total = calcularTotal();
    totalEl.textContent = `Total: R$ ${formatar(total)}`;

    const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
    badge.textContent = totalItens;

    document.querySelectorAll(".remover").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.getAttribute("data-index");
        removerItem(index);
      });
    });

    atualizarFavoritosVisual();
  }

  function animarBadge() {
    badge.classList.add("pulse");
    setTimeout(() => badge.classList.remove("pulse"), 400);
  }

  if (btnCarrinho) {
    btnCarrinho.addEventListener("click", () => {
      carrinhoContainer.classList.toggle("ativo");
    });
  }


  // ======================================================
  // ✅ 7.5 MODAL, ENTREGA/RETIRADA E PAGAMENTO
// ======================================================

  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
      if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
      }
      modal.style.display = "block";
      atualizarResumoTotal();
    });
  }

  if (fecharModal) {
    fecharModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document.querySelectorAll("input[name='tipo']").forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked && radio.value === "entrega") {
        if (enderecoPremium) enderecoPremium.style.display = "block";
      } else if (radio.checked && radio.value === "retirada") {
        if (enderecoPremium) enderecoPremium.style.display = "none";
      }
      atualizarResumoTotal();
    });
  });

  pagamentoSelect.addEventListener("change", () => {
    if (pagamentoSelect.value === "dinheiro") {
      trocoContainer.style.display = "block";
    } else {
      trocoContainer.style.display = "none";
    }
  });


  // ======================================================
  // ✅ 7.6 CEP PREMIUM (ViaCEP)
// ======================================================

  document.getElementById("btn-buscar-cep").addEventListener("click", async () => {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");

    if (cep.length !== 8) {
      alert("CEP inválido.");
      return;
    }

    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (dados.erro) {
      document.getElementById("cep-erro").style.display = "block";
      return;
    }

    document.getElementById("cep-erro").style.display = "none";

    document.getElementById("rua").value = dados.logradouro;
    document.getElementById("bairroAuto").value = dados.bairro;
    document.getElementById("cidade").value = dados.localidade;
    document.getElementById("uf").value = dados.uf;

    document.getElementById("endereco-auto").style.display = "block";
    atualizarResumoTotal();
  });

  document.getElementById("btn-nao-sabe-cep").addEventListener("click", () => {
    document.getElementById("busca-sem-cep").style.display = "block";
  });

  document.getElementById("btn-buscar-rua").addEventListener("click", async () => {
    const uf = document.getElementById("uf2").value;
    const cidade = document.getElementById("cidade2").value;
    const rua = document.getElementById("rua2").value;

    const url = `https://viacep.com.br/ws/${uf}/${cidade}/${rua}/json/`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const lista = document.getElementById("lista-ceps");
    lista.innerHTML = "";

    if (!Array.isArray(dados)) {
      alert("Nenhum endereço encontrado.");
      return;
    }

    dados.forEach(item => {
      const option = document.createElement("option");
      option.value = item.cep;
      option.textContent = `${item.logradouro} — CEP ${item.cep}`;
      lista.appendChild(option);
    });

    lista.style.display = "block";

    lista.addEventListener("change", () => {
      document.getElementById("cep").value = lista.value;
    });
  });


  // ======================================================
  // ✅ 7.7 CONFIRMAR PEDIDO → WHATSAPP + HISTÓRICO
// ======================================================

  btnConfirmar.addEventListener("click", async () => {
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    const nome      = document.getElementById("nomeCliente").value.trim();
    const telefone  = document.getElementById("telefoneCliente").value.trim();
    const obs       = document.getElementById("obs").value.trim();
    const cupom     = document.getElementById("cupom").value.trim();
    const tipo      = document.querySelector("input[name='tipo']:checked").value;
    const pagamento = document.getElementById("pagamento").value;
    const troco     = document.getElementById("troco").value || "Não informado";

    if (!nome || !telefone) {
      alert("Por favor, preencha nome e telefone.");
      return;
    }

    let enderecoCompleto = "";
    let taxaEntrega = 0;
    let distancia = 0;

    if (tipo === "entrega") {
      const rua    = document.getElementById("rua").value.trim();
      const numero = document.getElementById("numero").value.trim();
      const bairro = document.getElementById("bairroAuto").value.trim();
      const cidade = document.getElementById("cidade").value.trim();
      const uf     = document.getElementById("uf").value.trim();

      if (!rua || !numero || !bairro || !cidade || !uf) {
        alert("Por favor, preencha o endereço corretamente após buscar o CEP.");
        return;
      }

      enderecoCompleto = `${rua}, ${numero}, ${bairro}, ${cidade} - ${uf}`;

      const coordsCliente = await buscarCoordenadas(enderecoCompleto);

      if (!coordsCliente) {
        alert("Não foi possível localizar o endereço. Verifique se está correto.");
        return;
      }

      distancia = calcularDistancia(lojaLat, lojaLon, coordsCliente.lat, coordsCliente.lon);
      taxaEntrega = calcularTaxaPorDistancia(distancia);
    }

    let total = calcularTotal();
    const desconto = calcularDesconto(total, cupom);
    if (desconto > 0) total -= desconto;
    if (tipo === "entrega") total += taxaEntrega;

    // Mensagem WhatsApp
    let mensagem = `🔥 *Novo pedido chegando no ALVORECER BURG!* 🔥%0A%0A`;

    mensagem += `👤 *Cliente:* ${nome}%0A`;
    mensagem += `📞 *Contato:* ${telefone}%0A%0A`;

    mensagem += `🍔 *Itens do pedido:*%0A`;
    carrinho.forEach(item => {
      mensagem += `• ${item.nome} x${item.qtd} — R$ ${formatar(item.preco * item.qtd)}%0A`;

      if (item.itens && Array.isArray(item.itens) && item.itens.length > 0) {
        mensagem += `   • Itens do combo: ${item.itens.join(", ")}%0A`;
      }
    });

    mensagem += `%0A💰 *Subtotal:* R$ ${formatar(calcularTotal())}%0A`;

    if (desconto > 0) {
      mensagem += `💸 *Cupom aplicado:* -R$ ${formatar(desconto)}%0A`;
    }

    if (tipo === "entrega") {
      mensagem += `📏 *Distância:* ${distancia.toFixed(2)} km%0A`;
      mensagem += `🚚 *Taxa de entrega:* R$ ${formatar(taxaEntrega)}%0A`;
    }

    mensagem += `✅ *Total:* R$ ${formatar(total)}%0A%0A`;
    mensagem += `📦 *Tipo:* ${tipo === "entrega" ? "Entrega" : "Retirada no local"}%0A`;

    if (tipo === "entrega") {
      mensagem += `🏠 *Endereço:* ${enderecoCompleto}%0A`;
      mensagem += `💳 *Pagamento:* ${pagamento}%0A`;
      if (pagamento === "dinheiro") {
        mensagem += `💵 *Troco:* ${troco}%0A`;
      }
      mensagem += `⏱️ *Previsão:* ${calcularHorarioEntrega()}%0A`;
    }

    if (obs) {
      mensagem += `%0A📝 *Observações:* ${obs}%0A`;
    }

    mensagem += `%0A✅ Pedido enviado automaticamente pelo site!`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    window.open(url, "_blank");

    // Salvar histórico completo
    salvarPedidoHistorico({
      numero: numeroPedido,
      data: new Date().toLocaleString("pt-BR"),
      total: total,
      status: "Enviado",
      tipo,
      endereco: enderecoCompleto,
      pagamento,
      taxaEntrega: tipo === "entrega" ? taxaEntrega : 0,
      distanciaKm: tipo === "entrega" ? distancia : 0,
      obs,
      itens: carrinho
    });

    numeroPedido++;
    localStorage.setItem("numeroPedido", numeroPedido);

    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
    carregarHistoricoPedidos();
    modal.style.display = "none";
    if (resumoTotalEl) resumoTotalEl.textContent = "";
  });


  // ======================================================
  // ✅ 7.8 MÁSCARAS (CEP e TELEFONE)
// ======================================================

  const cepInput = document.getElementById("cep");
  if (cepInput) {
    cepInput.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "");
      if (v.length > 5) {
        this.value = v.replace(/(\d{5})(\d)/, "$1-$2");
      } else {
        this.value = v;
      }
    });
  }

  const telInput = document.getElementById("telefoneCliente");
  if (telInput) {
    telInput.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "");

      if (v.length > 10) {
        this.value = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      } else if (v.length > 6) {
        this.value = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else if (v.length > 2) {
        this.value = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
      } else {
        this.value = v;
      }
    });
  }

  // primeira atualização do carrinho/favoritos/histórico
  atualizarCarrinho();
  atualizarFavoritosLista();
  atualizarFavoritosVisual();
  carregarHistoricoPedidos();
});

