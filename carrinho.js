import { salvar, carregar } from "./utils.js";

export let carrinho = carregar("carrinho", []);

export function adicionar(nome, preco) {
  const item = carrinho.find(p => p.nome === nome);

  if (item) item.qtd++;
  else carrinho.push({ nome, preco, qtd: 1 });

  salvar("carrinho", carrinho);
}

export function remover(index) {
  carrinho.splice(index, 1);
  salvar("carrinho", carrinho);
}

export function limpar() {
  carrinho = [];
  salvar("carrinho", carrinho);
}

export function total() {
  return carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
}
