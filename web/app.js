/* VELLORA · PHASE 1 — INTERACTIONS
   No sample books are stored here. The catalogue will be connected to Supabase later. */
(function () {
  "use strict";

  const body = document.body;
  const landingDoor = document.getElementById("landingDoor");
  const appContainer = document.getElementById("appContainer");
  const openWorldBtn = document.getElementById("openWorldBtn");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const menuBackdrop = document.getElementById("menuBackdrop");
  const floatingMenu = document.getElementById("floatingMenu");
  const bookSearch = document.getElementById("bookSearch");
  const themeChoices = document.querySelectorAll("[data-theme-choice]");
  const menuItems = document.querySelectorAll(".menu-item");
  const screens = document.querySelectorAll("[data-screen-panel]");

  const allowedThemes = ["enhanced-manuscript", "classic-vellum", "dark-heritage"];
  const categories = document.querySelectorAll(".category-chip");

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) { /* Storage may be unavailable. */ }
  }

  function setTheme(themeName) {
    if (!allowedThemes.includes(themeName)) return;
    allowedThemes.forEach(function (theme) { body.classList.remove("theme-" + theme); });
    body.classList.add("theme-" + themeName);
    themeChoices.forEach(function (choice) {
      const selected = choice.dataset.themeChoice === themeName;
      choice.classList.toggle("is-current", selected);
      choice.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    writeStorage("vellora-theme", themeName);
  }

  function openLibrary() {
    appContainer.classList.remove("is-hidden");
    if (landingDoor) {
      landingDoor.classList.add("is-opening");
      window.setTimeout(function () {
        landingDoor.classList.add("is-gone");
        landingDoor.setAttribute("aria-hidden", "true");
      }, 1900);
    }
    writeStorage("vellora-visited", "yes");
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-label", "Open navigation");
    floatingMenu.setAttribute("aria-hidden", "true");
  }

  function toggleMenu() {
    const isOpen = body.classList.toggle("menu-open");
    hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    hamburgerBtn.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    floatingMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }

  function showScreen(name) {
    screens.forEach(function (screen) {
      screen.classList.toggle("is-hidden", screen.dataset.screenPanel !== name);
    });
    menuItems.forEach(function (item) {
      item.classList.toggle("is-active", item.dataset.screen === name);
    });
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  openWorldBtn.addEventListener("click", openLibrary);
  hamburgerBtn.addEventListener("click", toggleMenu);
  menuBackdrop.addEventListener("click", closeMenu);

  menuItems.forEach(function (item) {
    item.addEventListener("click", function () { showScreen(item.dataset.screen); });
  });

  document.querySelectorAll("[data-go-library]").forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      showScreen("library");
    });
  });

  document.getElementById("topSearchBtn").addEventListener("click", function () {
    showScreen("library");
    bookSearch.focus();
  });

  document.getElementById("backToTop").addEventListener("click", function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  categories.forEach(function (chip) {
    chip.addEventListener("click", function () {
      categories.forEach(function (other) { other.classList.remove("is-selected"); });
      chip.classList.add("is-selected");
      /* Genre filters become data-driven when the catalogue is connected. */
      const label = chip.dataset.category;
      const emptyMessage = document.querySelector(".empty-library .eyebrow");
      if (emptyMessage) emptyMessage.textContent = label === "All Stories" ? "THE SHELVES ARE BEING PREPARED" : "THE " + label.toUpperCase() + " COLLECTION IS BEING PREPARED";
    });
  });

  bookSearch.addEventListener("input", function () {
    const emptyHeading = document.querySelector(".empty-library h3");
    const emptyDescription = document.querySelector(".empty-library > p:last-child");
    const query = bookSearch.value.trim();
    if (!emptyHeading || !emptyDescription) return;
    if (query) {
      emptyHeading.textContent = "Your search is ready for its first story.";
      emptyDescription.textContent = "No published books are available to search yet. Stories added through the VELLORA admin dashboard will appear here.";
    } else {
      emptyHeading.innerHTML = "Every great library begins<br>with its first story.";
      emptyDescription.textContent = "Books published by the VELLORA team will appear here. Come back soon to discover your next world.";
    }
  });

  themeChoices.forEach(function (choice) {
    choice.addEventListener("click", function () { setTheme(choice.dataset.themeChoice); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
    if (event.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      event.preventDefault();
      showScreen("library");
      bookSearch.focus();
    }
  });

  const savedTheme = readStorage("vellora-theme", "enhanced-manuscript");
  setTheme(allowedThemes.includes(savedTheme) ? savedTheme : "enhanced-manuscript");

  if (readStorage("vellora-visited", "no") === "yes") {
    appContainer.classList.remove("is-hidden");
    landingDoor.classList.add("is-gone");
    landingDoor.setAttribute("aria-hidden", "true");
  }
})();