import { carrinho, total, limpar } from "./carrinho.js";
import { formatar, carregar, salvar } from "./utils.js";
import { atualizarUI } from "./ui.js";

const numeroWhatsApp = "5532988394464";

const taxas = {
  "Centro": 5,
  "São Mateus": 7,
  "Granbery": 6,
  "Outros": 10
};

let numeroPedido = carregar("numeroPedido", 1);

function desconto(total, cupom) {
  cupom = cupom.trim().toUpperCase();
  if (cupom === "DESCONTO10") return total * 0.10;
  if (cupom === "DESCONTO5") return total * 0.05;
  return 0;
}

function previsao() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() + 40);
  return agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function enviarPedido() {
  if (carrinho.length === 0) return alert("Seu carrinho está vazio.");

  const nome = document.getElementById("nomeCliente").value.trim();
  const telefone = document.getElementById("telefoneCliente").value.trim();
  const obs = document.getElementById("obs").value.trim();
  const cupom = document.getElementById("cupom").value.trim();
  const tipo = document.querySelector("input[name='tipo']:checked").value;

  if (!nome || !telefone) return alert("Preencha nome e telefone.");

  let msg = `🍔 *Pedido #${String(numeroPedido).padStart(3, "0")}*%0A`;
  msg += `👤 *Cliente:* ${nome}%0A`;
  msg += `📞 *Telefone:* ${telefone}%0A%0A`;

  msg += `*Itens:*%0A`;
  carrinho.forEach(item => {
    msg += `• ${item.nome} x${item.qtd} — R$ ${formatar(item.preco * item.qtd)}%0A`;
  });

  let valor = total();
  const desc = desconto(valor, cupom);

  if (desc > 0) {
    msg += `%0A💸 *Cupom:* -R$ ${formatar(desc)}%0A`;
    valor -= desc;
  }

  msg += `%0A💰 *Subtotal:* R$ ${formatar(valor)}%0A`;

  if (tipo === "entrega") {
    let enderecoCompleto = "";

if (document.getElementById("endereco-auto").style.display === "block") {
  enderecoCompleto = `${document.getElementById("rua").value}, ${document.getElementById("numero").value}, ${document.getElementById("bairroAuto").value}, ${document.getElementById("cidade").value} - ${document.getElementById("uf").value}`;
} else {
  enderecoCompleto = `${endereco}, Juiz de Fora, MG`;
}

    const bairro = document.getElementById("bairro").value;
    const pagamento = document.getElementById("pagamento").value;
    const troco = document.getElementById("troco").value || "Não informado";

    if (!endereco) return alert("Informe o endereço.");

    const taxa = taxas[bairro];
    valor += taxa;

    msg += `🏠 *Endereço:* ${endereco}%0A`;
    msg += `📍 *Bairro:* ${bairro}%0A`;
    msg += `🚚 *Taxa:* R$ ${formatar(taxa)}%0A`;
    msg += `💳 *Pagamento:* ${pagamento}%0A`;

    if (pagamento === "dinheiro") {
      msg += `💵 *Troco:* ${troco}%0A`;
    }

    msg += `⏱️ *Previsão:* ${previsao()}%0A`;
  }

  if (obs) msg += `%0A📝 *Obs:* ${obs}%0A`;

  msg += `%0A✅ *Total final:* R$ ${formatar(valor)}%0A`;
  msg += `%0A✅ Pedido enviado automaticamente pelo site!`;

  window.open(`https://wa.me/${numeroWhatsApp}?text=${msg}`, "_blank");

  numeroPedido++;
  salvar("numeroPedido", numeroPedido);

  limpar();
  atualizarUI();
}
