package com.vellora.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vellora.app.model.Screen
import com.vellora.app.model.VelloraThemeStyle
import com.vellora.app.ui.theme.getVelloraColorScheme

@Composable
fun FloatingHamburgerMenu(
    currentScreen: Screen,
    onNavigate: (Screen) -> Unit,
    themeStyle: VelloraThemeStyle = VelloraThemeStyle.ENHANCED_MANUSCRIPT
) {
    val velloraColors = getVelloraColorScheme(themeStyle)
    var isExpanded by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Floating Hamburger Toggle Button
        FloatingActionButton(
            onClick = { isExpanded = !isExpanded },
            shape = CircleShape,
            containerColor = velloraColors.surface,
            contentColor = velloraColors.textPrimary,
            elevation = FloatingActionButtonDefaults.elevation(8.dp),
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(56.dp)
                .border(2.dp, velloraColors.goldAccent, CircleShape)
        ) {
            Icon(
                imageVector = if (isExpanded) Icons.Default.Close else Icons.Default.Menu,
                contentDescription = "Floating Menu",
                tint = velloraColors.accent,
                modifier = Modifier.size(28.dp)
            )
        }

        // Expanded Dropdown Overlay
        AnimatedVisibility(
            visible = isExpanded,
            enter = fadeIn() + scaleIn(),
            exit = fadeOut() + scaleOut(),
            modifier = Modifier.align(Alignment.TopEnd)
        ) {
            Box(
                modifier = Modifier
                    .padding(top = 64.dp)
                    .width(230.dp)
                    .shadow(16.dp, RoundedCornerShape(20.dp))
                    .background(velloraColors.surface, RoundedCornerShape(20.dp))
                    .border(2.dp, velloraColors.goldAccent, RoundedCornerShape(20.dp))
                    .padding(vertical = 12.dp)
            ) {
                Column {
                    // Header Brand
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = "vellora",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Serif,
                            color = velloraColors.accent
                        )
                    }

                    // 1. Library Option
                    MenuItemRow(
                        title = "Library",
                        icon = Icons.Default.MenuBook,
                        isSelected = currentScreen == Screen.LIBRARY,
                        themeStyle = themeStyle,
                        onClick = {
                            isExpanded = false
                            onNavigate(Screen.LIBRARY)
                        }
                    )

                    // 2. Recent Books Option
                    MenuItemRow(
                        title = "Recent Books Read",
                        icon = Icons.Default.Bookmark,
                        isSelected = currentScreen == Screen.RECENT_BOOKS,
                        themeStyle = themeStyle,
                        onClick = {
                            isExpanded = false
                            onNavigate(Screen.RECENT_BOOKS)
                        }
                    )

                    // 3. Settings Option
                    MenuItemRow(
                        title = "Settings",
                        icon = Icons.Default.Settings,
                        isSelected = currentScreen == Screen.SETTINGS,
                        themeStyle = themeStyle,
                        onClick = {
                            isExpanded = false
                            onNavigate(Screen.SETTINGS)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun MenuItemRow(
    title: String,
    icon: ImageVector,
    isSelected: Boolean,
    themeStyle: VelloraThemeStyle,
    onClick: () -> Unit
) {
    val colors = getVelloraColorScheme(themeStyle)

    Surface(
        color = if (isSelected) colors.surfaceVariant else Color.Transparent,
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 12.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = if (isSelected) colors.accent else colors.textSecondary,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(14.dp))
            Text(
                text = title,
                fontSize = 15.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                fontFamily = FontFamily.Serif,
                color = if (isSelected) colors.textPrimary else colors.textSecondary
            )
        }
    }
}
