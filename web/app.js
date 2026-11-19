/* ==========================================================================
   VELLORA APPLICATION LOGIC
   ========================================================================== */

// 1. DATASET
const BOOKS = [
    {
        id: "bk_001",
        title: "The Golden Archives of Eldoria",
        author: "Aurelius Vance",
        category: "Fantasy & Myths",
        description: "An ancient realm where forgotten spells lie buried beneath marble library vaults. Follow Kaelen as he uncovers the lost key to the celestial gates.",
        coverColor: "#8B0000",
        isFeatured: true,
        pages: [
            `Chapter I: The Whispering Library\n\nIn the high towers of Eldoria, where silver mist hangs like spun silk between ancient pillars, the Great Archives stood silent. Thousands of leather-bound folios slept upon cedar shelves, waiting for the one hand capable of waking their slumbering runes.\n\nYoung scribe Kaelen ran his fingers across the gilded spines. The ink on these pages had been dried for three millennia, yet tonight, a soft emerald resonance hummed beneath his palms. It was the Codex of Dawn, a tome spoken of only in whispered myths by candlelit hearths.`,
            `Chapter I (Continued): The Sealed Threshold\n\nThe lock upon the Codex bore three interlocking brass rings, inscribed with celestial constellations. As Kaelen held his breath and turned the second ring, a subtle mechanism clicked beneath the ironwood casing.\n\n"Some doors, once unlocked, can never be closed," whispered Master Theron, stepping out from the shadows of the archway. His eyes reflected the faint starlight creeping through the stained glass dome above. Kaelen looked back at the glowing parchment with unwavering resolve.`,
            `Chapter II: The Celestial Map\n\nBeyond the third ring lay a star map inked in iridescent lapis lazuli. It detailed forgotten sea routes and skyways leading to the Floating Citadel of Astrum.\n\n"If the legends hold true," Kaelen noted, tracing the glowing celestial lines with his ink-stained quill, "the Heart of the Stars resides high above the Tempest Ridge. We leave at first light before the Shadow Sentinel notices the missing key."`
        ]
    },
    {
        id: "bk_002",
        title: "Echoes of Classical Antiquity",
        author: "Helena Rostova",
        category: "Classic Literature",
        description: "A breathtaking journey through ancient Mediterranean philosophy, grand amphitheaters, and timeless literary discourse.",
        coverColor: "#3E2723",
        isFeatured: false,
        pages: [
            `Book I: The Marble Agora\n\nBeneath the warm Aegean sun, the marble colonnades of Athens echoed with debate. Philosophers clad in linen robes gathered beneath the shade of olive groves, searching for truth in a world governed by impermanence.\n\nSocrates stood at the center of the gathering, his quiet demeanor commanding the undivided attention of statesmen and scholars alike. "Knowledge," he posited, "is not the accumulation of answers, but the relentless courage to ask."`,
            `Book I (Continued): The Stoic Fortress\n\nAcross the sea in Rome, Emperor Marcus Aurelius sat in his campaign tent by the frozen Danube, penning his private meditations. In the quiet hours before dawn, he reminded himself of the transient nature of earthly triumph.\n\n"You have power over your mind - not outside events. Realize this, and you will find indestructible strength." The ink dried upon the vellum, preserving wisdom that would echo across centuries.`
        ]
    },
    {
        id: "bk_003",
        title: "Midnight at Blackwood Manor",
        author: "Julian Thorne",
        category: "Mystery & Thriller",
        description: "When a Victorian clock strikes thirteen, Inspector Vance steps into a mansion where every painting hides a secret door.",
        coverColor: "#1A237E",
        isFeatured: false,
        pages: [
            `Prologue: The Thirteenth Chime\n\nRain hammered relentlessly against the tall diamond-pane windows of Blackwood Manor. Inside the grand study, the grandfather clock struck thirteen echoing beats.\n\nInspector Vance adjusted his damp tweed coat and looked down at the mahogany writing desk. A single silver key lay resting atop an unsealed envelope marked with a crest in red sealing wax: 'To the one who dares to open.'`,
            `Chapter I: The Hidden Passage\n\nBehind the heavy velvet drapery in the library, Vance discovered a subtle latch hidden in the carved oak wainscoting. With a low groan of ancient iron, the bookcase swung inward, revealing a spiral staircase leading into darkness.\n\nHis oil lamp cast dancing shadows upon stone walls damp with age. Step by step, the mystery of Lord Blackwood's vanishing act began to unravel.`
        ]
    },
    {
        id: "bk_004",
        title: "Meditations on Mind & Ether",
        author: "Dr. Nathaniel Croft",
        category: "Philosophy",
        description: "A deep exploration into consciousness, perception, time, and the quiet beauty of human thought.",
        coverColor: "#2E7D32",
        isFeatured: false,
        pages: [
            `Section 1: The Sanctuary of Silence\n\nIn an age dominated by noise, silence has become the rarest sanctuary. Consciousness is not merely a reactor to outer stimuli, but an active weaver of meaning, sculpting reality out of raw perception.\n\nTo sit quietly with one's thoughts without seeking distraction is the foundational pillar of inner freedom. Here, in the unhurried quiet, the soul listens.`,
            `Section 2: The Flow of Time\n\nTime is not a rigid line measuring seconds, but an organic river flowing through memory and anticipation. We live perpetually in the knife-edge present—where memory colors our step and hope illuminates our path ahead.`
        ]
    },
    {
        id: "bk_005",
        title: "Chronicles of the Silicon Nebula",
        author: "Lyra Vance-Kovacs",
        category: "Sci-Fi & Future",
        description: "Deep in sector 9, synthetic humans and organic wanderers chart unexplored quantum stargates.",
        coverColor: "#4A148C",
        isFeatured: false,
        pages: [
            `Cycle 01: The Quantum Horizon\n\nThe starship 'Vellora Prime' drifted silently along the event horizon of Sector 9. Synthetic pilot Unit-7 monitored the sub-space telemetry as shimmering neon energy arcs pulsed across the obsidian hull.\n\n"Bridge to navigation," Unit-7 radioed. "The quantum gate is stabilizing. Preparing warp drive ignition in T-minus ten seconds."`,
            `Cycle 02: Neon Dawn\n\nBeyond the warp jump lay the twin suns of Astraea. Cities suspended in zero-gravity spheres glimmered like diamonds against the violet void. Here, human ingenuity and artificial consciousness harmonized in perpetual creation.`
        ]
    }
];

