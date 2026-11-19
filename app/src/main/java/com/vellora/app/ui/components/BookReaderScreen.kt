package com.vellora.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBackIosNew
import androidx.compose.material.icons.filled.ArrowForwardIos
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vellora.app.model.Book
import com.vellora.app.model.VelloraFont
import com.vellora.app.model.VelloraThemeStyle
import com.vellora.app.ui.theme.getFontFamily
import com.vellora.app.ui.theme.getVelloraColorScheme

@Composable
fun BookReaderScreen(
    book: Book,
    currentPageIndex: Int,
    currentTheme: VelloraThemeStyle,
    currentFont: VelloraFont,
    fontSizeSp: Int,
    isSoundEnabled: Boolean,
    onBackClicked: () -> Unit,
    onNextPage: () -> Unit,
    onPreviousPage: () -> Unit,
    onSetPage: (Int) -> Unit,
    onToggleBookmark: () -> Unit,
    onThemeChanged: (VelloraThemeStyle) -> Unit,
    onFontChanged: (VelloraFont) -> Unit,
    onFontSizeChanged: (Int) -> Unit,
    onToggleSound: (Boolean) -> Unit,
    onDownloadPdf: (Book) -> Unit
) {
    val context = LocalContext.current
    val velloraColors = getVelloraColorScheme(currentTheme)
    var showQuickSettings by remember { mutableStateOf(false) }

    // Physical Satin Ribbon Bookmark Animation length (in Dp)
    val ribbonLengthDp by animateDpAsState(
        targetValue = if (book.isBookmarked) 180.dp else 0.dp,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "ribbonAnimation"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(velloraColors.background)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Top App Bar
            ReaderTopBar(
                bookTitle = book.title,
                isBookmarked = book.isBookmarked,
                isSoundEnabled = isSoundEnabled,
                onBackClicked = onBackClicked,
                onToggleBookmark = onToggleBookmark,
                onToggleSound = { onToggleSound(!isSoundEnabled) },
                onToggleSettings = { showQuickSettings = !showQuickSettings },
                onDownloadPdf = { onDownloadPdf(book) },
                themeStyle = currentTheme
            )

            // Book Canvas (Page Content + Curl Borders)
            Box(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                // Outer Page Frame / Parchment Card
                Card(
                    modifier = Modifier
                        .fillMaxSize()
                        .shadow(16.dp, RoundedCornerShape(16.dp))
                        .border(1.5.dp, velloraColors.goldAccent, RoundedCornerShape(16.dp)),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = velloraColors.surface)
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        // Subtitle Watermark in Background
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .alpha(0.06f),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "vellora",
                                fontSize = 90.sp,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                color = velloraColors.textPrimary
                            )
                        }

                        // Book Page Text Content
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp)
                                .verticalScroll(rememberScrollState())
                        ) {
                            val pageContent = book.pages.getOrElse(currentPageIndex) { "End of Chapter." }

                            Text(
                                text = pageContent,
                                fontSize = fontSizeSp.sp,
                                lineHeight = (fontSizeSp * 1.55).sp,
                                fontFamily = getFontFamily(currentFont),
                                color = velloraColors.textPrimary,
                                textAlign = TextAlign.Justify,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        // Left & Right Swipe Touch Areas for Page Navigation
                        Row(modifier = Modifier.fillMaxSize()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .weight(1f)
                                    .clickable(onClick = onPreviousPage)
                            )
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .weight(1f)
                                    .clickable(onClick = onNextPage)
                            )
                        }

                        // Real Paper Edge Book Binding Shadow
                        Box(
                            modifier = Modifier
                                .fillMaxHeight()
                                .width(12.dp)
                                .align(Alignment.CenterStart)
                                .background(
                                    brush = Brush.horizontalGradient(
                                        colors = listOf(
                                            Color.Black.copy(alpha = 0.15f),
                                            Color.Transparent
                                        )
                                    )
                                )
                        )
                    }
                }

                // Physical Satin Ribbon Bookmark Dropping from Top Edge
                if (ribbonLengthDp > 0.dp) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(end = 40.dp)
                            .offset(y = (-4).dp)
                    ) {
                        PhysicalRibbonBookmark(
                            lengthDp = ribbonLengthDp,
                            ribbonColor = velloraColors.ribbonColor,
                            goldColor = velloraColors.goldAccent,
                            onClick = onToggleBookmark
                        )
                    }
                }
            }

            // Bottom Page Navigation Controls Bar
            ReaderBottomBar(
                currentPage = currentPageIndex,
                totalPages = book.pages.size,
                onPreviousPage = onPreviousPage,
                onNextPage = onNextPage,
                onSetPage = onSetPage,
                themeStyle = currentTheme
            )
        }

        // Quick Customization Bottom Drawer (Font, Theme, Size)
        AnimatedVisibility(
            visible = showQuickSettings,
            enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
            exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(),
            modifier = Modifier.align(Alignment.BottomCenter)
        ) {
            QuickSettingsDrawer(
                currentTheme = currentTheme,
                currentFont = currentFont,
                fontSizeSp = fontSizeSp,
                onThemeChanged = onThemeChanged,
                onFontChanged = onFontChanged,
                onFontSizeChanged = onFontSizeChanged,
                onClose = { showQuickSettings = false }
            )
        }
    }
}

