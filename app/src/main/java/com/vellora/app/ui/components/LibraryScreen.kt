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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vellora.app.model.Book
import com.vellora.app.model.BookCategory
import com.vellora.app.model.VelloraThemeStyle
import com.vellora.app.ui.theme.getVelloraColorScheme

@Composable
fun LibraryScreen(
    featuredBook: Book?,
    books: List<Book>,
    selectedCategory: BookCategory,
    onCategorySelected: (BookCategory) -> Unit,
    onBookSelected: (Book) -> Unit,
    onDownloadPdf: (Book) -> Unit,
    themeStyle: VelloraThemeStyle = VelloraThemeStyle.ENHANCED_MANUSCRIPT
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(velloraColors.background),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        // Top Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 24.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = null,
                        tint = velloraColors.accent,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "vellora Library",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textPrimary
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Explore timeless manuscripts and enchanted stories",
                    fontSize = 14.sp,
                    fontFamily = FontFamily.Serif,
                    color = velloraColors.textSecondary
                )
            }
        }

        // Category Filter Row
        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 20.dp)
            ) {
                items(BookCategory.values()) { category ->
                    val isSelected = category == selectedCategory
                    FilterChip(
                        selected = isSelected,
                        onClick = { onCategorySelected(category) },
                        label = {
                            Text(
                                text = category.displayName,
                                fontFamily = FontFamily.Serif,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = velloraColors.accent,
                            selectedLabelColor = Color.White,
                            containerColor = velloraColors.surface,
                            labelColor = velloraColors.textPrimary
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            borderColor = if (isSelected) velloraColors.goldAccent else velloraColors.border,
                            selectedBorderColor = velloraColors.goldAccent,
                            enabled = true,
                            selected = isSelected
                        ),
                        shape = RoundedCornerShape(20.dp)
                    )
                }
            }
        }

        // Featured Book Banner
        if (featuredBook != null && selectedCategory == BookCategory.ALL) {
            item {
                FeaturedBookCard(
                    book = featuredBook,
                    onReadClicked = { onBookSelected(featuredBook) },
                    onDownloadPdf = { onDownloadPdf(featuredBook) },
                    themeStyle = themeStyle
                )
            }
        }

        // Section Title: All Books
        item {
            Text(
                text = if (selectedCategory == BookCategory.ALL) "Collection Books" else selectedCategory.displayName,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif,
                color = velloraColors.textPrimary,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
            )
        }

        // Book Items List
        items(books) { book ->
            BookListItemCard(
                book = book,
                onBookClick = { onBookSelected(book) },
                onDownloadPdf = { onDownloadPdf(book) },
                themeStyle = themeStyle
            )
        }
    }
}

@Composable
private fun FeaturedBookCard(
    book: Book,
    onReadClicked: () -> Unit,
    onDownloadPdf: () -> Unit,
    themeStyle: VelloraThemeStyle
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp)
            .shadow(12.dp, RoundedCornerShape(24.dp))
            .border(2.dp, velloraColors.goldAccent, RoundedCornerShape(24.dp)),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = velloraColors.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            // Featured Badge
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .background(velloraColors.accent, RoundedCornerShape(12.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = velloraColors.goldAccent,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "FEATURED SELECTION",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                // Book Cover Graphic Box
                Surface(
                    modifier = Modifier
                        .size(width = 95.dp, height = 135.dp)
                        .shadow(8.dp, RoundedCornerShape(12.dp)),
                    shape = RoundedCornerShape(12.dp),
                    color = try {
                        Color(android.graphics.Color.parseColor(book.coverColorHex))
                    } catch (e: Exception) {
                        velloraColors.accent
                    },
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, velloraColors.goldAccent)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "vellora",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Serif,
                                color = velloraColors.goldAccent,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = book.title,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Serif,
                                color = Color.White,
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Book Metadata
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = book.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textPrimary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "by ${book.author}",
                        fontSize = 14.sp,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textSecondary
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = book.description,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textSecondary,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onReadClicked,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = velloraColors.accent)
                ) {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Read Now",
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold
                    )
                }

                OutlinedButton(
                    onClick = onDownloadPdf,
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = velloraColors.textPrimary),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, velloraColors.accent)
                ) {
                    Icon(
                        imageVector = Icons.Default.Download,
                        contentDescription = "PDF",
                        tint = velloraColors.accent,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "PDF", fontFamily = FontFamily.Serif)
                }
            }
        }
    }
}

@Composable
private fun BookListItemCard(
    book: Book,
    onBookClick: () -> Unit,
    onDownloadPdf: () -> Unit,
    themeStyle: VelloraThemeStyle
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 6.dp)
            .clickable(onClick = onBookClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = velloraColors.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Book Mini Cover
            Surface(
                modifier = Modifier
                    .size(width = 65.dp, height = 90.dp)
                    .shadow(4.dp, RoundedCornerShape(8.dp)),
                shape = RoundedCornerShape(8.dp),
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
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = Color.White,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            // Info
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = book.title,
                        fontSize = 16.sp,
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
                            modifier = Modifier.size(18.dp)
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

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "${book.totalPages} Pages • ${book.category.displayName}",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Serif,
                    color = velloraColors.accent
                )

                if (book.readingProgressPercent > 0) {
                    Spacer(modifier = Modifier.height(6.dp))
                    LinearProgressIndicator(
                        progress = { book.readingProgressPercent / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .clip(CircleShape),
                        color = velloraColors.goldAccent,
                        trackColor = velloraColors.border
                    )
                }
            }

            IconButton(onClick = onDownloadPdf) {
                Icon(
                    imageVector = Icons.Default.Download,
                    contentDescription = "Download PDF",
                    tint = velloraColors.accent
                )
            }
        }
    }
}