const CATEGORIES = ["All Categories", "Fantasy & Myths", "Classic Literature", "Mystery & Thriller", "Philosophy", "Sci-Fi & Future"];

// 2. STATE MANAGEMENT
let state = {
    isDoorOpen: false,
    currentScreen: "library",
    selectedCategory: "All Categories",
    currentTheme: "enhanced-manuscript",
    currentFont: "serif",
    fontSizePx: 18,
    isSoundEnabled: true,
    activeBookId: null,
    currentPageIndex: 0,
    bookmarks: {}, // bookId -> pageIndex
    recentReads: {} // bookId -> { pageIndex, timestamp }
};

// 3. AUDIO SYNTHESIZER (Page Turn Audio)
function playPageTurnSound() {
    if (!state.isSoundEnabled) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const bufferSize = ctx.sampleRate * 0.15; // 150ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
            const progress = i / bufferSize;
            const env = Math.sin(progress * Math.PI) * (1 - progress * 0.3);
            const noise = Math.random() * 2 - 1;
            last = last + 0.2 * (noise - last); // Low pass filter
            data[i] = last * env * 0.3;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
    } catch (e) {
        console.warn("Audio Context not allowed without interaction", e);
    }
}

// 4. DOM ELEMENTS
const landingDoor = document.getElementById("landingDoor");
const openWorldBtn = document.getElementById("openWorldBtn");
const appContainer = document.getElementById("appContainer");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const floatingDropdown = document.getElementById("floatingDropdown");

const categoryContainer = document.getElementById("categoryContainer");
const featuredBanner = document.getElementById("featuredBanner");
const booksGrid = document.getElementById("booksGrid");

const screenLibrary = document.getElementById("screenLibrary");
const screenReader = document.getElementById("screenReader");
const screenRecent = document.getElementById("screenRecent");
const screenSettings = document.getElementById("screenSettings");

const readerTitle = document.getElementById("readerTitle");
const pageTextContent = document.getElementById("pageTextContent");
const physicalRibbon = document.getElementById("physicalRibbon");
const pageCounter = document.getElementById("pageCounter");
const pageSlider = document.getElementById("pageSlider");

