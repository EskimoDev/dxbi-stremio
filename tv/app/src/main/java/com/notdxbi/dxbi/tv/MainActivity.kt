package com.notdxbi.dxbi.tv

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

/**
 * dx.bi TV: Stremio's web app with dx.bi built in, steered with the remote. Streams play in
 * [PlayerActivity]; this screen stays alive underneath so Stremio keeps the watch progress.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private var injectedAtStart = false
    private var lastBack = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        hideSystemBars()

        if (!webViewIsRecentEnough()) return

        // Debug builds can be inspected from a computer (chrome://inspect)
        if (applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE != 0) WebView.setWebContentsDebuggingEnabled(true)
        web = WebView(this)
        setContentView(web)
        web.setBackgroundColor(getColor(R.color.background))
        web.isFocusable = true
        web.isFocusableInTouchMode = true

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            builtInZoomControls = false
            // A desktop browser's identity (Stremio's web app is made for one), plus dx.bi TV's mark
            userAgentString = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) " +
                "Chrome/${chromeVersion()} Safari/537.36 dxbi-tv/${BuildConfigVersion.name(this@MainActivity)}"
        }
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true)

        web.addJavascriptInterface(Bridge(this), "DxbiTV")
        val startScript = assets.open("dxbi-tv.js").bufferedReader().use { it.readText() }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(web, startScript, setOf(STREMIO_ORIGIN))
            injectedAtStart = true
        }

        web.webChromeClient = WebChromeClient()
        web.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView, url: String?, favicon: android.graphics.Bitmap?) {
                // Older WebViews can't run a script before the page: run it as early as possible instead
                if (!injectedAtStart && url != null && url.startsWith(STREMIO_ORIGIN)) view.evaluateJavascript(startScript, null)
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url
                if (url.host == "web.stremio.com") return false
                if (url.scheme == "stremio") {
                    openStremioLink(url)
                    return true
                }
                // Everything else leaves the app (sign-in pages, links in descriptions…) if something can open it
                openExternal(url.toString())
                return true
            }
        }

        PlaybackBus.listener = object : PlaybackBus.Listener {
            override fun onProgress(positionMs: Long, durationMs: Long, paused: Boolean) {
                js("window.__dxbiTv && window.__dxbiTv.onProgress($positionMs, $durationMs, $paused)")
            }

            override fun onClosed(positionMs: Long, durationMs: Long, ended: Boolean, error: String?) {
                val err = if (error == null) "null" else org.json.JSONObject.quote(error)
                js("window.__dxbiTv && window.__dxbiTv.onClosed($positionMs, $durationMs, $ended, $err)")
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() = goBack()
        })

        val link = intent?.data
        if (link?.scheme == "stremio") openStremioLink(link) else web.loadUrl(STREMIO_URL)
        web.requestFocus()

        Updates.checkPlugin(this)
        Updates.checkApp(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        intent.data?.takeIf { it.scheme == "stremio" }?.let { openStremioLink(it) }
    }

    override fun onResume() {
        super.onResume()
        hideSystemBars()
        if (::web.isInitialized) web.requestFocus()
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        // Play/pause keys on the Home screen do nothing useful in the page: keep them from scrolling it
        if (event.keyCode == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE) return true
        return super.dispatchKeyEvent(event)
    }

    /** The page decides first (closing a card or menu, going back a screen); on Home, Back twice leaves. */
    private fun goBack() {
        web.evaluateJavascript("(window.__dxbiTv && window.__dxbiTv.back()) ? 1 : 0") { handled ->
            if (handled == "1") return@evaluateJavascript
            val now = System.currentTimeMillis()
            if (now - lastBack < 2500) finish()
            else {
                lastBack = now
                Toast.makeText(this, "Press Back again to leave dx.bi", Toast.LENGTH_SHORT).show()
            }
        }
    }

    fun play(json: String) {
        startActivity(Intent(this, PlayerActivity::class.java).putExtra(PlayerActivity.EXTRA_STREAM, json))
    }

    fun openExternal(url: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        } catch (_: Exception) {
            Toast.makeText(this, "No app on this TV can open that link", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openStremioLink(uri: Uri) {
        // stremio://host/path/manifest.json → install the addon through Stremio's Addons screen
        val manifest = uri.toString().replaceFirst("stremio://", "https://")
        web.loadUrl("$STREMIO_URL#/addons?addon=" + Uri.encode(manifest))
    }

    private fun js(code: String) {
        if (::web.isInitialized) web.post { web.evaluateJavascript(code, null) }
    }

    private fun hideSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    private fun chromeVersion(): String =
        WebViewCompat.getCurrentWebViewPackage(this)?.versionName?.substringBefore(" ") ?: "120.0.0.0"

    /** Stremio's web app needs a modern WebView; old TVs that never updated it get told how. */
    private fun webViewIsRecentEnough(): Boolean {
        val major = WebViewCompat.getCurrentWebViewPackage(this)?.versionName?.substringBefore(".")?.toIntOrNull() ?: 0
        if (major >= MIN_WEBVIEW) return true
        setContentView(View(this))
        AlertDialog.Builder(this)
            .setTitle("Update Android System WebView")
            .setMessage("dx.bi needs Android System WebView $MIN_WEBVIEW or newer (this TV has ${if (major > 0) major else "none"}). Update it from the Play Store (search \"Android System WebView\"), then open dx.bi again.")
            .setPositiveButton("Open Play Store") { _, _ ->
                openExternal("market://details?id=com.google.android.webview")
                finish()
            }
            .setNegativeButton("Close") { _, _ -> finish() }
            .setCancelable(false)
            .show()
        return false
    }

    override fun onDestroy() {
        PlaybackBus.listener = null
        if (::web.isInitialized) web.destroy()
        super.onDestroy()
    }

    companion object {
        const val STREMIO_ORIGIN = "https://web.stremio.com"
        const val STREMIO_URL = "https://web.stremio.com/"
        const val MIN_WEBVIEW = 100
    }
}
