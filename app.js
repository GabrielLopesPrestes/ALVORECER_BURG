// =================== CONFIGURAÇÕES ===================
const numeroWhatsApp = "5532988394464"; // coloque aqui o número da loja (com DDI e DDD)

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

// Função para calcular distância entre dois pontos (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Função para buscar coordenadas do cliente
async function buscarCoordenadas(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (dados.length === 0) return null;

  return {
    lat: parseFloat(dados[0].lat),
    lon: parseFloat(dados[0].lon)
  };
}

// Função para calcular taxa pela distância
function calcularTaxaPorDistancia(distanciaKm) {
  for (let faixa of tabelaDistancia) {
    if (distanciaKm <= faixa.km) {
      return faixa.preco;
    }
  }
  return taxaPadrao;
}


let numeroPedido = Number(localStorage.getItem("numeroPedido")) || 1;

// =================== ESTADO ===================
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// =================== FUNÇÕES UTILITÁRIAS ===================
function formatar(valor) {
  return valor.toFixed(2).replace(".", ",");
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// =================== INICIALIZAÇÃO APÓS CARREGAR HTML ===================
document.addEventListener("DOMContentLoaded", () => {
  // Pega todos os elementos depois que o HTML existe
  const cardapioEl        = document.getElementById("cardapio");
  const carrinhoContainer = document.getElementById("carrinho-container");
  const listaCarrinho     = document.getElementById("lista-carrinho");
  const badge             = document.getElementById("badge");
  const totalEl           = document.getElementById("total");
  const btnCarrinho       = document.getElementById("btn-carrinho");
  const btnFinalizar      = document.getElementById("btn-finalizar");
  const modal             = document.getElementById("modal");
  const fecharModal       = document.getElementById("fechar");
  const dadosEntrega      = document.getElementById("dados-entrega");
  const pagamentoSelect   = document.getElementById("pagamento");
  const trocoContainer    = document.getElementById("troco-container");
  const btnConfirmar      = document.getElementById("confirmar");

  // ========== CARREGAR CARDÁPIO DO JSON ==========
  fetch("produtos.json")
    .then(res => res.json())
    .then(categorias => {
      categorias.forEach(cat => criarCategoria(cat, cardapioEl));
      inicializarBotoesAdicionar();
    })
    .catch(err => console.error("Erro ao carregar produtos.json:", err));

  function criarCategoria(cat, container) {
    const secao = document.createElement("section");
    secao.classList.add("categoria");

    secao.innerHTML = `
      <h2>${cat.categoria}</h2>
      <div class="cards"></div>
    `;

    const cardsEl = secao.querySelector(".cards");

    cat.produtos.forEach(prod => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${prod.imagem}" alt="${prod.nome}">
        <h3>${prod.nome}</h3>
        <p>${prod.descricao}</p>
        <span class="preco">R$ ${formatar(prod.preco)}</span>
        <button class="btn-add" data-produto="${prod.nome}" data-preco="${prod.preco}">
          Adicionar ao carrinho
        </button>
      `;

      cardsEl.appendChild(card);
    });

    container.appendChild(secao);
  }

  function inicializarBotoesAdicionar() {
    document.querySelectorAll(".btn-add").forEach(btn => {
      btn.addEventListener("click", () => {
        const nome  = btn.getAttribute("data-produto");
        const preco = Number(btn.getAttribute("data-preco"));
        adicionarAoCarrinho(nome, preco);
        animarBadge();
      });
    });

    atualizarCarrinho();
  }

  // ========== CARRINHO ==========
  function adicionarAoCarrinho(nome, preco) {
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
      itemExistente.qtd++;
    } else {
      carrinho.push({ nome, preco, qtd: 1 });
    }

    salvarCarrinho();
    atualizarCarrinho();
  }

  function removerItem(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho();
  }

  function calcularTotal() {
    return carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  }

  function atualizarCarrinho() {
    listaCarrinho.innerHTML = "";

    carrinho.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.nome} x${item.qtd}</span>
        <span>R$ ${formatar(item.preco * item.qtd)} <span class="remover" data-index="${index}">❌</span></span>
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
  }

  function animarBadge() {
    badge.classList.add("pulse");
    setTimeout(() => badge.classList.remove("pulse"), 400);
  }

  // ========== BOTÃO FLUTUANTE ABRIR/FECHAR CARRINHO ==========
  btnCarrinho.addEventListener("click", () => {
    carrinhoContainer.classList.toggle("ativo");
  });

  // ========== MODAL & ENTREGA/RETIRADA ==========
  btnFinalizar.addEventListener("click", () => {
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }
    modal.style.display = "block";
  });

  fecharModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // fechar modal clicando fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  document.querySelectorAll("input[name='tipo']").forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked && radio.value === "entrega") {
        dadosEntrega.style.display = "block";
      } else if (radio.checked && radio.value === "retirada") {
        dadosEntrega.style.display = "none";
      }
    });
  });

  pagamentoSelect.addEventListener("change", () => {
    if (pagamentoSelect.value === "dinheiro") {
      trocoContainer.style.display = "block";
    } else {
      trocoContainer.style.display = "none";
    }
  });

  // ========== CUPOM & HORÁRIO ==========
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

  // ========== CONFIRMAR PEDIDO → WHATSAPP ==========
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

  if (!nome || !telefone) {
    alert("Por favor, preencha nome e telefone.");
    return;
  }

  // Variáveis de entrega
  const endereco  = document.getElementById("endereco")?.value.trim() || "";
  const bairro    = document.getElementById("bairro")?.value || "";
  const pagamento = document.getElementById("pagamento")?.value || "";
  const troco     = document.getElementById("troco")?.value || "Não informado";

  let total = calcularTotal();
  const desconto = calcularDesconto(total, cupom);
  if (desconto > 0) total -= desconto;

  let taxaEntrega = 0;
  let distancia = 0;

  // ============================
  // CÁLCULO AUTOMÁTICO DA TAXA
  // ============================
  if (tipo === "entrega") {
    const enderecoCompleto = `${endereco}, Juiz de Fora, MG`;

    const coordsCliente = await buscarCoordenadas(enderecoCompleto);

    if (!coordsCliente) {
      alert("Não foi possível localizar o endereço. Verifique se está correto.");
      return;
    }

    distancia = calcularDistancia(lojaLat, lojaLon, coordsCliente.lat, coordsCliente.lon);
    taxaEntrega = calcularTaxaPorDistancia(distancia);

    total += taxaEntrega;
  }

  // ============================
  // MENSAGEM DO WHATSAPP
  // ============================

  let mensagem = `🔥 *Novo pedido chegando no ALVORECER BURG!* 🔥%0A%0A`;

  mensagem += `👤 *Cliente:* ${nome}%0A`;
  mensagem += `📞 *Contato:* ${telefone}%0A%0A`;

  mensagem += `🍔 *Itens do pedido:*%0A`;
  carrinho.forEach(item => {
    mensagem += `• ${item.nome} x${item.qtd} — R$ ${formatar(item.preco * item.qtd)}%0A`;
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
    mensagem += `🏠 *Endereço:* ${endereco}%0A`;
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

  // ABRIR WHATSAPP
  const url = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
  window.open(url, "_blank");

  // LIMPAR CARRINHO
  numeroPedido++;
  localStorage.setItem("numeroPedido", numeroPedido);

  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();
  modal.style.display = "none";
});

  // ========== PRIMEIRA ATUALIZAÇÃO DO CARRINHO ==========
  atualizarCarrinho();
});