const quickModal = document.getElementById("quickModal");

// 5. INITIALIZATION & EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
    renderCategoryChips();
    renderLibrary();
    renderRecentReads();

    // Open Door Button
    openWorldBtn.addEventListener("click", () => {
        state.isDoorOpen = true;
        landingDoor.classList.add("open");
        setTimeout(() => {
            landingDoor.classList.add("hidden");
            appContainer.classList.remove("hidden");
        }, 1400);
    });

    // Floating Hamburger Toggle
    hamburgerBtn.addEventListener("click", () => {
        floatingDropdown.classList.toggle("hidden");
    });

    // Navigation Menu Items
    document.querySelectorAll(".menu-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const screen = btn.dataset.screen;
            navigateToScreen(screen);
            floatingDropdown.classList.add("hidden");
        });
    });

    // Reader Top Actions
    document.getElementById("readerBackBtn").addEventListener("click", () => navigateToScreen("library"));
    document.getElementById("readerBookmarkBtn").addEventListener("click", toggleBookmark);
    document.getElementById("readerSoundBtn").addEventListener("click", () => {
        state.isSoundEnabled = !state.isSoundEnabled;
        document.getElementById("readerSoundBtn").innerText = state.isSoundEnabled ? "🔊" : "🔇";
        document.getElementById("soundToggle").checked = state.isSoundEnabled;
    });
    document.getElementById("readerSettingsBtn").addEventListener("click", () => quickModal.classList.remove("hidden"));
    document.getElementById("closeModalBtn").addEventListener("click", () => quickModal.classList.add("hidden"));
    document.getElementById("readerPdfBtn").addEventListener("click", downloadPdf);

    // Reader Navigation
    document.getElementById("prevPageBtn").addEventListener("click", () => changePage(-1));
    document.getElementById("nextPageBtn").addEventListener("click", () => changePage(1));
    document.getElementById("prevHotspot").addEventListener("click", () => changePage(-1));
    document.getElementById("nextHotspot").addEventListener("click", () => changePage(1));
    pageSlider.addEventListener("input", (e) => setPage(parseInt(e.target.value)));

    // Theme Radios & Quick Buttons
    document.querySelectorAll("input[name='themeRadio']").forEach(radio => {
        radio.addEventListener("change", (e) => setTheme(e.target.value));
    });
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.addEventListener("click", () => setTheme(btn.dataset.theme));
    });

    // Font Chips & Buttons
    document.querySelectorAll(".font-chip").forEach(chip => {
        chip.addEventListener("click", () => setFont(chip.dataset.font));
    });
    document.querySelectorAll(".font-btn").forEach(btn => {
        btn.addEventListener("click", () => setFont(btn.dataset.font));
    });

    // Font Size Controls
    document.getElementById("incFontBtn").addEventListener("click", () => setFontSize(state.fontSizePx + 2));
    document.getElementById("decFontBtn").addEventListener("click", () => setFontSize(state.fontSizePx - 2));

    // Sound Toggle
    document.getElementById("soundToggle").addEventListener("change", (e) => {
        state.isSoundEnabled = e.target.checked;
        document.getElementById("readerSoundBtn").innerText = state.isSoundEnabled ? "🔊" : "🔇";
    });
});

// 6. SCREEN NAVIGATION
function navigateToScreen(screenName) {
    state.currentScreen = screenName;
    screenLibrary.classList.add("hidden");
    screenReader.classList.add("hidden");
    screenRecent.classList.add("hidden");
    screenSettings.classList.add("hidden");

    document.querySelectorAll(".menu-item").forEach(m => {
        m.classList.toggle("active", m.dataset.screen === screenName);
    });

    if (screenName === "library") screenLibrary.classList.remove("hidden");
    if (screenName === "reader") screenReader.classList.remove("hidden");
    if (screenName === "recent") {
        renderRecentReads();
        screenRecent.classList.remove("hidden");
    }
    if (screenName === "settings") screenSettings.classList.remove("hidden");
}

// 7. LIBRARY RENDERING
function renderCategoryChips() {
    categoryContainer.innerHTML = CATEGORIES.map(cat => `
        <button class="chip-btn ${cat === state.selectedCategory ? 'active' : ''}" onclick="selectCategory('${cat}')">
            ${cat}
        </button>
    `).join("");
}

