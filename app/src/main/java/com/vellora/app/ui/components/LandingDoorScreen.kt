package com.vellora.app.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vellora.app.model.VelloraThemeStyle
import com.vellora.app.ui.theme.getVelloraColorScheme
import kotlin.math.roundToInt

@Composable
fun LandingDoorScreen(
    isOpen: Boolean,
    onOpenClicked: () -> Unit,
    themeStyle: VelloraThemeStyle = VelloraThemeStyle.ENHANCED_MANUSCRIPT,
    contentBehind: @Composable () -> Unit
) {
    val velloraColors = getVelloraColorScheme(themeStyle)

    // Animation progress: 0f = fully closed, 1f = fully split open
    val doorProgress by animateFloatAsState(
        targetValue = if (isOpen) 1f else 0f,
        animationSpec = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
        label = "doorAnimation"
    )

    Box(modifier = Modifier.fillMaxSize()) {
        // Main Content (Library / App) rendered behind the door split
        contentBehind()

        // If door is fully split open, don't draw the overlay panels
        if (doorProgress < 0.99f) {
            val contentAlpha = (1f - doorProgress * 1.5f).coerceIn(0f, 1f)

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.3f * (1f - doorProgress)))
            ) {
                // Left Door Panel (Slides to Left)
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(0.505f)
                        .align(Alignment.CenterStart)
                        .offset {
                            val strokeOffset = -1200 * doorProgress
                            IntOffset(strokeOffset.roundToInt(), 0)
                        }
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(
                                    velloraColors.surfaceVariant,
                                    velloraColors.surface,
                                    velloraColors.background
                                )
                            )
                        )
                        .border(
                            width = 2.dp,
                            color = velloraColors.goldAccent
                        )
                ) {
                    DoorDecorations(
                        isLeft = true,
                        goldColor = velloraColors.goldAccent,
                        borderColor = velloraColors.border
                    )
                }

                // Right Door Panel (Slides to Right)
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(0.505f)
                        .align(Alignment.CenterEnd)
                        .offset {
                            val strokeOffset = 1200 * doorProgress
                            IntOffset(strokeOffset.roundToInt(), 0)
                        }
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(
                                    velloraColors.background,
                                    velloraColors.surface,
                                    velloraColors.surfaceVariant
                                )
                            )
                        )
                        .border(
                            width = 2.dp,
                            color = velloraColors.goldAccent
                        )
                ) {
                    DoorDecorations(
                        isLeft = false,
                        goldColor = velloraColors.goldAccent,
                        borderColor = velloraColors.border
                    )
                }

                // Center Typography & "Open the World" Button
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .alpha(contentAlpha)
                        .padding(horizontal = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Emblem Icon
                    Surface(
                        modifier = Modifier
                            .size(90.dp)
                            .shadow(16.dp, CircleShape),
                        shape = CircleShape,
                        color = velloraColors.surface,
                        border = androidx.compose.foundation.BorderStroke(3.dp, velloraColors.goldAccent)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = "Vellora Emblem",
                                tint = velloraColors.accent,
                                modifier = Modifier.size(46.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    // Title: vellora
                    Text(
                        text = "vellora",
                        fontSize = 54.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Serif,
                        color = velloraColors.textPrimary,
                        letterSpacing = 4.sp,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Subtitle: A beautiful world where stories come to life
                    Text(
                        text = "A beautiful world where stories come to life",
                        fontSize = 18.sp,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Medium,
                        color = velloraColors.textSecondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    Spacer(modifier = Modifier.height(48.dp))

                    // "Open the World" Button
                    Button(
                        onClick = onOpenClicked,
                        shape = RoundedCornerShape(32.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = velloraColors.accent,
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .height(60.dp)
                            .shadow(12.dp, RoundedCornerShape(32.dp))
                            .border(
                                width = 2.dp,
                                color = velloraColors.goldAccent,
                                shape = RoundedCornerShape(32.dp)
                            )
                            .padding(horizontal = 8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = velloraColors.goldAccent,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.padding(horizontal = 6.dp))
                            Text(
                                text = "Open the World",
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Serif,
                                letterSpacing = 1.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DoorDecorations(
    isLeft: Boolean,
    goldColor: Color,
    borderColor: Color
) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        // Inner ornate framing line
        val frameInset = 20f
        drawRect(
            color = borderColor,
            topLeft = Offset(frameInset, frameInset),
            size = androidx.compose.ui.geometry.Size(width - frameInset * 2, height - frameInset * 2),
            style = Stroke(width = 2f)
        )

        drawRect(
            color = goldColor.copy(alpha = 0.5f),
            topLeft = Offset(frameInset + 8f, frameInset + 8f),
            size = androidx.compose.ui.geometry.Size(width - frameInset * 2 - 16f, height - frameInset * 2 - 16f),
            style = Stroke(width = 1f)
        )

        // Corner Filigree Arc
        val cornerSize = 50f
        val path = Path()
        if (isLeft) {
            // Top Right filigree
            path.moveTo(width - cornerSize, frameInset)
            path.quadraticTo(width - frameInset, frameInset, width - frameInset, cornerSize)
        } else {
            // Top Left filigree
            path.moveTo(frameInset + cornerSize, frameInset)
            path.quadraticTo(frameInset, frameInset, frameInset, cornerSize)
        }
        drawPath(path = path, color = goldColor, style = Stroke(width = 3f))
    }
}
