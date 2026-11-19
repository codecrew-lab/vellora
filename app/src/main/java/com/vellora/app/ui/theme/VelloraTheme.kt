package com.vellora.app.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import com.vellora.app.model.VelloraFont
import com.vellora.app.model.VelloraThemeStyle

data class VelloraColorScheme(
    val background: Color,
    val surface: Color,
    val surfaceVariant: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val accent: Color,
    val goldAccent: Color,
    val border: Color,
    val ribbonColor: Color,
    val watermarkColor: Color
)

val ClassicVellumColorScheme = VelloraColorScheme(
    background = Color(0xFFF5E6D3),       // Warm parchment
    surface = Color(0xFFEEDCC8),          // Aged paper card
    surfaceVariant = Color(0xFFE5CEB5),   // Slightly darker card
    textPrimary = Color(0xFF3E2723),      // Rich sepia brown
    textSecondary = Color(0xFF6D4C41),    // Warm medium brown
    accent = Color(0xFF8D6E63),           // Muted copper
    goldAccent = Color(0xFFBCAAA4),       // Soft beige-gold
    border = Color(0xFFD7CCC8),           // Fine parchment line
    ribbonColor = Color(0xFFB71C1C),       // Deep Crimson Ribbon
    watermarkColor = Color(0x1A3E2723)    // Light watermark
)

val EnhancedManuscriptColorScheme = VelloraColorScheme(
    background = Color(0xFFFAF0E6),       // Aged manuscript ivory
    surface = Color(0xFFF2E3D0),          // Soft illuminated paper
    surfaceVariant = Color(0xFFE8D4BB),   // Warm card variant
    textPrimary = Color(0xFF2C1810),      // Ink black/deep brown
    textSecondary = Color(0xFF5A3E2B),    // Walnut brown
    accent = Color(0xFF8B0000),           // Royal Burgundy
    goldAccent = Color(0xFFD4AF37),       // Illuminated Gold
    border = Color(0xFFC8AD8D),           // Gilded border line
    ribbonColor = Color(0xFF8B0000),       // Royal Burgundy Ribbon
    watermarkColor = Color(0x228B0000)    // Subtle Burgundy watermark
)

val DarkHeritageColorScheme = VelloraColorScheme(
    background = Color(0xFF12161A),       // Deep charcoal leather
    surface = Color(0xFF1B2026),          // Dark navy slate card
    surfaceVariant = Color(0xFF242B33),   // Slate variant
    textPrimary = Color(0xFFE0D8C3),      // Soft antique ivory
    textSecondary = Color(0xFFAAA28D),    // Muted parchment silver
    accent = Color(0xFFC5A059),           // Ancient Gold/Bronze
    goldAccent = Color(0xFFD4AF37),       // Bright Gold
    border = Color(0xFF2E3742),           // Dark frame border
    ribbonColor = Color(0xFFD32F2F),       // Rich Scarlet Ribbon
    watermarkColor = Color(0x1AE0D8C3)    // Soft white translucent watermark
)

fun getVelloraColorScheme(themeStyle: VelloraThemeStyle): VelloraColorScheme {
    return when (themeStyle) {
        VelloraThemeStyle.CLASSIC_VELLUM -> ClassicVellumColorScheme
        VelloraThemeStyle.ENHANCED_MANUSCRIPT -> EnhancedManuscriptColorScheme
        VelloraThemeStyle.DARK_HERITAGE -> DarkHeritageColorScheme
    }
}

fun getFontFamily(font: VelloraFont): FontFamily {
    return when (font) {
        VelloraFont.SERIF -> FontFamily.Serif
        VelloraFont.SANS_SERIF -> FontFamily.SansSerif
        VelloraFont.MONOSPACE -> FontFamily.Monospace
        VelloraFont.CURSIVE -> FontFamily.Cursive
    }
}

@Composable
fun VelloraAppTheme(
    themeStyle: VelloraThemeStyle = VelloraThemeStyle.ENHANCED_MANUSCRIPT,
    content: @Composable () -> Unit
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    val materialColors: ColorScheme = if (themeStyle == VelloraThemeStyle.DARK_HERITAGE) {
        darkColorScheme(
            primary = velloraColors.accent,
            secondary = velloraColors.goldAccent,
            background = velloraColors.background,
            surface = velloraColors.surface,
            onPrimary = Color.Black,
            onBackground = velloraColors.textPrimary,
            onSurface = velloraColors.textPrimary
        )
    } else {
        lightColorScheme(
            primary = velloraColors.accent,
            secondary = velloraColors.goldAccent,
            background = velloraColors.background,
            surface = velloraColors.surface,
            onPrimary = Color.White,
            onBackground = velloraColors.textPrimary,
            onSurface = velloraColors.textPrimary
        )
    }

    MaterialTheme(
        colorScheme = materialColors,
        content = content
    )
}
