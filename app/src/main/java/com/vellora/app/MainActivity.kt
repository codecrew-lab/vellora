package com.vellora.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.vellora.app.model.Screen
import com.vellora.app.ui.components.BookReaderScreen
import com.vellora.app.ui.components.FloatingHamburgerMenu
import com.vellora.app.ui.components.LandingDoorScreen
import com.vellora.app.ui.components.LibraryScreen
import com.vellora.app.ui.components.RecentBooksScreen
import com.vellora.app.ui.components.SettingsScreen
import com.vellora.app.ui.theme.VelloraAppTheme
import com.vellora.app.viewmodel.VelloraViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: VelloraViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VelloraApp(viewModel = viewModel)
        }
    }
}

@Composable
fun VelloraApp(viewModel: VelloraViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    VelloraAppTheme(themeStyle = uiState.currentTheme) {
        Surface(modifier = Modifier.fillMaxSize()) {
            LandingDoorScreen(
                isOpen = uiState.isDoorOpen,
                onOpenClicked = { viewModel.openWorld() },
                themeStyle = uiState.currentTheme
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    // Screen Switcher with Crossfade
                    Crossfade(
                        targetState = uiState.currentScreen,
                        label = "screenTransition"
                    ) { screen ->
                        when (screen) {
                            Screen.LIBRARY -> {
                                LibraryScreen(
                                    featuredBook = uiState.featuredBook,
                                    books = uiState.filteredBooks,
                                    selectedCategory = uiState.selectedCategory,
                                    onCategorySelected = { viewModel.selectCategory(it) },
                                    onBookSelected = { viewModel.selectBook(it) },
                                    onDownloadPdf = { viewModel.downloadPdf(context, it) },
                                    themeStyle = uiState.currentTheme
                                )
                            }

                            Screen.READER -> {
                                val activeBook = uiState.activeBook
                                if (activeBook != null) {
                                    BookReaderScreen(
                                        book = activeBook,
                                        currentPageIndex = uiState.currentPageIndex,
                                        currentTheme = uiState.currentTheme,
                                        currentFont = uiState.currentFont,
                                        fontSizeSp = uiState.fontSizeSp,
                                        isSoundEnabled = uiState.isSoundEnabled,
                                        onBackClicked = { viewModel.navigateTo(Screen.LIBRARY) },
                                        onNextPage = { viewModel.nextPage() },
                                        onPreviousPage = { viewModel.previousPage() },
                                        onSetPage = { viewModel.setPage(it) },
                                        onToggleBookmark = { viewModel.toggleBookmark() },
                                        onThemeChanged = { viewModel.setTheme(it) },
                                        onFontChanged = { viewModel.setFont(it) },
                                        onFontSizeChanged = { viewModel.setFontSize(it) },
                                        onToggleSound = { viewModel.toggleSound(it) },
                                        onDownloadPdf = { viewModel.downloadPdf(context, it) }
                                    )
                                } else {
                                    viewModel.navigateTo(Screen.LIBRARY)
                                }
                            }

                            Screen.RECENT_BOOKS -> {
                                RecentBooksScreen(
                                    recentBooks = uiState.recentBooks,
                                    onSelectBook = { viewModel.selectBook(it) },
                                    onDownloadPdf = { viewModel.downloadPdf(context, it) },
                                    onNavigateToLibrary = { viewModel.navigateTo(Screen.LIBRARY) },
                                    themeStyle = uiState.currentTheme
                                )
                            }

                            Screen.SETTINGS -> {
                                SettingsScreen(
                                    currentTheme = uiState.currentTheme,
                                    currentFont = uiState.currentFont,
                                    fontSizeSp = uiState.fontSizeSp,
                                    isSoundEnabled = uiState.isSoundEnabled,
                                    onThemeChanged = { viewModel.setTheme(it) },
                                    onFontChanged = { viewModel.setFont(it) },
                                    onFontSizeChanged = { viewModel.setFontSize(it) },
                                    onToggleSound = { viewModel.toggleSound(it) }
                                )
                            }
                        }
                    }

                    // Floating Hamburger Navigation Menu (Visible on Library, Recent, Settings screens)
                    if (uiState.isDoorOpen && uiState.currentScreen != Screen.READER) {
                        FloatingHamburgerMenu(
                            currentScreen = uiState.currentScreen,
                            onNavigate = { viewModel.navigateTo(it) },
                            themeStyle = uiState.currentTheme
                        )
                    }
                }
            }
        }
    }
}
