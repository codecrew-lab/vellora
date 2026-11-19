package com.vellora.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vellora.app.model.Book
import com.vellora.app.model.Screen
import com.vellora.app.model.VelloraThemeStyle
import com.vellora.app.ui.theme.getVelloraColorScheme

@Composable
fun RecentBooksScreen(
    recentBooks: List<Book>,
    onSelectBook: (Book) -> Unit,
    onDownloadPdf: (Book) -> Unit,
    onNavigateToLibrary: () -> Unit,
    themeStyle: VelloraThemeStyle = VelloraThemeStyle.ENHANCED_MANUSCRIPT
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(velloraColors.background)
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Bookmark,
                    contentDescription = null,
                    tint = velloraColors.ribbonColor,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Recent Reads",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                    color = velloraColors.textPrimary
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Pick up right where you left off",
                fontSize = 14.sp,
                fontFamily = FontFamily.Serif,
                color = velloraColors.textSecondary
            )
        }

        if (recentBooks.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = null,
                        tint = velloraColors.accent,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No recent reading history yet",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Open any book in the library to start reading",
                        fontSize = 14.sp,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textSecondary
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = onNavigateToLibrary,
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = velloraColors.accent)
                    ) {
                        Text(text = "Go to Library", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(recentBooks) { book ->
                    RecentBookCard(
                        book = book,
                        onResumeRead = { onSelectBook(book) },
                        onDownloadPdf = { onDownloadPdf(book) },
                        themeStyle = themeStyle
                    )
                }
            }
        }
    }
}

@Composable
private fun RecentBookCard(
    book: Book,
    onResumeRead: () -> Unit,
    onDownloadPdf: () -> Unit,
    themeStyle: VelloraThemeStyle
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp)
            .shadow(8.dp, RoundedCornerShape(20.dp))
            .border(1.5.dp, velloraColors.goldAccent, RoundedCornerShape(20.dp)),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = velloraColors.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Book Cover Graphic
                Surface(
                    modifier = Modifier
                        .size(width = 70.dp, height = 100.dp)
                        .shadow(6.dp, RoundedCornerShape(10.dp)),
                    shape = RoundedCornerShape(10.dp),
                    color = try {
                        Color(android.graphics.Color.parseColor(book.coverColorHex))
                    } catch (e: Exception) {
                        velloraColors.accent
                    },
                    border = androidx.compose.foundation.BorderStroke(1.dp, velloraColors.goldAccent)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = book.title,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif,
                            color = Color.White,
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = book.title,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif,
                            color = velloraColors.textPrimary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f)
                        )

                        if (book.isBookmarked) {
                            Icon(
                                imageVector = Icons.Default.Bookmark,
                                contentDescription = "Bookmarked",
                                tint = velloraColors.ribbonColor,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = "by ${book.author}",
                        fontSize = 13.sp,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textSecondary
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Progress: Page ${book.currentPage + 1} of ${book.totalPages} (${book.readingProgressPercent}%)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.accent
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    LinearProgressIndicator(
                        progress = { book.readingProgressPercent / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(CircleShape),
                        color = velloraColors.accent,
                        trackColor = velloraColors.border
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onResumeRead,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = velloraColors.accent)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Resume Reading",
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold
                    )
                }

                OutlinedButton(
                    onClick = onDownloadPdf,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = velloraColors.textPrimary),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, velloraColors.accent)
                ) {
                    Icon(
                        imageVector = Icons.Default.Download,
                        contentDescription = "PDF",
                        tint = velloraColors.accent,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
