package com.vellora.app.audio

import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Random

object PageTurnAudioPlayer {
    private var isSoundEnabled: Boolean = true

    fun setSoundEnabled(enabled: Boolean) {
        isSoundEnabled = enabled
    }

    fun isSoundEnabled(): Boolean = isSoundEnabled

    suspend fun playPageTurnSound() {
        if (!isSoundEnabled) return
        withContext(Dispatchers.Default) {
            try {
                val sampleRate = 22050
                val durationMs = 180
                val numSamples = (sampleRate * durationMs) / 1000
                val sample = ShortArray(numSamples)
                val random = Random()

                // Generate filtered white noise simulating paper rustle
                var lastSample = 0.0
                for (i in 0 until numSamples) {
                    val progress = i.toDouble() / numSamples
                    // Envelope shape: fast attack, quick decay with friction noise
                    val envelope = Math.sin(progress * Math.PI) * (1.0 - progress * 0.4)
                    val rawNoise = (random.nextDouble() * 2.0 - 1.0)
                    
                    // Low pass filter for soft paper rustle sound
                    val filterCoeff = 0.25
                    lastSample = lastSample + filterCoeff * (rawNoise - lastSample)
                    val value = (lastSample * envelope * 0.35 * Short.MAX_VALUE).toInt()
                    sample[i] = value.coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt()).toShort()
                }

                val audioTrack = AudioTrack(
                    AudioManager.STREAM_MUSIC,
                    sampleRate,
                    AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    numSamples * 2,
                    AudioTrack.MODE_STATIC
                )
                audioTrack.write(sample, 0, numSamples)
                audioTrack.play()
                
                // Release after playback finishes
                kotlinx.coroutines.delay(durationMs.toLong() + 50)
                audioTrack.release()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
