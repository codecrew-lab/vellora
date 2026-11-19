(() => {
  "use strict";

  // Public browser credentials only. Never place a Supabase service-role key here.
  const SUPABASE_URL = "https://egyrlxgpgkflcejtgvvc.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AyNnLpE63guwq4SLMQR31g_-id54atp";
  const BOOKS_TABLE = "books";
  const STORAGE_BUCKET = "vellora-books";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { books: [], genre: "all", search: "", sort: "latest", recentOnly: false, selectedBook: null };
  const intro = $("#intro");
  const siteShell = $("#siteShell");
  const toast = $("#toast");
  let toastTimer;

  const safeRead = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const safeWrite = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private browsing may block storage */ }
  };
  const savedIds = () => safeRead("vellora:saved", []);
  const recentIds = () => safeRead("vellora:recent", []);

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function openLibrary() {
    intro.classList.add("is-opening");
    siteShell.removeAttribute("aria-hidden");
    siteShell.classList.add("is-visible");
    document.body.classList.remove("is-locked");
    window.setTimeout(() => intro.classList.add("is-gone"), 1600);
  }

  $("#openWorld").addEventListener("click", openLibrary);
  $("#menuTrigger").addEventListener("click", toggleMenu);
  $("#menuScrim").addEventListener("click", closeMenu);

  function toggleMenu() {
    const open = !$("#sideMenu").classList.contains("is-open");
    $("#sideMenu").classList.toggle("is-open", open);
    $("#menuScrim").classList.toggle("is-visible", open);
    $("#menuTrigger").setAttribute("aria-expanded", String(open));
    $("#sideMenu").setAttribute("aria-hidden", String(!open));
  }
  function closeMenu() {
    $("#sideMenu").classList.remove("is-open");
    $("#menuScrim").classList.remove("is-visible");
    $("#menuTrigger").setAttribute("aria-expanded", "false");
    $("#sideMenu").setAttribute("aria-hidden", "true");
  }

  function storageUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return SUPABASE_URL + "/storage/v1/object/public/" + STORAGE_BUCKET + "/" + path.split("/").map(encodeURIComponent).join("/");
  }
  function coverFor(book) {
    return book.cover_url || storageUrl(book.cover_path) || "";
  }
  function pdfFor(book) {
    return storageUrl(book.pdf_path);
  }
  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function toneFor(book) {
    const text = (book.genre || book.title || "story").toLowerCase();
    return [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
  }

  async function loadBooks() {
    const params = new URLSearchParams({
      select: "id,title,author,description,slug,genre,cover_url,pdf_path,language,reading_time_minutes,is_featured,is_recommended,is_published,created_at",
      is_published: "eq.true",
      order: "created_at.desc"
    });
    try {
      const response = await fetch(SUPABASE_URL + "/rest/v1/" + BOOKS_TABLE + "?" + params, {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY }
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error("Library connection returned " + response.status + (detail ? "." : ""));
      }
      const books = await response.json();
      state.books = Array.isArray(books) ? books : [];
      renderGenres();
      renderBooks();
      renderFeatured();
      return true;
    } catch (error) {
      console.warn("VELLORA library could not load:", error);
      state.books = [];
      renderGenres();
      renderBooks();
      renderFeatured();
      if (error instanceof TypeError) {
        $("#bookGrid").innerHTML = '<div class="empty-library"><span class="empty-star">✳</span><h3>Your library is being prepared.</h3><p>We could not reach the collection just now. Please refresh in a moment.</p></div>';
      } else {
        $("#bookGrid").innerHTML = '<div class="empty-library"><span class="empty-star">✳</span><h3>The shelves are being arranged.</h3><p>The VELLORA library connection needs its Data API access enabled. The collection will appear here once that is ready.</p></div>';
      }
      return false;
    }
  }

  function renderGenres() {
    const genres = [...new Set(state.books.map(book => book.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const host = $("#genreFilters");
    host.innerHTML = '<button class="genre-chip active" data-genre="all">All stories</button>' +
      genres.map(genre => '<button class="genre-chip" data-genre="' + escapeHtml(genre) + '">' + escapeHtml(genre) + '</button>').join("");
    $$(".genre-chip", host).forEach(button => button.addEventListener("click", () => {
      state.genre = button.dataset.genre;
      $$(".genre-chip", host).forEach(item => item.classList.toggle("active", item === button));
      renderBooks();
    }));
  }

  function filteredBooks() {
    let books = [...state.books];
    if (state.recentOnly) {
      const recent = recentIds();
      books = books.filter(book => recent.includes(book.id)).sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
    }
    if (state.genre !== "all") books = books.filter(book => (book.genre || "").toLowerCase() === state.genre.toLowerCase());
    if (state.search) {
      const needle = state.search.toLowerCase();
      books = books.filter(book => [book.title, book.author, book.genre, book.description, ...(book.tags || [])].join(" ").toLowerCase().includes(needle));
    }
    if (!state.recentOnly) {
      if (state.sort === "title") books.sort((a, b) => a.title.localeCompare(b.title));
      if (state.sort === "recommended") books.sort((a, b) => Number(b.is_recommended) - Number(a.is_recommended) || new Date(b.created_at) - new Date(a.created_at));
      if (state.sort === "latest") books.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return books;
  }

  function coverMarkup(book) {
    const cover = coverFor(book);
    if (cover) return '<img src="' + escapeHtml(cover) + '" alt="Cover of ' + escapeHtml(book.title) + '" loading="lazy" onerror="this.remove()">';
    return '<div class="book-cover-fallback tone-' + toneFor(book) + '"><strong>' + escapeHtml(book.title) + '</strong><small>' + escapeHtml(book.author || "VELLORA EDITIONS") + '</small></div>';
  }

  function renderBooks() {
    const books = filteredBooks();
    $("#collectionLabel").textContent = state.recentOnly ? "YOUR READING HISTORY" : (state.genre === "all" ? "THE COLLECTION" : state.genre.toUpperCase());
    $("#bookCount").textContent = books.length + (books.length === 1 ? " STORY" : " STORIES");
    if (!books.length) {
      const heading = state.recentOnly ? "Your reading journey begins here." : state.search ? "No stories found." : "The first page is waiting.";
      const description = state.recentOnly ? "Open a story to add it to your recently read list." : state.search ? "Try another title, author or genre." : "Our collection will appear here as soon as the VELLORA team publishes its first stories.";
      $("#bookGrid").innerHTML = '<div class="empty-library"><span class="empty-star">✳</span><h3>' + heading + '</h3><p>' + description + '</p></div>';
      return;
    }
    $("#bookGrid").innerHTML = books.map((book, index) =>
      '<article class="book-card" data-book-id="' + escapeHtml(book.id) + '" style="animation-delay:' + Math.min(index * 45, 360) + 'ms">' +
        '<div class="book-cover">' + coverMarkup(book) + '</div>' +
        '<div class="book-info"><div class="book-genre">' + escapeHtml(book.genre || "VELLORA COLLECTION") + (book.is_featured ? " · FEATURED" : "") + '</div>' +
        '<h3 class="book-title">' + escapeHtml(book.title) + '</h3><div class="book-author">by ' + escapeHtml(book.author || "VELLORA") + '</div></div></article>'
    ).join("");
    $$(".book-card", $("#bookGrid")).forEach(card => card.addEventListener("click", () => showBook(card.dataset.bookId)));
  }

  function renderFeatured() {
    const featured = state.books.find(book => book.is_featured);
    const old = $(".featured-strip");
    if (old) old.remove();
    if (!featured) return;
    const section = document.createElement("section");
    section.className = "featured-strip";
    section.innerHTML = '<div class="featured-cover">' + coverMarkup(featured) + '</div><div class="featured-copy"><p class="eyebrow">A STORY TO BEGIN WITH</p><h2>' + escapeHtml(featured.title) + '</h2><p class="featured-byline">BY ' + escapeHtml(featured.author || "VELLORA") + '</p><p class="featured-description">' + escapeHtml(featured.description || "A featured story from the VELLORA collection.") + '</p><button class="featured-open">DISCOVER THIS STORY ↗</button></div>';
    $("#library").before(section);
    $(".featured-open", section).addEventListener("click", () => showBook(featured.id));
  }

  function showBook(id) {
    const book = state.books.find(item => String(item.id) === String(id));
    if (!book) return;
    state.selectedBook = book;
    const history = recentIds().filter(item => item !== book.id);
    safeWrite("vellora:recent", [book.id, ...history].slice(0, 30));
    $("#dialogGenre").textContent = book.genre || "THE VELLORA COLLECTION";
    $("#dialogTitle").textContent = book.title;
    $("#dialogAuthor").textContent = "BY " + (book.author || "VELLORA");
    $("#dialogDescription").textContent = book.description || "A story from the VELLORA collection.";
    const cover = coverFor(book);
    $("#dialogCover").innerHTML = cover ? '<img src="' + escapeHtml(cover) + '" alt="Cover of ' + escapeHtml(book.title) + '" style="width:100%;height:100%;object-fit:cover">' : '<div class="book-cover-fallback tone-' + toneFor(book) + '"><strong>' + escapeHtml(book.title) + '</strong><small>' + escapeHtml(book.author || "VELLORA") + '</small></div>';
    const download = pdfFor(book);
    $("#downloadBook").href = download || "#";
    $("#downloadBook").style.opacity = download ? "1" : ".45";
    $("#downloadBook").setAttribute("aria-disabled", String(!download));
    $("#downloadBook").onclick = event => { if (!download) { event.preventDefault(); notify("The downloadable edition is not available yet."); } };
    updateSaveButton();
    $("#bookDialog").showModal();
  }

  function updateSaveButton() {
    if (!state.selectedBook) return;
    const saved = savedIds().includes(state.selectedBook.id);
    $("#saveBook").textContent = saved ? "♥ SAVED TO YOUR LIBRARY" : "♡ SAVE STORY";
  }
  $("#saveBook").addEventListener("click", () => {
    if (!state.selectedBook) return;
    const ids = savedIds();
    const next = ids.includes(state.selectedBook.id) ? ids.filter(id => id !== state.selectedBook.id) : [state.selectedBook.id, ...ids];
    safeWrite("vellora:saved", next);
    updateSaveButton();
    notify(next.includes(state.selectedBook.id) ? "Story saved on this device." : "Story removed from saved stories.");
  });
  $("#dialogClose").addEventListener("click", () => $("#bookDialog").close());
  $("#bookDialog").addEventListener("click", event => { if (event.target === $("#bookDialog")) $("#bookDialog").close(); });

  $("#bookSearch").addEventListener("input", event => { state.search = event.target.value.trim(); renderBooks(); });
  $("#sortButton").addEventListener("click", () => {
    const options = ["latest", "title", "recommended"];
    state.sort = options[(options.indexOf(state.sort) + 1) % options.length];
    $("#sortButton").innerHTML = ({ latest: "LATEST", title: "A — Z", recommended: "RECOMMENDED" })[state.sort] + " <span>⌄</span>";
    renderBooks();
  });

  $("#settingsClose").addEventListener("click", () => $("#settingsDialog").close());
  $$(".theme-option").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.theme)));
  function setTheme(theme) {
    if (!["manuscript", "vellum", "dark"].includes(theme)) return;
    document.body.classList.remove("theme-manuscript", "theme-vellum", "theme-dark");
    document.body.classList.add("theme-" + theme);
    safeWrite("vellora:theme", theme);
    $$(".theme-option").forEach(button => button.classList.toggle("selected", button.dataset.theme === theme));
  }
  setTheme(safeRead("vellora:theme", "manuscript"));

  $$(".menu-link").forEach(button => button.addEventListener("click", () => {
    closeMenu();
    $$(".menu-link").forEach(item => item.classList.toggle("active", item === button));
    if (button.dataset.menu === "settings") {
      $("#settingsDialog").showModal();
      return;
    }
    state.recentOnly = button.dataset.menu === "recent";
    state.genre = "all";
    state.search = "";
    $("#bookSearch").value = "";
    $$(".genre-chip").forEach((chip, index) => chip.classList.toggle("active", index === 0));
    renderBooks();
    $("#library").scrollIntoView({ behavior: "smooth" });
  }));

  loadBooks();
})();