@Composable
private fun PhysicalRibbonBookmark(
    lengthDp: Dp,
    ribbonColor: Color,
    goldColor: Color,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .width(28.dp)
            .height(lengthDp)
            .shadow(8.dp, RoundedCornerShape(bottomStart = 8.dp, bottomEnd = 8.dp))
            .clickable(onClick = onClick),
        color = ribbonColor,
        shape = RoundedCornerShape(bottomStart = 8.dp, bottomEnd = 8.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, goldColor)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // Golden Ribbon Fringe Stitching at bottom tip
            val path = Path().apply {
                moveTo(0f, h - 16f)
                lineTo(w / 2f, h)
                lineTo(w, h - 16f)
                lineTo(w, h)
                lineTo(0f, h)
                close()
            }
            drawPath(path = path, color = goldColor)
        }
    }
}

@Composable
private fun ReaderTopBar(
    bookTitle: String,
    isBookmarked: Boolean,
    isSoundEnabled: Boolean,
    onBackClicked: () -> Unit,
    onToggleBookmark: () -> Unit,
    onToggleSound: () -> Unit,
    onToggleSettings: () -> Unit,
    onDownloadPdf: () -> Unit,
    themeStyle: VelloraThemeStyle
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    Surface(
        color = velloraColors.surface,
        modifier = Modifier.fillMaxWidth(),
        border = androidx.compose.foundation.BorderStroke(1.dp, velloraColors.border)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClicked) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = velloraColors.accent
                )
            }

            Text(
                text = bookTitle,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif,
                color = velloraColors.textPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f)
            )

            // Animated Bookmark Action
            IconButton(onClick = onToggleBookmark) {
                Icon(
                    imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                    contentDescription = "Bookmark",
                    tint = if (isBookmarked) velloraColors.ribbonColor else velloraColors.accent
                )
            }

            // Sound Toggle
            IconButton(onClick = onToggleSound) {
                Icon(
                    imageVector = if (isSoundEnabled) Icons.Default.VolumeUp else Icons.Default.VolumeOff,
                    contentDescription = "Sound",
                    tint = velloraColors.accent
                )
            }

            // Font & Theme Options Button
            IconButton(onClick = onToggleSettings) {
                Icon(
                    imageVector = Icons.Default.Palette,
                    contentDescription = "Customization",
                    tint = velloraColors.accent
                )
            }

            // Download PDF Button
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

