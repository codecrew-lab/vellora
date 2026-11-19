package com.vellora.app.pdf

import android.content.ContentValues
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.widget.Toast
import com.vellora.app.model.Book
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

object PdfExporter {

    suspend fun exportBookToPdf(context: Context, book: Book): Boolean {
        return withContext(Dispatchers.IO) {
            var pdfDocument: PdfDocument? = null
            try {
                pdfDocument = PdfDocument()

                // Standard A4 Page size in points: 595 x 842
                val pageWidth = 595
                val pageHeight = 842
                val marginHorizontal = 50f
                val marginVertical = 60f
                val printableWidth = pageWidth - (marginHorizontal * 2)

                // 1. Title Cover Page
                val coverPageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, 1).create()
                val coverPage = pdfDocument.startPage(coverPageInfo)
                drawCoverPage(coverPage.canvas, book, pageWidth, pageHeight)
                pdfDocument.finishPage(coverPage)

                // 2. Book Pages Content
                val textPaint = TextPaint().apply {
                    color = Color.rgb(44, 24, 16) // Aged manuscript dark brown
                    textSize = 14f
                    typeface = Typeface.create(Typeface.SERIF, Typeface.NORMAL)
                    isAntiAlias = true
                }

                var pageNum = 2
                for (pageIndex in book.pages.indices) {
                    val pageContent = book.pages[pageIndex]
                    val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNum).create()
                    val page = pdfDocument.startPage(pageInfo)
                    val canvas = page.canvas

                    // Draw Background & Watermark
                    drawPageBackgroundAndWatermark(canvas, pageWidth, pageHeight)

                    // Draw Header
                    drawHeader(canvas, book.title, pageWidth, marginHorizontal, marginVertical)

                    // Draw Page Text Content using StaticLayout for auto-wrapping
                    val staticLayout = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        StaticLayout.Builder.obtain(pageContent, 0, pageContent.length, textPaint, printableWidth.toInt())
                            .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                            .setLineSpacing(4f, 1.15f)
                            .setIncludePad(true)
                            .build()
                    } else {
                        @Suppress("DEPRECATION")
                        StaticLayout(pageContent, textPaint, printableWidth.toInt(), Layout.Alignment.ALIGN_NORMAL, 1.15f, 4f, true)
                    }

                    canvas.save()
                    canvas.translate(marginHorizontal, marginVertical + 40f)
                    staticLayout.draw(canvas)
                    canvas.restore()

                    // Draw Footer (Page Number)
                    drawFooter(canvas, pageIndex + 1, book.pages.size, pageWidth, pageHeight, marginHorizontal)

                    pdfDocument.finishPage(page)
                    pageNum++
                }

                // Save PDF file
                val fileName = "${book.title.replace(" ", "_")}_Vellora.pdf"
                val savedSuccessfully = savePdfFile(context, pdfDocument, fileName)

