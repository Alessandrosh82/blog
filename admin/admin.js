const OWNER = "Alessandrosh82";
const REPO = "blog";
const BRANCH = "main";
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;
const TOKEN_LOCAL_KEY = "von_github_token";
const TOKEN_SESSION_KEY = "von_github_token_session";

const DEFAULT_THEME = {
  bodyFont: { name: "Segoe UI", css: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', google: "" },
  titleFont: { name: "Dancing Script", css: '"Dancing Script", cursive', google: "Dancing+Script:wght@700" },
  colors: {
    siteBackground: "#f7f6f3", bodyText: "#333333", headerTitle: "#2c3e50",
    subtitle: "#6c7a89", quote: "#3a6351", accent: "#1b6b54",
    articleBackground: "#ffffff", articleTitle: "#2a3d45", link: "#0066cc",
    latestBackground: "#f0fbff", latestBorder: "#5b86a3",
    postBackground: "#fff8dc", footer: "#aaaaaa"
  }
};

const FONTS = [
  { name: "Segoe UI", css: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', google: "" },
  { name: "Arial", css: 'Arial, Helvetica, sans-serif', google: "" },
  { name: "Verdana", css: 'Verdana, Geneva, sans-serif', google: "" },
  { name: "Georgia", css: 'Georgia, "Times New Roman", serif', google: "" },
  { name: "Times New Roman", css: '"Times New Roman", Times, serif', google: "" },
  { name: "Roboto", css: '"Roboto", sans-serif', google: "Roboto:wght@400;500;700" },
  { name: "Poppins", css: '"Poppins", sans-serif', google: "Poppins:wght@400;500;600;700" },
  { name: "Montserrat", css: '"Montserrat", sans-serif', google: "Montserrat:wght@400;500;600;700" },
  { name: "Lora", css: '"Lora", serif', google: "Lora:wght@400;500;600;700" },
  { name: "Merriweather", css: '"Merriweather", serif', google: "Merriweather:wght@400;700" },
  { name: "Playfair Display", css: '"Playfair Display", serif', google: "Playfair+Display:wght@400;600;700" },
  { name: "Dancing Script", css: '"Dancing Script", cursive', google: "Dancing+Script:wght@400;600;700" }
];

const COLOR_LABELS = {
  siteBackground: "Fundo do site", bodyText: "Texto geral", headerTitle: "Título do blog",
  subtitle: "Subtítulo", quote: "Frase bíblica", accent: "Cor de destaque",
  articleBackground: "Fundo dos artigos na página inicial", articleTitle: "Título dos artigos",
  link: "Link ‘Ler mais’", latestBackground: "Fundo da última publicação",
  latestBorder: "Borda da última publicação", postBackground: "Fundo da página do artigo",
  footer: "Texto do rodapé"
};

const $ = selector => document.querySelector(selector);
const els = {
  loginView: $("#loginView"), appView: $("#appView"), loginForm: $("#loginForm"),
  tokenInput: $("#tokenInput"), rememberToken: $("#rememberToken"), connectButton: $("#connectButton"),
  logoutButton: $("#logoutButton"), pageTitle: $("#pageTitle"), menuButton: $("#menuButton"),
  sidebar: $(".sidebar"), navButtons: [...document.querySelectorAll(".nav-button")],
  postsView: $("#postsView"), editorView: $("#editorView"), appearanceView: $("#appearanceView"),
  searchInput: $("#searchInput"), newPostButton: $("#newPostButton"), postStats: $("#postStats"),
  postsList: $("#postsList"), postForm: $("#postForm"), editingId: $("#editingId"),
  postTitle: $("#postTitle"), postDate: $("#postDate"), editorEyebrow: $("#editorEyebrow"),
  editorHeading: $("#editorHeading"), cancelEditButton: $("#cancelEditButton"), savePostButton: $("#savePostButton"),
  appearanceForm: $("#appearanceForm"), bodyFont: $("#bodyFont"), titleFont: $("#titleFont"),
  colorsGrid: $("#colorsGrid"), themePreview: $("#themePreview"), resetThemeButton: $("#resetThemeButton"),
  saveThemeButton: $("#saveThemeButton"), toast: $("#toast"), deleteDialog: $("#deleteDialog"),
  deleteText: $("#deleteText"), confirmDeleteButton: $("#confirmDeleteButton")
};

const quill = new Quill("#editor", {
  theme: "snow", placeholder: "Escreva o artigo aqui...",
  modules: { toolbar: [[{ header: [2, 3, false] }], ["bold", "italic", "underline", "blockquote"], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]] }
});

let token = "";
let posts = [];
let postsSha = "";
let theme = structuredClone(DEFAULT_THEME);
let themeSha = "";
let pendingDeleteId = null;

function toast(message, error = false) {
  els.toast.textContent = message;
  els.toast.className = `toast show${error ? " error" : ""}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.className = "toast", 3500);
}

function busy(button, active, text = "Salvando...") {
  if (active) { button.dataset.text = button.textContent; button.textContent = text; button.disabled = true; }
  else { button.textContent = button.dataset.text || button.textContent; button.disabled = false; }
}

function apiHeaders() {
  return { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };
}

function decodeBase64(value) {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

async function github(path, options = {}) {
  const response = await fetch(`${API}/${path}`, { ...options, headers: { ...apiHeaders(), ...(options.headers || {}) } });
  if (!response.ok) {
    let detail = "";
    try { detail = (await response.json()).message || ""; } catch {}
    if (response.status === 401) throw new Error("Token inválido ou expirado.");
    if (response.status === 403) throw new Error("O token não tem permissão para alterar este repositório.");
    throw new Error(detail || `Erro do GitHub (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}

async function readJson(path, fallback = null) {
  try {
    const data = await github(`${path}?ref=${BRANCH}`);
    return { value: JSON.parse(decodeBase64(data.content)), sha: data.sha };
  } catch (error) {
    if (fallback !== null && /Not Found|404/i.test(error.message)) return { value: fallback, sha: "" };
    throw error;
  }
}

async function writeJson(path, value, sha, message) {
  const body = { message, content: encodeBase64(JSON.stringify(value, null, 2) + "\n"), branch: BRANCH };
  if (sha) body.sha = sha;
  return github(path, { method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
}

function showApp() { els.loginView.classList.add("hidden"); els.appView.classList.remove("hidden"); }
function showLogin() { els.loginView.classList.remove("hidden"); els.appView.classList.add("hidden"); }

async function connect() {
  const loadedPosts = await readJson("posts.json");
  const loadedTheme = await readJson("site-config.json", DEFAULT_THEME);
  posts = loadedPosts.value;
  postsSha = loadedPosts.sha;
  theme = mergeTheme(loadedTheme.value);
  themeSha = loadedTheme.sha;
  showApp();
  renderPosts();
  fillThemeForm();
}

function mergeTheme(value) {
  return {
    bodyFont: value?.bodyFont || DEFAULT_THEME.bodyFont,
    titleFont: value?.titleFont || DEFAULT_THEME.titleFont,
    colors: { ...DEFAULT_THEME.colors, ...(value?.colors || {}) }
  };
}

function setView(name) {
  const map = { posts: [els.postsView, "Artigos"], editor: [els.editorView, els.editingId.value ? "Editar artigo" : "Novo artigo"], appearance: [els.appearanceView, "Cores e fontes"] };
  [els.postsView, els.editorView, els.appearanceView].forEach(v => v.classList.add("hidden"));
  map[name][0].classList.remove("hidden");
  els.pageTitle.textContent = map[name][1];
  els.navButtons.forEach(b => b.classList.toggle("active", b.dataset.view === name));
  els.sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Sem data";
  const [y,m,d] = value.split("-").map(Number);
  return new Date(y, m-1, d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function sortedPosts() {
  return [...posts].sort((a,b) => new Date(b.data) - new Date(a.data) || Number(b.id) - Number(a.id));
}

function renderPosts() {
  const query = els.searchInput.value.trim().toLowerCase();
  const filtered = sortedPosts().filter(p => p.titulo.toLowerCase().includes(query));
  els.postStats.innerHTML = `<div class="stat"><span>Total de artigos</span><strong>${posts.length}</strong></div><div class="stat"><span>Última publicação</span><strong>${sortedPosts()[0] ? formatDate(sortedPosts()[0].data) : "—"}</strong></div>`;
  if (!filtered.length) { els.postsList.innerHTML = '<div class="empty">Nenhum artigo encontrado.</div>'; return; }
  els.postsList.innerHTML = filtered.map(post => `<article class="post-row"><div class="post-id">#${escapeHtml(post.id)}</div><div><h3>${escapeHtml(post.titulo)}</h3><time>${formatDate(post.data)}</time></div><div class="row-actions"><a class="small-button" href="../post.html?id=${encodeURIComponent(post.id)}" target="_blank">Ver</a><button class="small-button" data-action="edit" data-id="${escapeHtml(post.id)}">Editar</button><button class="small-button delete" data-action="delete" data-id="${escapeHtml(post.id)}">Excluir</button></div></article>`).join("");
}

function today() { return new Date().toISOString().slice(0,10); }
function resetEditor() {
  els.editingId.value = ""; els.postTitle.value = ""; els.postDate.value = today(); quill.setContents([]);
  els.editorEyebrow.textContent = "Novo artigo"; els.editorHeading.textContent = "Adicionar artigo";
}
function openNew() { resetEditor(); setView("editor"); }
function openEdit(id) {
  const post = posts.find(p => String(p.id) === String(id));
  if (!post) return;
  els.editingId.value = post.id; els.postTitle.value = post.titulo; els.postDate.value = post.data; quill.root.innerHTML = post.conteudo;
  els.editorEyebrow.textContent = `Artigo #${post.id}`; els.editorHeading.textContent = "Editar artigo"; setView("editor");
}

async function savePosts(message) {
  const result = await writeJson("posts.json", sortedPosts(), postsSha, message);
  postsSha = result.content.sha;
}

function nextId() { return String(Math.max(0, ...posts.map(p => Number(p.id) || 0)) + 1); }

async function submitPost(event) {
  event.preventDefault();
  const title = els.postTitle.value.trim();
  const date = els.postDate.value;
  const content = quill.root.innerHTML.trim();
  if (!title || !date || quill.getText().trim().length === 0) { toast("Preencha o título, a data e o conteúdo.", true); return; }
  busy(els.savePostButton, true, "Publicando...");
  try {
    const editing = els.editingId.value;
    if (editing) {
      const index = posts.findIndex(p => String(p.id) === String(editing));
      posts[index] = { ...posts[index], titulo: title, data: date, conteudo: content };
      await savePosts(`Editar artigo: ${title}`);
      toast("Artigo editado e publicado.");
    } else {
      const id = nextId();
      posts.push({ id, titulo: title, data: date, conteudo: content });
      await savePosts(`Adicionar artigo: ${title}`);
      toast("Artigo adicionado e publicado.");
    }
    resetEditor(); renderPosts(); setView("posts");
  } catch (error) { toast(error.message, true); }
  finally { busy(els.savePostButton, false); }
}

async function deletePost() {
  const post = posts.find(p => String(p.id) === String(pendingDeleteId));
  if (!post) return;
  busy(els.confirmDeleteButton, true, "Excluindo...");
  try {
    posts = posts.filter(p => String(p.id) !== String(pendingDeleteId));
    await savePosts(`Excluir artigo: ${post.titulo}`);
    renderPosts(); els.deleteDialog.close(); toast("Artigo excluído.");
  } catch (error) { toast(error.message, true); }
  finally { busy(els.confirmDeleteButton, false); pendingDeleteId = null; }
}

function buildThemeFields() {
  const options = FONTS.map((font, index) => `<option value="${index}">${font.name}</option>`).join("");
  els.bodyFont.innerHTML = options; els.titleFont.innerHTML = options;
  els.colorsGrid.innerHTML = Object.entries(COLOR_LABELS).map(([key,label]) => `<label>${label}<div class="color-field"><input type="color" data-color="${key}"><input type="text" data-color-text="${key}" maxlength="7"></div></label>`).join("");
}

function fontIndex(font) { const index = FONTS.findIndex(f => f.name === font?.name); return index >= 0 ? index : 0; }
function fillThemeForm() {
  els.bodyFont.value = fontIndex(theme.bodyFont); els.titleFont.value = fontIndex(theme.titleFont);
  Object.entries(theme.colors).forEach(([key,value]) => {
    const color = document.querySelector(`[data-color="${key}"]`); const text = document.querySelector(`[data-color-text="${key}"]`);
    if (color) color.value = value; if (text) text.value = value;
  });
  updatePreview();
}

function readThemeForm() {
  const colors = {};
  Object.keys(COLOR_LABELS).forEach(key => { colors[key] = document.querySelector(`[data-color="${key}"]`).value; });
  return { bodyFont: FONTS[Number(els.bodyFont.value)], titleFont: FONTS[Number(els.titleFont.value)], colors };
}

function ensurePreviewGoogleFonts(current) {
  const google = [current.bodyFont.google, current.titleFont.google].filter(Boolean);
  let link = document.getElementById("preview-fonts");
  if (!link) { link = document.createElement("link"); link.id = "preview-fonts"; link.rel = "stylesheet"; document.head.appendChild(link); }
  link.href = google.length ? `https://fonts.googleapis.com/css2?${google.map(f => `family=${f}`).join("&")}&display=swap` : "";
}

function updatePreview() {
  const current = readThemeForm(); ensurePreviewGoogleFonts(current);
  const p = els.themePreview; const c = current.colors;
  p.style.fontFamily = current.bodyFont.css; p.style.background = c.siteBackground; p.style.color = c.bodyText;
  p.querySelector("h1").style.fontFamily = current.titleFont.css; p.querySelector("h1").style.color = c.headerTitle;
  p.querySelector(".preview-subtitle").style.color = c.subtitle; p.querySelector(".preview-quote").style.color = c.quote;
  const article = p.querySelector("article"); article.style.background = c.articleBackground; article.querySelector("strong").style.color = c.articleTitle; article.querySelector("a").style.color = c.link;
}

async function saveTheme(event) {
  event.preventDefault(); busy(els.saveThemeButton, true);
  try {
    theme = readThemeForm();
    const result = await writeJson("site-config.json", theme, themeSha, "Alterar cores e fontes do site");
    themeSha = result.content.sha; toast("Aparência salva. O GitHub Pages atualizará o site em alguns minutos.");
  } catch (error) { toast(error.message, true); }
  finally { busy(els.saveThemeButton, false); }
}

els.loginForm.addEventListener("submit", async event => {
  event.preventDefault(); token = els.tokenInput.value.trim(); if (!token) return;
  busy(els.connectButton, true, "Conectando...");
  try {
    if (els.rememberToken.checked) { localStorage.setItem(TOKEN_LOCAL_KEY, token); sessionStorage.removeItem(TOKEN_SESSION_KEY); }
    else { sessionStorage.setItem(TOKEN_SESSION_KEY, token); localStorage.removeItem(TOKEN_LOCAL_KEY); }
    await connect(); toast("Conectado ao GitHub.");
  } catch (error) { localStorage.removeItem(TOKEN_LOCAL_KEY); sessionStorage.removeItem(TOKEN_SESSION_KEY); toast(error.message, true); }
  finally { busy(els.connectButton, false); }
});

els.logoutButton.addEventListener("click", () => { localStorage.removeItem(TOKEN_LOCAL_KEY); sessionStorage.removeItem(TOKEN_SESSION_KEY); token = ""; els.tokenInput.value = ""; showLogin(); });
els.menuButton.addEventListener("click", () => els.sidebar.classList.toggle("open"));
els.navButtons.forEach(button => button.addEventListener("click", () => button.dataset.view === "editor" ? openNew() : setView(button.dataset.view)));
els.newPostButton.addEventListener("click", openNew); els.cancelEditButton.addEventListener("click", () => { resetEditor(); setView("posts"); });
els.searchInput.addEventListener("input", renderPosts); els.postForm.addEventListener("submit", submitPost);
els.postsList.addEventListener("click", event => { const button = event.target.closest("[data-action]"); if (!button) return; if (button.dataset.action === "edit") openEdit(button.dataset.id); else { pendingDeleteId = button.dataset.id; const post = posts.find(p => String(p.id) === String(pendingDeleteId)); els.deleteText.textContent = `O artigo “${post.titulo}” será removido do blog. O histórico continuará disponível no GitHub.`; els.deleteDialog.showModal(); } });
els.confirmDeleteButton.addEventListener("click", event => { event.preventDefault(); deletePost(); });
els.appearanceForm.addEventListener("input", event => { if (event.target.matches("[data-color]")) document.querySelector(`[data-color-text="${event.target.dataset.color}"]`).value = event.target.value; if (event.target.matches("[data-color-text]")) { const value = event.target.value; if (/^#[0-9a-f]{6}$/i.test(value)) document.querySelector(`[data-color="${event.target.dataset.colorText}"]`).value = value; } updatePreview(); });
els.appearanceForm.addEventListener("change", updatePreview); els.appearanceForm.addEventListener("submit", saveTheme);
els.resetThemeButton.addEventListener("click", () => { theme = structuredClone(DEFAULT_THEME); fillThemeForm(); toast("Padrão atual restaurado na prévia. Clique em Salvar aparência para publicar."); });

buildThemeFields();
const stored = localStorage.getItem(TOKEN_LOCAL_KEY) || sessionStorage.getItem(TOKEN_SESSION_KEY);
if (stored) { token = stored; els.tokenInput.value = stored; connect().catch(error => { localStorage.removeItem(TOKEN_LOCAL_KEY); sessionStorage.removeItem(TOKEN_SESSION_KEY); showLogin(); toast(error.message, true); }); }
