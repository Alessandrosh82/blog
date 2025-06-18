// Seletores e variáveis globais
const produtosContainer = document.getElementById('produtos');
const carrinhoLista = document.getElementById('itens-carrinho');
const totalSpan = document.getElementById('total');
const form = document.getElementById('form-pedido');
const nomeInput = document.getElementById('nome');
const obsInput = document.getElementById('observacoes');
const numeroInput = document.getElementById('whatsapp');

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function atualizarCarrinho() {
  carrinhoLista.innerHTML = '';
  let total = 0;
  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}
      <button onclick="removerItem(${index})">X</button>
    `;
    carrinhoLista.appendChild(li);
    total += item.preco * item.quantidade;
  });
  totalSpan.textContent = 'Total: R$ ' + total.toFixed(2);
  salvarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

function adicionarAoCarrinho(produto) {
  const existente = carrinho.find(p => p.nome === produto.nome);
  if (existente) {
    existente.quantidade += produto.quantidade;
  } else {
    carrinho.push(produto);
  }
  atualizarCarrinho();
}

function renderizarProdutos() {
  produtosContainer.innerHTML = '';
  const categorias = [...new Set(produtos.map(p => p.categoria))];

  categorias.forEach(cat => {
    const sec = document.createElement('section');
    const titulo = document.createElement('h2');
    titulo.textContent = cat;
    sec.appendChild(titulo);

    produtos.filter(p => p.categoria === cat).forEach((p, index) => {
      const div = document.createElement('div');
      div.className = 'produto';
      div.innerHTML = `
        <img src="${p.imagem}" alt="${p.nome}" style="max-width: 100%; height: auto;">
        <h3>${p.nome}</h3>
        <p>${p.descricao}</p>
        <strong>R$ ${p.preco.toFixed(2)}</strong>
        <div class="quantidade-container">
          <button onclick="alterarQtd(${index}, -1)">-</button>
          <span id="qtd-${index}">1</span>
          <button onclick="alterarQtd(${index}, 1)">+</button>
        </div>
        <button onclick="addProduto(${index})">Adicionar</button>
      `;
      sec.appendChild(div);
    });

    produtosContainer.appendChild(sec);
  });
}

const quantidades = {};
function alterarQtd(index, delta) {
  if (!quantidades[index]) quantidades[index] = 1;
  quantidades[index] = Math.max(1, quantidades[index] + delta);
  document.getElementById('qtd-' + index).textContent = quantidades[index];
}

function addProduto(index) {
  const p = produtos[index];
  const quantidade = quantidades[index] || 1;
  adicionarAoCarrinho({
    nome: p.nome,
    preco: p.preco,
    quantidade
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (carrinho.length === 0) {
    alert('O carrinho está vazio!');
    return;
  }

  const nome = nomeInput.value.trim();
  const obs = obsInput.value.trim();
  const numero = numeroInput.value.replace(/\D/g, '');
  const msg = `*Novo pedido de ${nome}*%0A%0A` +
    carrinho.map(i => `• ${i.quantidade}x ${i.nome} - R$ ${(i.preco * i.quantidade).toFixed(2)}`).join('%0A') +
    `%0A%0A*Total:* R$ ${carrinho.reduce((t, i) => t + i.preco * i.quantidade, 0).toFixed(2)}%0A` +
    (obs ? `%0A*Observações:* ${obs}` : '');

  window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  carrinho = [];
  atualizarCarrinho();
  form.reset();
});

// Inicialização
renderizarProdutos();
atualizarCarrinho();