@Composable
private fun ReaderBottomBar(
    currentPage: Int,
    totalPages: Int,
    onPreviousPage: () -> Unit,
    onNextPage: () -> Unit,
    onSetPage: (Int) -> Unit,
    themeStyle: VelloraThemeStyle
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    Surface(
        color = velloraColors.surface,
        modifier = Modifier.fillMaxWidth(),
        border = androidx.compose.foundation.BorderStroke(1.dp, velloraColors.border)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(
                    onClick = onPreviousPage,
                    enabled = currentPage > 0
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBackIosNew,
                        contentDescription = "Previous Page",
                        tint = if (currentPage > 0) velloraColors.accent else velloraColors.textSecondary.copy(alpha = 0.3f)
                    )
                }

                Text(
                    text = "Page ${currentPage + 1} of $totalPages",
                    fontSize = 14.sp,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    color = velloraColors.textPrimary
                )

                IconButton(
                    onClick = onNextPage,
                    enabled = currentPage < totalPages - 1
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowForwardIos,
                        contentDescription = "Next Page",
                        tint = if (currentPage < totalPages - 1) velloraColors.accent else velloraColors.textSecondary.copy(alpha = 0.3f)
                    )
                }
            }

            if (totalPages > 1) {
                Slider(
                    value = currentPage.toFloat(),
                    onValueChange = { onSetPage(it.toInt()) },
                    valueRange = 0f..(totalPages - 1).toFloat(),
                    steps = if (totalPages > 2) totalPages - 2 else 0,
                    colors = SliderDefaults.colors(
                        thumbColor = velloraColors.accent,
                        activeTrackColor = velloraColors.accent,
                        inactiveTrackColor = velloraColors.border
                    ),
                    modifier = Modifier.fillMaxWidth(0.9f)
                )
            }
        }
    }
}

@Composable
private fun QuickSettingsDrawer(
    currentTheme: VelloraThemeStyle,
    currentFont: VelloraFont,
    fontSizeSp: Int,
    onThemeChanged: (VelloraThemeStyle) -> Unit,
    onFontChanged: (VelloraFont) -> Unit,
    onFontSizeChanged: (Int) -> Unit,
    onClose: () -> Unit
) {
    val velloraColors = getVelloraColorScheme(currentTheme)

    Surface(
        color = velloraColors.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        shadowElevation = 24.dp,
        modifier = Modifier
            .fillMaxWidth()
            .border(2.dp, velloraColors.goldAccent, RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Reader Settings",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                    color = velloraColors.textPrimary
                )
                Text(
                    text = "Done",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = velloraColors.accent,
                    modifier = Modifier.clickable(onClick = onClose)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Theme Selection (Only the 3 requested themes!)
            Text(
                text = "Themes",
                fontSize = 13.sp,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                color = velloraColors.textSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                VelloraThemeStyle.values().forEach { theme ->
                    val isSelected = theme == currentTheme
                    Surface(
                        color = if (isSelected) velloraColors.accent else velloraColors.surfaceVariant,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onThemeChanged(theme) }
                            .padding(vertical = 4.dp),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) velloraColors.goldAccent else velloraColors.border
                        )
                    ) {
                        Text(
                            text = theme.displayName,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Serif,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) Color.White else velloraColors.textPrimary,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(vertical = 10.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Font Selection
            Text(
                text = "Typography",
                fontSize = 13.sp,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                color = velloraColors.textSecondary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                VelloraFont.values().forEach { font ->
                    val isSelected = font == currentFont
                    Surface(
                        color = if (isSelected) velloraColors.accent else velloraColors.surfaceVariant,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onFontChanged(font) },
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) velloraColors.goldAccent else velloraColors.border
                        )
                    ) {
                        Text(
                            text = font.displayName.split(" ").first(),
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Serif,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) Color.White else velloraColors.textPrimary,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(vertical = 10.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Font Size Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Text Size ($fontSizeSp sp)",
                    fontSize = 13.sp,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    color = velloraColors.textSecondary
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { onFontSizeChanged(fontSizeSp - 2) },
                        enabled = fontSizeSp > 12
                    ) {
                        Icon(
                            imageVector = Icons.Default.Remove,
                            contentDescription = "Decrease",
                            tint = velloraColors.accent
                        )
                    }

                    Text(
                        text = "$fontSizeSp",
                        fontSize = 16.sp,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = velloraColors.textPrimary,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )

                    IconButton(
                        onClick = { onFontSizeChanged(fontSizeSp + 2) },
                        enabled = fontSizeSp < 28
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Increase",
                            tint = velloraColors.accent
                        )
                    }
                }
            }
        }
    }
}
