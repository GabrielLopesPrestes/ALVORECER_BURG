// Formata valores em reais
export function formatar(valor) {
  return valor.toFixed(2).replace(".", ",");
}

// Salva JSON no localStorage
export function salvar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

// Carrega JSON do localStorage
export function carregar(chave, padrao) {
  return JSON.parse(localStorage.getItem(chave)) || padrao;
}
