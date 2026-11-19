package com.vellora.app.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vellora.app.audio.PageTurnAudioPlayer
import com.vellora.app.data.BookRepository
import com.vellora.app.model.Book
import com.vellora.app.model.BookCategory
import com.vellora.app.model.Screen
import com.vellora.app.model.VelloraFont
import com.vellora.app.model.VelloraThemeStyle
import com.vellora.app.pdf.PdfExporter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class VelloraUiState(
    val isDoorOpen: Boolean = false,
    val currentScreen: Screen = Screen.LIBRARY,
    val selectedCategory: BookCategory = BookCategory.ALL,
    val currentTheme: VelloraThemeStyle = VelloraThemeStyle.ENHANCED_MANUSCRIPT,
    val currentFont: VelloraFont = VelloraFont.SERIF,
    val fontSizeSp: Int = 18,
    val isSoundEnabled: Boolean = true,
    val books: List<Book> = BookRepository.sampleBooks,
    val activeBook: Book? = null,
    val currentPageIndex: Int = 0,
    val isExportingPdf: Boolean = false
) {
    val featuredBook: Book?
        get() = books.firstOrNull { it.isFeatured } ?: books.firstOrNull()

    val filteredBooks: List<Book>
        get() = if (selectedCategory == BookCategory.ALL) {
            books
        } else {
            books.filter { it.category == selectedCategory }
        }

    val recentBooks: List<Book>
        get() = books.filter { it.currentPage > 0 || it.isBookmarked }
            .sortedByDescending { it.lastReadTimestamp }
}

class VelloraViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(VelloraUiState())
    val uiState: StateFlow<VelloraUiState> = _uiState.asStateFlow()

    fun openWorld() {
        _uiState.update { it.copy(isDoorOpen = true) }
    }

    fun navigateTo(screen: Screen) {
        _uiState.update { it.copy(currentScreen = screen) }
    }

    fun selectCategory(category: BookCategory) {
        _uiState.update { it.copy(selectedCategory = category) }
    }

    fun selectBook(book: Book) {
        _uiState.update { state ->
            val updatedBooks = state.books.map { b ->
                if (b.id == book.id) b.copy(lastReadTimestamp = System.currentTimeMillis()) else b
            }
            state.copy(
                books = updatedBooks,
                activeBook = book,
                currentPageIndex = book.currentPage,
                currentScreen = Screen.READER
            )
        }
    }

    fun nextPage() {
        val state = _uiState.value
        val book = state.activeBook ?: return
        if (state.currentPageIndex < book.pages.size - 1) {
            val newIndex = state.currentPageIndex + 1
            updateReadingProgress(newIndex)
            playTurnSound()
        }
    }

    fun previousPage() {
        val state = _uiState.value
        if (state.currentPageIndex > 0) {
            val newIndex = state.currentPageIndex - 1
            updateReadingProgress(newIndex)
            playTurnSound()
        }
    }

    fun setPage(pageIndex: Int) {
        val state = _uiState.value
        val book = state.activeBook ?: return
        if (pageIndex in book.pages.indices && pageIndex != state.currentPageIndex) {
            updateReadingProgress(pageIndex)
            playTurnSound()
        }
    }

    private fun updateReadingProgress(pageIndex: Int) {
        _uiState.update { state ->
            val active = state.activeBook ?: return@update state
            val updatedActive = active.copy(
                currentPage = pageIndex,
                lastReadTimestamp = System.currentTimeMillis()
            )
            val updatedBooks = state.books.map { b ->
                if (b.id == active.id) updatedActive else b
            }
            state.copy(
                activeBook = updatedActive,
                currentPageIndex = pageIndex,
                books = updatedBooks
            )
        }
    }

    fun toggleBookmark() {
        _uiState.update { state ->
            val active = state.activeBook ?: return@update state
            val newBookmarkState = !active.isBookmarked
            val updatedActive = active.copy(
                isBookmarked = newBookmarkState,
                bookmarkedPage = if (newBookmarkState) state.currentPageIndex else null
            )
            val updatedBooks = state.books.map { b ->
                if (b.id == active.id) updatedActive else b
            }
            state.copy(
                activeBook = updatedActive,
                books = updatedBooks
            )
        }
    }

    fun setTheme(theme: VelloraThemeStyle) {
        _uiState.update { it.copy(currentTheme = theme) }
    }

    fun setFont(font: VelloraFont) {
        _uiState.update { it.copy(currentFont = font) }
    }

    fun setFontSize(sizeSp: Int) {
        _uiState.update { it.copy(fontSizeSp = sizeSp.coerceIn(12, 28)) }
    }

    fun toggleSound(enabled: Boolean) {
        PageTurnAudioPlayer.setSoundEnabled(enabled)
        _uiState.update { it.copy(isSoundEnabled = enabled) }
    }

    private fun playTurnSound() {
        if (_uiState.value.isSoundEnabled) {
            viewModelScope.launch {
                PageTurnAudioPlayer.playPageTurnSound()
            }
        }
    }

    fun downloadPdf(context: Context, book: Book) {
        viewModelScope.launch {
            _uiState.update { it.copy(isExportingPdf = true) }
            PdfExporter.exportBookToPdf(context, book)
            _uiState.update { it.copy(isExportingPdf = false) }
        }
    }
}
