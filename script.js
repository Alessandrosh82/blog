// Função para formatar a data em português (ex: 3 de junho de 2025)
function formatDate(dateStr) {
  const parts = dateStr.split("-"); // ["2025", "06", "12"]
  const date = new Date(parts[0], parts[1] - 1, parts[2]); // Ano, mês (0-based), dia
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Função para carregar e renderizar posts do arquivo JSON
async function loadPosts() {
  try {
    const response = await fetch("posts.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();

    // Ordena os posts por data decrescente (do mais novo para o mais antigo)
    posts.sort((a, b) => new Date(b.data) - new Date(a.data));

    const container = document.getElementById("posts-container");
    if (!container) {
      console.error('Elemento com id "posts-container" não encontrado no DOM.');
      return;
    }

    // Limpa o container antes de adicionar os posts
    container.innerHTML = "";

    posts.forEach((post) => {
      // Cria o container com fundo amarelinho
      const wrapper = document.createElement("div");
      wrapper.className = "article-container";

      const article = document.createElement("article");

      // Título
      const title = document.createElement("h2");
      title.textContent = post.titulo;
      article.appendChild(title);

      // Data formatada
      const time = document.createElement("time");
      time.setAttribute("datetime", post.data);
      time.textContent = formatDate(post.data);
      article.appendChild(time);

      // Conteúdo em HTML
      const content = document.createElement("div");
      content.innerHTML = post.conteudo;
      article.appendChild(content);

      // Envolve o artigo no wrapper estilizado
      wrapper.appendChild(article);
      container.appendChild(wrapper);
    });
  } catch (error) {
    console.error("Erro ao carregar posts:", error);
  }
}

// Executa o carregamento dos posts quando o DOM estiver pronto
window.addEventListener("DOMContentLoaded", loadPosts);
