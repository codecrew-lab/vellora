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


  // Phase 3: browser-based PDF reading room. PDF.js is loaded from a pinned CDN;
  // the site itself remains plain HTML/CSS/JS and needs no build tools.
  const readerState = { pdf: null, book: null, page: 1, rendering: false, queuedPage: null, sound: false, audio: null, touchX: 0 };
  let pdfLibraryPromise = null;

  function loadPdfLibrary() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfLibraryPromise) return pdfLibraryPromise;
    pdfLibraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        if (!window.pdfjsLib) return reject(new Error("PDF reader library did not initialise."));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      };
      script.onerror = () => reject(new Error("Could not load the PDF reading engine. Check your connection and try again."));
      document.head.appendChild(script);
    });
    return pdfLibraryPromise;
  }

  const progressMap = () => safeRead("vellora:reading-progress", {});
  const bookmarkMap = () => safeRead("vellora:page-bookmarks", {});
  function saveReaderProgress() {
    if (!readerState.book || !readerState.pdf) return;
    const map = progressMap();
    map[readerState.book.id] = { page: readerState.page, total: readerState.pdf.numPages, updatedAt: new Date().toISOString() };
    safeWrite("vellora:reading-progress", map);
    const history = recentIds().filter(id => id !== readerState.book.id);
    safeWrite("vellora:recent", [readerState.book.id, ...history].slice(0, 30));
  }
  function updateReaderControls() {
    if (!readerState.pdf) return;
    const total = readerState.pdf.numPages;
    $("#readerPageLabel").textContent = "PAGE " + readerState.page;
    $("#readerPageCount").textContent = readerState.page + " / " + total;
    $("#readerProgress").style.width = (readerState.page / total * 100) + "%";
    $("#readerPrevious").disabled = readerState.page <= 1;
    $("#readerNext").disabled = readerState.page >= total;
    const savedPage = bookmarkMap()[readerState.book.id];
    const marked = savedPage === readerState.page;
    $("#readerBookmark").classList.toggle("is-bookmarked", marked);
    $("#readerBookmark").setAttribute("aria-pressed", String(marked));
    $("#readerBookmark").setAttribute("aria-label", marked ? "Remove bookmark from this page" : "Bookmark this page");
  }
  async function renderReaderPage(pageNumber, direction = 1) {
    if (!readerState.pdf) return;
    const target = Math.max(1, Math.min(readerState.pdf.numPages, pageNumber));
    if (readerState.rendering) { readerState.queuedPage = target; return; }
    readerState.rendering = true;
    const wrap = $("#readerPageWrap");
    wrap.classList.remove("turn-next", "turn-previous");
    void wrap.offsetWidth;
    wrap.classList.add(direction >= 0 ? "turn-next" : "turn-previous");
    $("#readerLoading").hidden = false;
    $("#readerLoading").textContent = "Turning the page…";
    try {
      const page = await readerState.pdf.getPage(target);
      const canvas = $("#readerCanvas");
      const context = canvas.getContext("2d", { alpha: false });
      const base = page.getViewport({ scale: 1 });
      const maxWidth = Math.max(260, wrap.clientWidth - 34);
      const maxHeight = Math.max(360, window.innerHeight - 240);
      const scale = Math.min(maxWidth / base.width, maxHeight / base.height, 1.8);
      const viewport = page.getViewport({ scale });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      await page.render({ canvasContext: context, viewport }).promise;
      readerState.page = target;
      updateReaderControls();
      saveReaderProgress();
    } catch (error) {
      console.error("VELLORA page render failed:", error);
      notify("This page could not be rendered. Please try again.");
    } finally {
      $("#readerLoading").hidden = true;
      readerState.rendering = false;
      window.setTimeout(() => wrap.classList.remove("turn-next", "turn-previous"), 380);
      if (readerState.queuedPage && readerState.queuedPage !== readerState.page) {
        const queued = readerState.queuedPage;
        readerState.queuedPage = null;
        renderReaderPage(queued, queued > readerState.page ? 1 : -1);
      } else readerState.queuedPage = null;
    }
  }
  async function renderPdfOutline() {
    const host = $("#readerOutlineList");
    host.innerHTML = '<p class="outline-empty">This book has no chapter outline.</p>';
    try {
      const outline = await readerState.pdf.getOutline();
      if (!outline || !outline.length) return;
      host.innerHTML = "";
      const addItems = (items, parent) => items.forEach(item => {
        const button = document.createElement("button");
        button.className = "outline-entry";
        button.textContent = item.title || "Untitled section";
        button.addEventListener("click", async () => {
          if (item.dest) {
            const destination = typeof item.dest === "string" ? await readerState.pdf.getDestination(item.dest) : item.dest;
            if (destination) {
              const ref = destination[0];
              const pageIndex = await readerState.pdf.getPageIndex(ref);
              renderReaderPage(pageIndex + 1, pageIndex + 1 > readerState.page ? 1 : -1);
            }
          }
          $("#readerOutline").classList.remove("is-open");
          $("#readerOutline").setAttribute("aria-hidden", "true");
        });
        parent.appendChild(button);
        if (item.items && item.items.length) {
          const nested = document.createElement("div");
          nested.className = "outline-nested";
          parent.appendChild(nested);
          addItems(item.items, nested);
        }
      });
      addItems(outline, host);
    } catch (error) {
      console.warn("PDF outline unavailable:", error);
    }
  }
  async function openReader(book) {
    const url = pdfFor(book);
    if (!url) { notify("The reading edition has not been uploaded yet."); return; }
    readerState.book = book;
    readerState.pdf = null;
    readerState.page = 1;
    $("#readerBookTitle").textContent = book.title || "VELLORA STORY";
    const chosenTheme = safeRead("vellora:theme", "manuscript");
    $("#readerDialog").classList.remove("theme-manuscript", "theme-vellum", "theme-dark");
    $("#readerDialog").classList.add("theme-" + chosenTheme);
    $(".reader-theme-choice").forEach(button => button.classList.toggle("selected", button.dataset.readerTheme === chosenTheme));
    const savedProgress = progressMap()[book.id];
    $("#readBook").textContent = savedProgress && savedProgress.page > 1 ? "CONTINUE · PAGE " + savedProgress.page + " ↗" : "OPEN READER ↗";
    $("#readerLoading").hidden = false;
    $("#readerLoading").textContent = "Preparing your reading room…";
    $("#readerDialog").showModal();
    try {
      const pdfjs = await loadPdfLibrary();
      const task = pdfjs.getDocument({ url, withCredentials: false });
      readerState.pdf = await task.promise;
      const progress = progressMap()[book.id];
      const initialPage = progress && progress.page ? progress.page : 1;
      await renderPdfOutline();
      await renderReaderPage(initialPage, 1);
    } catch (error) {
      console.error("VELLORA could not open this PDF:", error);
      $("#readerLoading").hidden = false;
      $("#readerLoading").textContent = error.message || "This book could not be opened. Please try the download instead.";
    }
  }
  function closeReader() {
    saveReaderProgress();
    $("#readerDialog").close();
    $("#readerOutline").classList.remove("is-open");
    $("#readerThemePopover").hidden = true;
  }
  function playPageSound() {
    if (!readerState.sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      readerState.audio = readerState.audio || new AudioContext();
      if (readerState.audio.state === "suspended") readerState.audio.resume();
      const oscillator = readerState.audio.createOscillator();
      const gain = readerState.audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(540, readerState.audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(230, readerState.audio.currentTime + .055);
      gain.gain.setValueAtTime(.035, readerState.audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, readerState.audio.currentTime + .06);
      oscillator.connect(gain); gain.connect(readerState.audio.destination);
      oscillator.start(); oscillator.stop(readerState.audio.currentTime + .065);
    } catch (error) { console.warn("Page sound unavailable:", error); }
  }
  function turnPage(direction) {
    if (!readerState.pdf) return;
    const next = Math.max(1, Math.min(readerState.pdf.numPages, readerState.page + direction));
    if (next === readerState.page) return;
    playPageSound();
    renderReaderPage(next, direction);
  }

  $("#readBook").addEventListener("click", () => {
    if (!state.selectedBook) return;
    const book = state.selectedBook;
    $("#bookDialog").close();
    openReader(book);
  });
  $("#readerClose").addEventListener("click", closeReader);
  $("#readerPrevious").addEventListener("click", () => turnPage(-1));
  $("#readerNext").addEventListener("click", () => turnPage(1));
  $("#readerBookmark").addEventListener("click", () => {
    if (!readerState.book || !readerState.pdf) return;
    const map = bookmarkMap();
    if (map[readerState.book.id] === readerState.page) delete map[readerState.book.id];
    else map[readerState.book.id] = readerState.page;
    safeWrite("vellora:page-bookmarks", map);
    updateReaderControls();
    notify(map[readerState.book.id] ? "Page bookmarked with your VELLORA ribbon." : "Page bookmark removed.");
  });
  $("#readerSound").addEventListener("click", () => {
    readerState.sound = !readerState.sound;
    $("#readerSound").setAttribute("aria-pressed", String(readerState.sound));
    $("#readerSound").classList.toggle("is-active", readerState.sound);
    if (readerState.sound) playPageSound();
    notify(readerState.sound ? "Page-turn sound is on." : "Page-turn sound is off.");
  });
  $("#readerOutlineToggle").addEventListener("click", () => {
    const panel = $("#readerOutline");
    const open = !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
  });
  $("#readerThemeToggle").addEventListener("click", () => {
    $("#readerThemePopover").hidden = !$("#readerThemePopover").hidden;
  });
  $(".reader-theme-choice").forEach(button => button.addEventListener("click", () => {
    setTheme(button.dataset.readerTheme);
    $("#readerDialog").classList.remove("theme-manuscript", "theme-vellum", "theme-dark");
    $("#readerDialog").classList.add("theme-" + button.dataset.readerTheme);
    $(".reader-theme-choice").forEach(item => item.classList.toggle("selected", item === button));
    $("#readerThemePopover").hidden = true;
  }));
  $("#readerPageWrap").addEventListener("touchstart", event => { readerState.touchX = event.changedTouches[0].clientX; }, { passive: true });
  $("#readerPageWrap").addEventListener("touchend", event => {
    const delta = event.changedTouches[0].clientX - readerState.touchX;
    if (Math.abs(delta) > 55) turnPage(delta < 0 ? 1 : -1);
  }, { passive: true });
  document.addEventListener("keydown", event => {
    if (!$("#readerDialog").open) return;
    if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); turnPage(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); turnPage(-1); }
    if (event.key === "Escape") { event.preventDefault(); closeReader(); }
  });
  window.addEventListener("resize", () => {
    if ($("#readerDialog").open && readerState.pdf && !readerState.rendering) renderReaderPage(readerState.page, 1);
  });

  loadBooks();
})();