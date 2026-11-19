package com.vellora.app.model

enum class BookCategory(val displayName: String) {
    ALL("All Categories"),
    FANTASY("Fantasy & Myths"),
    CLASSICS("Classic Literature"),
    MYSTERY("Mystery & Thriller"),
    PHILOSOPHY("Philosophy"),
    SCI_FI("Sci-Fi & Future"),
    POETRY("Poetry & Verse")
}

enum class VelloraThemeStyle(val displayName: String, val description: String) {
    CLASSIC_VELLUM("Classic Vellum", "Warm parchment tone with sepia text"),
    ENHANCED_MANUSCRIPT("Enhanced Manuscript", "Aged manuscript paper with royal gold & crimson accents"),
    DARK_HERITAGE("Dark Heritage", "Deep charcoal backdrop with soft antique ivory text")
}

enum class VelloraFont(val displayName: String) {
    SERIF("Classic Serif"),
    SANS_SERIF("Modern Sans"),
    MONOSPACE("Monospace Typewriter"),
    CURSIVE("Manuscript Script")
}

data class Book(
    val id: String,
    val title: String,
    val author: String,
    val category: BookCategory,
    val description: String,
    val coverColorHex: String,
    val pages: List<String>,
    val isFeatured: Boolean = false,
    val totalPages: Int = pages.size,
    val currentPage: Int = 0,
    val isBookmarked: Boolean = false,
    val bookmarkedPage: Int? = null,
    val lastReadTimestamp: Long = System.currentTimeMillis()
) {
    val readingProgressPercent: Int
        get() = if (pages.isEmpty()) 0 else (((currentPage + 1).toFloat() / pages.size) * 100).toInt()
}

enum class Screen {
    LIBRARY,
    READER,
    RECENT_BOOKS,
    SETTINGS
}