                withContext(Dispatchers.Main) {
                    if (savedSuccessfully) {
                        Toast.makeText(context, "PDF downloaded: $fileName", Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(context, "Failed to download PDF", Toast.LENGTH_SHORT).show()
                    }
                }
                savedSuccessfully

            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Error generating PDF: ${e.message}", Toast.LENGTH_SHORT).show()
                }
                false
            } finally {
                pdfDocument?.close()
            }
        }
    }

    private fun drawCoverPage(canvas: Canvas, book: Book, width: Int, height: Int) {
        // Background
        val bgPaint = Paint().apply {
            color = Color.rgb(250, 240, 230) // Parchment
            style = Paint.Style.FILL
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        // Border Frame
        val borderPaint = Paint().apply {
            color = Color.rgb(139, 0, 0) // Burgundy frame
            style = Paint.Style.STROKE
            strokeWidth = 3f
        }
        val innerMargin = 30f
        canvas.drawRect(innerMargin, innerMargin, width - innerMargin, height - innerMargin, borderPaint)

        val goldBorderPaint = Paint().apply {
            color = Color.rgb(212, 175, 55) // Gold inner border
            style = Paint.Style.STROKE
            strokeWidth = 1.5f
        }
        canvas.drawRect(innerMargin + 6f, innerMargin + 6f, width - innerMargin - 6f, height - innerMargin - 6f, goldBorderPaint)

        // Watermark on cover
        drawWatermark(canvas, width, height)

        // Title
        val titlePaint = TextPaint().apply {
            color = Color.rgb(44, 24, 16)
            textSize = 28f
            typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        canvas.drawText(book.title, width / 2f, height * 0.35f, titlePaint)

        // Category Tag
        val categoryPaint = TextPaint().apply {
            color = Color.rgb(139, 0, 0)
            textSize = 14f
            typeface = Typeface.create(Typeface.SERIF, Typeface.ITALIC)
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        canvas.drawText("Category: ${book.category.displayName}", width / 2f, height * 0.42f, categoryPaint)

        // Author
        val authorPaint = TextPaint().apply {
            color = Color.rgb(62, 39, 35)
            textSize = 18f
            typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        canvas.drawText("Written by ${book.author}", width / 2f, height * 0.52f, authorPaint)

        // Vellora Publisher Stamp
        val brandPaint = TextPaint().apply {
            color = Color.rgb(197, 160, 89)
            textSize = 16f
            typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        canvas.drawText("VELLORA EDITIONS", width / 2f, height * 0.85f, brandPaint)

        val taglinePaint = TextPaint().apply {
            color = Color.rgb(120, 100, 80)
            textSize = 11f
            typeface = Typeface.create(Typeface.SERIF, Typeface.ITALIC)
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        canvas.drawText("A beautiful world where stories come to life", width / 2f, height * 0.88f, taglinePaint)
    }

    private fun drawPageBackgroundAndWatermark(canvas: Canvas, width: Int, height: Int) {
        val bgPaint = Paint().apply {
            color = Color.rgb(253, 248, 242)
            style = Paint.Style.FILL
        }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), bgPaint)

        drawWatermark(canvas, width, height)
    }

    private fun drawWatermark(canvas: Canvas, width: Int, height: Int) {
        canvas.save()
        canvas.rotate(-30f, width / 2f, height / 2f)

        val watermarkPaint = TextPaint().apply {
            color = Color.argb(18, 120, 80, 40) // Very subtle low opacity translucent watermark
            textSize = 64f
            typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD_ITALIC)
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }

        canvas.drawText("vellora", width / 2f, height / 2f, watermarkPaint)
        canvas.drawText("stories come to life", width / 2f, height / 2f + 50f, watermarkPaint.apply { textSize = 22f })
        canvas.restore()
    }

    private fun drawHeader(canvas: Canvas, bookTitle: String, pageWidth: Int, marginH: Float, marginV: Float) {
        val headerPaint = TextPaint().apply {
            color = Color.rgb(140, 120, 100)
            textSize = 10f
            typeface = Typeface.create(Typeface.SERIF, Typeface.ITALIC)
            isAntiAlias = true
        }
        canvas.drawText(bookTitle.uppercase(), marginH, marginV + 15f, headerPaint)

        val linePaint = Paint().apply {
            color = Color.rgb(220, 205, 190)
            strokeWidth = 1f
        }
        canvas.drawLine(marginH, marginV + 25f, pageWidth - marginH, marginV + 25f, linePaint)
    }

    private fun drawFooter(canvas: Canvas, currentPage: Int, totalPages: Int, pageWidth: Int, pageHeight: Int, marginH: Float) {
        val footerY = pageHeight - 35f
        val linePaint = Paint().apply {
            color = Color.rgb(220, 205, 190)
            strokeWidth = 1f
        }
        canvas.drawLine(marginH, footerY - 15f, pageWidth - marginH, footerY - 15f, linePaint)

        val footerPaint = TextPaint().apply {
            color = Color.rgb(140, 120, 100)
            textSize = 10f
            typeface = Typeface.create(Typeface.SERIF, Typeface.NORMAL)
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
        }
        canvas.drawText("vellora edition • page $currentPage of $totalPages", pageWidth / 2f, footerY, footerPaint)
    }

    private fun savePdfFile(context: Context, pdfDocument: PdfDocument, fileName: String): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                val resolver = context.contentResolver
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { outputStream ->
                        pdfDocument.writeTo(outputStream)
                    }
                    true
                } else false
            } else {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val file = File(downloadsDir, fileName)
                FileOutputStream(file).use { outputStream ->
                    pdfDocument.writeTo(outputStream)
                }
                true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
