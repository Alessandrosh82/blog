// Função para formatar a data em português (ex: 3 de junho de 2025)
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Função para carregar e renderizar posts
async function loadPosts() {
  try {
    const response = await fetch("posts.json");
    const posts = await response.json();

    // Ordena por data decrescente
    posts.sort((a, b) => new Date(b.data) - new Date(a.data));

    const container = document.getElementById("posts-container");

    posts.forEach((post) => {
      const article = document.createElement("article");

      const title = document.createElement("h2");
      title.textContent = post.titulo;
      article.appendChild(title);

      const time = document.createElement("time");
      time.setAttribute("datetime", post.data);
      time.textContent = formatDate(post.data);
      article.appendChild(time);

      // Conteúdo em HTML, inserido com cuidado
      const content = document.createElement("div");
      content.innerHTML = post.conteudo;
      article.appendChild(content);

      container.appendChild(article);
    });
  } catch (error) {
    console.error("Erro ao carregar posts:", error);
  }
}

// Executa ao carregar a página
window.addEventListener("DOMContentLoaded", loadPosts);
