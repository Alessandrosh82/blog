// script.js atualizado com melhorias

// Utilidades
function salvarLocalmente(nome, valor) {
  localStorage.setItem(nome, valor);
}

function carregarLocalmente(nome) {
  return localStorage.getItem(nome) || "";
}

function criarMensagem(texto, cor = '#25d366') {
  const msg = document.createElement('div');
  msg.textContent = texto;
  msg.style.position = 'fixed';
  msg.style.bottom = '1rem';
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.background = cor;
  msg.style.color = 'white';
  msg.style.padding = '0.8rem 1.2rem';
  msg.style.borderRadius = '12px';
  msg.style.zIndex = '9999';
  msg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

// Produtos e carrinho
let produtos = [];
let carrinho = [];

function carregarProdutos() {
  const container = document.getElementById("produtos");
  container.innerHTML = "";
  const categorias = [...new Set(produtos.map(p => p.categoria))];

  categorias.forEach(categoria => {
    const secao = document.createElement("section");
    const titulo = document.createElement("h2");
    titulo.textContent = categoria;
    secao.appendChild(titulo);

    produtos.filter(p => p.categoria === categoria).forEach(produto => {
      const el = document.createElement("div");
      el.className = "produto";
      el.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}" style="max-width:100%; height:auto" />
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <strong>R$ ${produto.preco.toFixed(2)}</strong>
        <div class="quantidade-container">
          <button onclick="alterarQtd(${produto.id}, -1)">-</button>
          <span id="qtd-${produto.id}">1</span>
          <button onclick="alterarQtd(${produto.id}, 1)">+</button>
        </div>
        <button onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>
      `;
      secao.appendChild(el);
    });

    container.appendChild(secao);
  });
}

function alterarQtd(id, delta) {
  const span = document.getElementById(`qtd-${id}`);
  let qtd = parseInt(span.textContent);
  qtd = Math.max(1, qtd + delta);
  span.textContent = qtd;
}

function adicionarAoCarrinho(id) {
  const qtd = parseInt(document.getElementById(`qtd-${id}`).textContent);
  const produto = produtos.find(p => p.id === id);
  const existente = carrinho.find(i => i.id === id);

  if (existente) {
    existente.qtd += qtd;
  } else {
    carrinho.push({ ...produto, qtd });
  }

  criarMensagem('Adicionado ao carrinho ✅');
  atualizarCarrinho();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(p => p.id !== id);
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const lista = document.getElementById("itens-carrinho");
  const badge = document.getElementById("carrinho-badge");
  lista.innerHTML = "";
  let total = 0;
  let quantidadeTotal = 0;

  carrinho.forEach(item => {
    total += item.preco * item.qtd;
    quantidadeTotal += item.qtd;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nome} x${item.qtd}
      <button onclick="removerDoCarrinho(${item.id})">X</button>
    `;
    lista.appendChild(li);
  });

  document.getElementById("total").textContent = `Total: R$ ${total.toFixed(2)}`;
  badge.textContent = quantidadeTotal > 0 ? quantidadeTotal : "";
}

// Pedido via WhatsApp
function enviarPedido() {
  const nome = document.getElementById("nome").value;
  const endereco = document.getElementById("endereco").value;
  const observacao = document.getElementById("observacao").value;
  const numero = document.getElementById("numero").value;

  if (!nome || !endereco || !numero) {
    alert("Preencha nome, número e endereço.");
    return;
  }

  salvarLocalmente("nome", nome);
  salvarLocalmente("numero", numero);
  salvarLocalmente("endereco", endereco);

  let mensagem = `*Novo pedido de ${nome}*\n\n`;
  carrinho.forEach(item => {
    mensagem += `• ${item.nome} x${item.qtd} = R$ ${(item.preco * item.qtd).toFixed(2)}\n`;
  });
  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  mensagem += `\n*Total:* R$ ${total.toFixed(2)}\n`;
  mensagem += `\n*Endereço:* ${endereco}`;
  if (observacao) mensagem += `\n*Obs:* ${observacao}`;

  const tel = numero.replace(/\D/g, "");
  const link = `https://wa.me/55${tel}?text=${encodeURIComponent(mensagem)}`;
  window.open(link, "_blank");
}

// Inicialização
window.onload = () => {
  if (typeof listaProdutos !== 'undefined') {
    produtos = listaProdutos;
    carregarProdutos();
  }

  document.getElementById("nome").value = carregarLocalmente("nome");
  document.getElementById("numero").value = carregarLocalmente("numero");
  document.getElementById("endereco").value = carregarLocalmente("endereco");
  atualizarCarrinho();
};
