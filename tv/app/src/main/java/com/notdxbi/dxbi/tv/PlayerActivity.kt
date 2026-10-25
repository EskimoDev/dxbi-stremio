package com.notdxbi.dxbi.tv

import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.annotation.OptIn
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.Tracks
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.okhttp.OkHttpDataSource
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.ui.PlayerView
import okhttp3.OkHttpClient
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * The native player: plays the stream Stremio picked (MKV, HEVC, HDR and surround sound included,
 * as far as the TV's hardware can), with the addons' subtitles. Reports its position back so the
 * watch progress is kept.
 */
@OptIn(UnstableApi::class)
class PlayerActivity : AppCompatActivity() {

    private lateinit var playerView: PlayerView
    private lateinit var titleBar: View
    private lateinit var seekFlash: TextView
    private var player: ExoPlayer? = null
    private val handler = Handler(Looper.getMainLooper())
    private var closed = false
    private var lastError: String? = null
    private var lastText: List<String?> = emptyList()

    private val reportProgress = object : Runnable {
        override fun run() {
            report()
            handler.postDelayed(this, PROGRESS_INTERVAL_MS)
        }
    }
    private val hideFlash = Runnable { seekFlash.visibility = View.GONE }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        setContentView(R.layout.activity_player)
        playerView = findViewById(R.id.player_view)
        titleBar = findViewById(R.id.title_bar)
        seekFlash = findViewById(R.id.seek_flash)

        val stream = JSONObject(intent.getStringExtra(EXTRA_STREAM) ?: "{}")
        findViewById<TextView>(R.id.title).text = stream.optString("title")
        findViewById<TextView>(R.id.subtitle).apply {
            text = stream.optString("subtitle")
            visibility = if (text.isNullOrEmpty()) View.GONE else View.VISIBLE
        }

        val url = stream.optString("url")
        if (url.isEmpty()) {
            finishWith(error = "no stream address")
            return
        }

        // Addons can ask for headers on their links (Stremio's proxyHeaders)
        val headers = mutableMapOf<String, String>()
        stream.optJSONObject("headers")?.let { h -> h.keys().forEach { k -> headers[k] = h.optString(k) } }
        val http = OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .followRedirects(true)
            .build()
        val dataSource = OkHttpDataSource.Factory(http)
            .setUserAgent("dxbi-tv/${BuildConfigVersion.name(this)}")
            .setDefaultRequestProperties(headers)

        // The TV's own decoders first, falling back to software ones when a format isn't supported
        val renderers = DefaultRenderersFactory(this)
            .setEnableDecoderFallback(true)
            .setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_ON)

        val exo = ExoPlayer.Builder(this, renderers)
            .setMediaSourceFactory(DefaultMediaSourceFactory(dataSource))
            .setAudioAttributes(AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MOVIE).build(), true)
            .setHandleAudioBecomingNoisy(true)
            .setSeekBackIncrementMs(SEEK_STEP_MS)
            .setSeekForwardIncrementMs(SEEK_STEP_MS)
            .build()
        player = exo
        playerView.player = exo
        playerView.setControllerVisibilityListener(PlayerView.ControllerVisibilityListener { visibility ->
            titleBar.visibility = visibility
            // The remote starts on play/pause, and the arrows move between the controls from there
            if (visibility == View.VISIBLE) playerView.findViewById<View>(androidx.media3.ui.R.id.exo_play_pause)?.requestFocus()
        })

        // Subtitles start off, like Netflix (and dx.bi's default): pick one from the subtitles button
        exo.trackSelectionParameters = exo.trackSelectionParameters.buildUpon()
            .setTrackTypeDisabled(C.TRACK_TYPE_TEXT, false)
            .setPreferredTextLanguage(null)
            .setSelectUndeterminedTextLanguage(false)
            .build()

        val subtitles = mutableListOf<MediaItem.SubtitleConfiguration>()
        stream.optJSONArray("subtitles")?.let { list ->
            for (i in 0 until list.length()) {
                val s = list.optJSONObject(i) ?: continue
                val subUrl = s.optString("url").takeIf { it.isNotEmpty() } ?: continue
                subtitles += MediaItem.SubtitleConfiguration.Builder(Uri.parse(subUrl))
                    .setMimeType(subtitleMime(subUrl))
                    .setLanguage(s.optString("lang").ifEmpty { null })
                    .setLabel(s.optString("label").ifEmpty { s.optString("lang") })
                    .setSelectionFlags(0)
                    .build()
            }
        }

        val item = MediaItem.Builder()
            .setUri(Uri.parse(url))
            .setSubtitleConfigurations(subtitles)
            .build()
        exo.setMediaItem(item, stream.optLong("startMs", 0L).coerceAtLeast(0L))
        exo.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_ENDED) finishWith(ended = true)
            }

            // A subtitle switched on mid-line only shows from its next line: a seek to where we are
            // brings the current one up straight away
            override fun onTracksChanged(tracks: Tracks) {
                val text = tracks.groups.filter { it.type == C.TRACK_TYPE_TEXT }.flatMap { g -> (0 until g.length).filter { g.isTrackSelected(it) }.map { i -> g.getTrackFormat(i).id } }
                if (text.isNotEmpty() && text != lastText) exo.seekTo(exo.currentPosition)
                lastText = text
            }

            override fun onPlayerError(error: PlaybackException) {
                lastError = describe(error)
                finishWith(error = lastError)
            }
        })
        exo.prepare()
        exo.playWhenReady = true
        handler.postDelayed(reportProgress, PROGRESS_INTERVAL_MS)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            // Back leaves the player straight away, like Netflix (the position is kept)
            override fun handleOnBackPressed() = finishWith()
        })
    }

    /**
     * With the controls hidden, the remote works like Netflix's: left/right skip 10 seconds, OK
     * pauses or plays. With the controls showing, the arrows move between them as usual.
     */
    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        val exo = player ?: return super.dispatchKeyEvent(event)
        if (event.action == KeyEvent.ACTION_DOWN) {
            when (event.keyCode) {
                KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, KeyEvent.KEYCODE_SPACE -> { exo.playWhenReady = !exo.playWhenReady; playerView.showController(); return true }
                KeyEvent.KEYCODE_MEDIA_PLAY -> { exo.play(); return true }
                KeyEvent.KEYCODE_MEDIA_PAUSE -> { exo.pause(); playerView.showController(); return true }
                KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> { seek(+1); return true }
                KeyEvent.KEYCODE_MEDIA_REWIND -> { seek(-1); return true }
            }
            if (!playerView.isControllerFullyVisible) {
                when (event.keyCode) {
                    KeyEvent.KEYCODE_DPAD_LEFT -> { seek(-1); return true }
                    KeyEvent.KEYCODE_DPAD_RIGHT -> { seek(+1); return true }
                    KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> {
                        exo.playWhenReady = !exo.playWhenReady
                        playerView.showController()
                        return true
                    }
                    KeyEvent.KEYCODE_DPAD_UP, KeyEvent.KEYCODE_DPAD_DOWN -> { playerView.showController(); return true }
                }
            }
        }
        return super.dispatchKeyEvent(event)
    }

    private fun seek(direction: Int) {
        val exo = player ?: return
        if (direction > 0) exo.seekForward() else exo.seekBack()
        seekFlash.text = if (direction > 0) "+10 s   ${clock(exo.currentPosition)}" else "−10 s   ${clock(exo.currentPosition)}"
        seekFlash.visibility = View.VISIBLE
        handler.removeCallbacks(hideFlash)
        handler.postDelayed(hideFlash, 900)
    }

    private fun report() {
        val exo = player ?: return
        val duration = exo.duration.takeIf { it != C.TIME_UNSET } ?: 0L
        PlaybackBus.listener?.onProgress(exo.currentPosition, duration, !exo.isPlaying)
    }

    private fun finishWith(ended: Boolean = false, error: String? = null) {
        if (closed) return
        closed = true
        handler.removeCallbacksAndMessages(null)
        val exo = player
        val duration = exo?.duration?.takeIf { it != C.TIME_UNSET } ?: 0L
        val position = if (ended) duration else exo?.currentPosition ?: 0L
        PlaybackBus.listener?.onClosed(position, duration, ended, error)
        finish()
    }

    override fun onPause() {
        super.onPause()
        // Leaving the app (Home button) pauses, and the progress so far is kept
        player?.pause()
        report()
    }

    override fun onDestroy() {
        if (!closed) finishWith()
        handler.removeCallbacksAndMessages(null)
        player?.release()
        player = null
        super.onDestroy()
    }

    private fun subtitleMime(url: String): String {
        val path = Uri.parse(url).lastPathSegment?.lowercase() ?: ""
        return when {
            path.endsWith(".vtt") -> MimeTypes.TEXT_VTT
            path.endsWith(".ass") || path.endsWith(".ssa") -> MimeTypes.TEXT_SSA
            path.endsWith(".ttml") || path.endsWith(".dfxp") -> MimeTypes.APPLICATION_TTML
            else -> MimeTypes.APPLICATION_SUBRIP
        }
    }

    private fun describe(error: PlaybackException): String = when (error.errorCode) {
        PlaybackException.ERROR_CODE_IO_BAD_HTTP_STATUS -> "the server refused it"
        PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_FAILED,
        PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_TIMEOUT -> "the connection failed"
        PlaybackException.ERROR_CODE_DECODER_INIT_FAILED,
        PlaybackException.ERROR_CODE_DECODING_FORMAT_UNSUPPORTED,
        PlaybackException.ERROR_CODE_DECODING_FORMAT_EXCEEDS_CAPABILITIES -> "this TV can't decode its video or audio format"
        PlaybackException.ERROR_CODE_PARSING_CONTAINER_UNSUPPORTED -> "its file format isn't supported"
        else -> error.errorCodeName.removePrefix("ERROR_CODE_").lowercase().replace('_', ' ')
    }

    private fun clock(ms: Long): String {
        val s = ms / 1000
        return if (s >= 3600) "%d:%02d:%02d".format(s / 3600, s / 60 % 60, s % 60) else "%d:%02d".format(s / 60, s % 60)
    }

    companion object {
        const val EXTRA_STREAM = "stream"
        private const val PROGRESS_INTERVAL_MS = 5000L
        private const val SEEK_STEP_MS = 10_000L
    }
}
