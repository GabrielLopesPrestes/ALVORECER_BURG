import { carrinho, remover, total } from "./carrinho.js";
import { formatar } from "./utils.js";

const lista = document.getElementById("lista-carrinho");
const badge = document.getElementById("badge");
const totalEl = document.getElementById("total");

export function atualizarUI() {
  lista.innerHTML = "";

  carrinho.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nome} x${item.qtd} — R$ ${formatar(item.preco * item.qtd)}
      <span class="remover" data-index="${index}">❌</span>
    `;
    lista.appendChild(li);
  });

  badge.textContent = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  totalEl.textContent = `Total: R$ ${formatar(total())}`;

  document.querySelectorAll(".remover").forEach(btn => {
    btn.addEventListener("click", () => remover(btn.dataset.index));
  });
}
