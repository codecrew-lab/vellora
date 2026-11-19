(() => {
  "use strict";
  const SUPABASE_URL = "https://egyrlxgpgkflcejtgvvc.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AyNnLpE63guwq4SLMQR31g_-id54atp";
  const COVER_BUCKET = "book-covers";
  const PDF_BUCKET = "book-files";
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const $ = selector => document.querySelector(selector);
  let books = [];
  let editingId = null;
  let busy = false;
  let toastTimer = null;

  function message(target, text) { $(target).textContent = text || ""; }
  function notify(text) {
    const node = $("#adminToast");
    node.textContent = text;
    node.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.classList.remove("show"), 2600);
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[char]));
  }
  function slugify(value) {
    return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
  }
  function setBusy(value) {
    busy = value;
    $("#loginButton").disabled = value;
    $("#saveBook").disabled = value;
    $("#newBook").disabled = value;
    $("#refreshBooks").disabled = value;
  }
  function showLogin(text) {
    $("#loginPanel").hidden = false;
    $("#dashboard").hidden = true;
    $("#signOut").hidden = true;
    if (text) message("#loginMessage", text);
  }
  async function acceptSession(user) {
    if (!user || !user.app_metadata || user.app_metadata.role !== "admin") {
      showLogin("This account is not authorised for VELLORA administration.");
      await client.auth.signOut();
      return;
    }
    $("#loginPanel").hidden = true;
    $("#dashboard").hidden = false;
    $("#signOut").hidden = false;
    $("#adminIdentity").textContent = "Signed in as " + (user.email || "VELLORA administrator");
    await loadBooks();
  }
  async function initialise() {
    if (!window.supabase || !window.supabase.createClient) {
      showLogin("The secure sign-in service could not load. Refresh and try again.");
      return;
    }
    client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") showLogin();
      else if (session && session.user) window.setTimeout(() => acceptSession(session.user), 0);
    });
    const result = await client.auth.getSession();
    if (result.error) { showLogin(result.error.message); return; }
    if (result.data.session && result.data.session.user) await acceptSession(result.data.session.user);
    else showLogin();
  }

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    message("#loginMessage", "Checking your credentials…");
    try {
      const result = await client.auth.signInWithPassword({
        email: $("#adminEmail").value.trim(),
        password: $("#adminPassword").value
      });
      if (result.error) throw result.error;
      await acceptSession(result.data.user);
    } catch (error) {
      message("#loginMessage", error.message || "Sign-in failed. Please try again.");
    } finally { setBusy(false); }
  });
  $("#signOut").addEventListener("click", async () => {
    const result = await client.auth.signOut();
    if (result.error) notify(result.error.message);
    else showLogin("You have signed out.");
  });

  async function loadBooks() {
    message("#editorMessage", "");
    $("#bookList").innerHTML = '<p class="muted-copy">Loading your collection…</p>';
    const result = await client.from("books").select("id,title,author,slug,genre,description,cover_url,pdf_path,language,reading_time_minutes,is_featured,is_recommended,is_published,created_at").order("created_at", { ascending: false });
    if (result.error) {
      $("#bookList").innerHTML = '<p class="muted-copy">Could not load books: ' + escapeHtml(result.error.message) + '</p>';
      return;
    }
    books = result.data || [];
    $("#totalBooks").textContent = String(books.length);
    $("#publishedBooks").textContent = String(books.filter(book => book.is_published).length);
    $("#draftBooks").textContent = String(books.filter(book => !book.is_published).length);
    renderBooks();
  }
  function renderBooks() {
    if (!books.length) {
      $("#bookList").innerHTML = '<p class="muted-copy">Your shelves are empty. Add the first VELLORA book above.</p>';
      return;
    }
    $("#bookList").innerHTML = books.map(book =>
      '<article class="book-row"><div><h3>' + escapeHtml(book.title) + '</h3><p>' + escapeHtml(book.author) + ' · ' + escapeHtml(book.genre) + '</p></div>' +
      '<span class="status-pill ' + (book.is_published ? "published" : "") + '">' + (book.is_published ? "PUBLISHED" : "DRAFT") + '</span>' +
      '<div class="row-actions"><button type="button" data-edit="' + escapeHtml(book.id) + '">EDIT</button><button type="button" class="delete" data-delete="' + escapeHtml(book.id) + '">DELETE</button></div></article>'
    ).join("");
    document.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => editBook(button.dataset.edit)));
    document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => deleteBook(button.dataset.delete)));
  }
  function resetEditor() {
    editingId = null;
    $("#bookForm").reset();
    delete $("#bookSlug").dataset.touched;
    $("#bookLanguage").value = "English";
    $("#editorTitle").textContent = "Add a story";
    $("#saveBook").textContent = "SAVE BOOK ↗";
    $("#editorPanel").hidden = true;
    message("#editorMessage", "");
  }
  function editBook(id) {
    const book = books.find(item => String(item.id) === String(id));
    if (!book) return;
    editingId = book.id;
    $("#editorTitle").textContent = "Edit this story";
    $("#saveBook").textContent = "UPDATE BOOK ↗";
    $("#bookTitle").value = book.title || "";
    $("#bookAuthor").value = book.author || "";
    $("#bookGenre").value = book.genre || "";
    $("#bookSlug").value = book.slug || "";
    delete $("#bookSlug").dataset.touched;
    $("#bookLanguage").value = book.language || "English";
    $("#bookReadingTime").value = book.reading_time_minutes || "";
    $("#bookDescription").value = book.description || "";
    $("#bookFeatured").checked = !!book.is_featured;
    $("#bookRecommended").checked = !!book.is_recommended;
    $("#bookPublished").checked = !!book.is_published;
    $("#coverFile").value = "";
    $("#pdfFile").value = "";
    $("#editorPanel").hidden = false;
    $("#editorPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function fileExtension(file, allowed) {
    const name = String(file && file.name || "");
    const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
    if (!allowed.includes(extension)) throw new Error("Unsupported file type: " + name);
    return extension;
  }
  async function uploadAssets(bookId) {
    const coverFile = $("#coverFile").files[0];
    const pdfFile = $("#pdfFile").files[0];
    const updates = {};
    if (coverFile) {
      if (coverFile.size > 5 * 1024 * 1024) throw new Error("Cover images must be 5 MB or smaller.");
      if (!["image/jpeg","image/png","image/webp"].includes(coverFile.type)) throw new Error("Use a JPG, PNG or WEBP cover image.");
      const ext = fileExtension(coverFile, ["jpg","jpeg","png","webp"]);
      const path = "books/" + bookId + "/cover." + ext;
      const upload = await client.storage.from(COVER_BUCKET).upload(path, coverFile, { upsert: true, contentType: coverFile.type, cacheControl: "3600" });
      if (upload.error) throw upload.error;
      updates.cover_url = client.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
    }
    if (pdfFile) {
      if (pdfFile.size > 50 * 1024 * 1024) throw new Error("PDF files must be 50 MB or smaller.");
      if (pdfFile.type !== "application/pdf" && !pdfFile.name.toLowerCase().endsWith(".pdf")) throw new Error("Please choose a PDF file.");
      const path = "books/" + bookId + "/edition.pdf";
      const upload = await client.storage.from(PDF_BUCKET).upload(path, pdfFile, { upsert: true, contentType: "application/pdf", cacheControl: "3600" });
      if (upload.error) throw upload.error;
      updates.pdf_path = path;
    }
    return updates;
  }
  $("#bookTitle").addEventListener("input", () => {
    if (!editingId || !$("#bookSlug").dataset.touched) $("#bookSlug").value = slugify($("#bookTitle").value);
  });
  $("#bookSlug").addEventListener("input", () => { $("#bookSlug").dataset.touched = "true"; });
  async function saveBook(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    message("#editorMessage", "Saving book details and preparing files…");
    try {
      const title = $("#bookTitle").value.trim();
      const author = $("#bookAuthor").value.trim();
      const genre = $("#bookGenre").value.trim();
      const slug = slugify($("#bookSlug").value);
      if (!title || !author || !genre || !slug) throw new Error("Please complete title, author, genre and slug.");
      const desiredPublished = $("#bookPublished").checked;
      const payload = {
        title, author, genre, slug,
        description: $("#bookDescription").value.trim(),
        language: $("#bookLanguage").value.trim() || "English",
        reading_time_minutes: $("#bookReadingTime").value ? Number($("#bookReadingTime").value) : null,
        is_featured: $("#bookFeatured").checked,
        is_recommended: $("#bookRecommended").checked,
        is_published: false
      };
      let record;
      if (editingId) {
        const result = await client.from("books").update(payload).eq("id", editingId).select().single();
        if (result.error) throw result.error;
        record = result.data;
      } else {
        const result = await client.from("books").insert(payload).select().single();
        if (result.error) throw result.error;
        record = result.data;
      }
      const assetUpdates = await uploadAssets(record.id);
      if (desiredPublished && !assetUpdates.pdf_path && !record.pdf_path) {
        throw new Error("Upload the book PDF before publishing this story.");
      }
      const finalUpdates = Object.assign({}, assetUpdates, { is_published: desiredPublished });
      const updated = await client.from("books").update(finalUpdates).eq("id", record.id).select().single();
      if (updated.error) throw updated.error;
      resetEditor();
      await loadBooks();
      notify(desiredPublished ? "Book saved and published." : "Book saved as a draft.");
    } catch (error) {
      message("#editorMessage", error.message || "The book could not be saved.");
    } finally { setBusy(false); }
  }
  $("#bookForm").addEventListener("submit", saveBook);
  async function deleteBook(id) {
    const book = books.find(item => String(item.id) === String(id));
    if (!book || !window.confirm('Delete "' + book.title + '" from VELLORA? This cannot be undone.')) return;
    const files = [];
    if (book.pdf_path) files.push({ bucket: PDF_BUCKET, path: book.pdf_path });
    if (book.cover_url) {
      const marker = "/object/public/" + COVER_BUCKET + "/";
      const at = book.cover_url.indexOf(marker);
      if (at >= 0) files.push({ bucket: COVER_BUCKET, path: decodeURIComponent(book.cover_url.slice(at + marker.length).split("?")[0]) });
    }
    for (const item of files) {
      const removed = await client.storage.from(item.bucket).remove([item.path]);
      if (removed.error) notify("File cleanup warning: " + removed.error.message);
    }
    const result = await client.from("books").delete().eq("id", id);
    if (result.error) { notify(result.error.message); return; }
    await loadBooks();
    notify("Book deleted.");
  }
  $("#newBook").addEventListener("click", () => {
    resetEditor();
    $("#editorPanel").hidden = false;
    $("#editorPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#cancelEdit").addEventListener("click", resetEditor);
  $("#cancelEditBottom").addEventListener("click", resetEditor);
  $("#refreshBooks").addEventListener("click", loadBooks);
  initialise();
})();