function selectCategory(cat) {
    state.selectedCategory = cat;
    renderCategoryChips();
    renderLibrary();
}

function renderLibrary() {
    const featured = BOOKS.find(b => b.isFeatured) || BOOKS[0];

    // Render Featured Banner
    if (state.selectedCategory === "All Categories" && featured) {
        featuredBanner.classList.remove("hidden");
        featuredBanner.innerHTML = `
            <div class="book-cover-box" style="background-color: ${featured.coverColor}">
                <span class="cover-title">${featured.title}</span>
            </div>
            <div class="featured-info">
                <span class="featured-badge">✨ FEATURED SELECTION</span>
                <h3>${featured.title}</h3>
                <div class="author">by ${featured.author}</div>
                <p>${featured.description}</p>
                <div class="btn-group">
                    <button class="primary-btn" onclick="openBook('${featured.id}')">📖 Read Now</button>
                    <button class="secondary-btn" onclick="downloadPdfForBook('${featured.id}')">📥 PDF</button>
                </div>
            </div>
        `;
    } else {
        featuredBanner.classList.add("hidden");
    }

    // Filter books
    const filtered = state.selectedCategory === "All Categories"
        ? BOOKS
        : BOOKS.filter(b => b.category === state.selectedCategory);

    // Render Grid
    booksGrid.innerHTML = filtered.map(book => {
        const isBookmarked = state.bookmarks[book.id] !== undefined;
        const recent = state.recentReads[book.id];
        const progress = recent ? Math.round(((recent.pageIndex + 1) / book.pages.length) * 100) : 0;

        return `
            <div class="book-card" onclick="openBook('${book.id}')">
                <div class="mini-cover" style="background-color: ${book.coverColor}">
                    <span>${book.title}</span>
                </div>
                <div class="book-card-info">
                    <h4>${book.title} ${isBookmarked ? '🔖' : ''}</h4>
                    <div class="author">by ${book.author}</div>
                    <div style="font-size: 12px; color: var(--accent-color);">${book.pages.length} Pages • ${book.category}</div>
                    ${progress > 0 ? `
                        <div class="progress-bar-bg">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join("");
}

// 8. BOOK READER LOGIC
function openBook(bookId) {
    const book = BOOKS.find(b => b.id === bookId);
    if (!book) return;

    state.activeBookId = bookId;
    state.currentPageIndex = state.recentReads[bookId] ? state.recentReads[bookId].pageIndex : 0;

    renderPage();
    navigateToScreen("reader");
}

function renderPage() {
    const book = BOOKS.find(b => b.id === state.activeBookId);
    if (!book) return;

    readerTitle.innerText = book.title;

    // Render Page Text
    const content = book.pages[state.currentPageIndex] || "End of Chapter.";
    pageTextContent.innerText = content;

    // Update Counter & Slider
    pageCounter.innerText = `Page ${state.currentPageIndex + 1} of ${book.pages.length}`;
    pageSlider.max = book.pages.length - 1;
    pageSlider.value = state.currentPageIndex;

    // Physical Ribbon Bookmark
    const isBookmarked = state.bookmarks[book.id] === state.currentPageIndex;
    if (isBookmarked) {
        physicalRibbon.classList.remove("hidden");
    } else {
        physicalRibbon.classList.add("hidden");
    }

    // Save Recent Progress
    state.recentReads[book.id] = {
        pageIndex: state.currentPageIndex,
        timestamp: Date.now()
    };
}

function changePage(delta) {
    const book = BOOKS.find(b => b.id === state.activeBookId);
    if (!book) return;

    const newIndex = state.currentPageIndex + delta;
    if (newIndex >= 0 && newIndex < book.pages.length) {
        state.currentPageIndex = newIndex;
        playPageTurnSound();
        renderPage();
    }
}

function setPage(index) {
    const book = BOOKS.find(b => b.id === state.activeBookId);
    if (!book) return;

    if (index >= 0 && index < book.pages.length && index !== state.currentPageIndex) {
        state.currentPageIndex = index;
        playPageTurnSound();
        renderPage();
    }
}

function toggleBookmark() {
    const bookId = state.activeBookId;
    if (!bookId) return;

    if (state.bookmarks[bookId] === state.currentPageIndex) {
        delete state.bookmarks[bookId];
    } else {
        state.bookmarks[bookId] = state.currentPageIndex;
    }
    renderPage();
    renderLibrary();
}

// 9. RECENT READS
function renderRecentReads() {
    const recentList = document.getElementById("recentList");
    const recentBookIds = Object.keys(state.recentReads).sort((a, b) =>
        state.recentReads[b].timestamp - state.recentReads[a].timestamp
    );

    if (recentBookIds.length === 0) {
        recentList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <p>No recent reading history yet. Select a book in the library!</p>
            </div>
        `;
        return;
    }

    recentList.innerHTML = recentBookIds.map(id => {
        const book = BOOKS.find(b => b.id === id);
        if (!book) return "";
        const progress = state.recentReads[id];
        const percent = Math.round(((progress.pageIndex + 1) / book.pages.length) * 100);

        return `
            <div class="featured-book-card" style="margin-bottom: 16px;">
                <div class="book-cover-box" style="background-color: ${book.coverColor}">
                    <span class="cover-title">${book.title}</span>
                </div>
                <div class="featured-info">
                    <h3>${book.title}</h3>
                    <div class="author">by ${book.author}</div>
                    <div style="font-weight: 700; color: var(--accent-color); margin-bottom: 8px;">
                        Progress: Page ${progress.pageIndex + 1} of ${book.pages.length} (${percent}%)
                    </div>
                    <div class="btn-group">
                        <button class="primary-btn" onclick="openBook('${book.id}')">▶ Resume Reading</button>
                        <button class="secondary-btn" onclick="downloadPdfForBook('${book.id}')">📥 PDF</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// 10. THEMES & TYPOGRAPHY
function setTheme(themeName) {
    state.currentTheme = themeName;
    document.body.className = `theme-${themeName} font-${state.currentFont}`;
    document.querySelectorAll("input[name='themeRadio']").forEach(r => r.checked = (r.value === themeName));
}

function setFont(fontName) {
    state.currentFont = fontName;
    document.body.className = `theme-${state.currentTheme} font-${fontName}`;
    document.querySelectorAll(".font-chip").forEach(c => c.classList.toggle("active", c.dataset.font === fontName));
}

function setFontSize(sizePx) {
    state.fontSizePx = Math.max(12, Math.min(32, sizePx));
    document.getElementById("fontSizeVal").innerText = `${state.fontSizePx}px`;
    pageTextContent.style.fontSize = `${state.fontSizePx}px`;
}

// 11. PDF GENERATION WITH VELLORA WATERMARK
function downloadPdf() {
    if (!state.activeBookId) return;
    downloadPdfForBook(state.activeBookId);
}

function downloadPdfForBook(bookId) {
    const book = BOOKS.find(b => b.id === bookId);
    if (!book) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${book.title} - Vellora Edition</title>
            <style>
                @page { size: A4; margin: 20mm; }
                body {
                    font-family: 'Georgia', serif;
                    color: #2C1810;
                    background-color: #FAF0E6;
                    margin: 0;
                    padding: 40px;
                    position: relative;
                }
                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 100px;
                    font-weight: bold;
                    color: rgba(139, 0, 0, 0.08);
                    z-index: 0;
                    user-select: none;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #D4AF37;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .title { font-size: 32px; font-weight: bold; }
                .author { font-size: 18px; font-style: italic; color: #5A3E2B; }
                .page-content {
                    font-size: 15px;
                    line-height: 1.8;
                    position: relative;
                    z-index: 10;
                    margin-bottom: 40px;
                    page-break-after: always;
                }
                .footer {
                    text-align: center;
                    font-size: 12px;
                    color: #8C7864;
                    border-top: 1px solid #C8AD8D;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="watermark">vellora</div>
            <div class="header">
                <div class="title">${book.title}</div>
                <div class="author">by ${book.author}</div>
                <div style="font-size: 12px; color: #8B0000; margin-top: 6px;">VELLORA EDITIONS • ${book.category}</div>
            </div>
            ${book.pages.map((p, idx) => `
                <div class="page-content">
                    ${p.replace(/\n\n/g, '<br><br>')}
                    <div class="footer">vellora edition • page ${idx + 1} of ${book.pages.length}</div>
                </div>
            `).join('')}
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
