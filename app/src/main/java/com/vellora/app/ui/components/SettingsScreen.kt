package com.vellora.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.TextFormat
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vellora.app.model.VelloraFont
import com.vellora.app.model.VelloraThemeStyle
import com.vellora.app.ui.theme.getVelloraColorScheme

@Composable
fun SettingsScreen(
    currentTheme: VelloraThemeStyle,
    currentFont: VelloraFont,
    fontSizeSp: Int,
    isSoundEnabled: Boolean,
    onThemeChanged: (VelloraThemeStyle) -> Unit,
    onFontChanged: (VelloraFont) -> Unit,
    onFontSizeChanged: (Int) -> Unit,
    onToggleSound: (Boolean) -> Unit
) {
    val velloraColors = getVelloraColorScheme(currentTheme)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(velloraColors.background)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 80.dp)
    ) {
        // Top Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = null,
                    tint = velloraColors.accent,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "vellora Settings",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                    color = velloraColors.textPrimary
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Personalize your aesthetic reading environment",
                fontSize = 14.sp,
                fontFamily = FontFamily.Serif,
                color = velloraColors.textSecondary
            )
        }

        // Section 1: Themes (Exclusive 3 Themes)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp)
                .shadow(6.dp, RoundedCornerShape(20.dp))
                .border(1.5.dp, velloraColors.goldAccent, RoundedCornerShape(20.dp)),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = velloraColors.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Palette,
                        contentDescription = null,
                        tint = velloraColors.accent,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Manuscript Themes",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textPrimary
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                VelloraThemeStyle.values().forEach { theme ->
                    val isSelected = theme == currentTheme
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onThemeChanged(theme) }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = isSelected,
                            onClick = { onThemeChanged(theme) },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = velloraColors.accent,
                                unselectedColor = velloraColors.textSecondary
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = theme.displayName,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Serif,
                                color = velloraColors.textPrimary
                            )
                            Text(
                                text = theme.description,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Serif,
                                color = velloraColors.textSecondary
                            )
                        }
                    }
                }
            }
        }

        // Section 2: Typography & Fonts
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp)
                .shadow(6.dp, RoundedCornerShape(20.dp))
                .border(1.5.dp, velloraColors.goldAccent, RoundedCornerShape(20.dp)),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = velloraColors.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.TextFormat,
                        contentDescription = null,
                        tint = velloraColors.accent,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Typography",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textPrimary
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                VelloraFont.values().forEach { font ->
                    val isSelected = font == currentFont
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onFontChanged(font) }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = isSelected,
                            onClick = { onFontChanged(font) },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = velloraColors.accent,
                                unselectedColor = velloraColors.textSecondary
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = font.displayName,
                            fontSize = 16.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontFamily = FontFamily.Serif,
                            color = velloraColors.textPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Font Size Selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Text Size ($fontSizeSp sp)",
                        fontSize = 15.sp,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = velloraColors.textPrimary
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

        // Section 3: Audio & Sound Effects
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp)
                .shadow(6.dp, RoundedCornerShape(20.dp))
                .border(1.5.dp, velloraColors.goldAccent, RoundedCornerShape(20.dp)),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = velloraColors.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = null,
                            tint = velloraColors.accent,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Page Turn Audio Effects",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Serif,
                                color = velloraColors.textPrimary
                            )
                            Text(
                                text = "Play subtle paper flip sound when turning pages",
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Serif,
                                color = velloraColors.textSecondary
                            )
                        }
                    }

                    Switch(
                        checked = isSoundEnabled,
                        onCheckedChange = onToggleSound,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = velloraColors.accent
                        )
                    )
                }
            }
        }
    }
}
