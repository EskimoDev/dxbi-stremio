package com.notdxbi.dxbi.tv

import android.content.Context
import android.webkit.JavascriptInterface
import android.widget.Toast
import org.json.JSONObject

/** What the page (dxbi-tv.js) can ask the app for: the plugin, its settings, and playback. */
class Bridge(private val activity: MainActivity) {

    private val prefs = activity.getSharedPreferences("plugin-settings", Context.MODE_PRIVATE)

    /** The dx.bi plugin: the one built in, or a newer one it has updated itself to */
    @JavascriptInterface
    fun pluginSource(): String = try {
        Updates.pluginSource(activity)
    } catch (_: Exception) {
        ""
    }

    /** A plugin's saved settings, as a JSON object (what Stremio Enhanced keeps in <plugin>.plugin.json) */
    @JavascriptInterface
    fun getSettings(plugin: String): String = prefs.getString(plugin, "{}") ?: "{}"

    @JavascriptInterface
    fun saveSetting(plugin: String, key: String, valueJson: String) {
        synchronized(this) {
            val all = try { JSONObject(prefs.getString(plugin, "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val value: Any? = try { JSONObject("{\"v\":$valueJson}").opt("v") } catch (_: Exception) { valueJson }
            all.put(key, value ?: JSONObject.NULL)
            prefs.edit().putString(plugin, all.toString()).apply()
        }
    }

    @JavascriptInterface
    fun play(json: String) {
        activity.runOnUiThread { activity.play(json) }
    }

    @JavascriptInterface
    fun openExternal(url: String) {
        activity.runOnUiThread { activity.openExternal(url) }
    }

    @JavascriptInterface
    fun toast(text: String) {
        activity.runOnUiThread { Toast.makeText(activity, text, Toast.LENGTH_LONG).show() }
    }

    @JavascriptInterface
    fun version(): String = BuildConfigVersion.name(activity)
}
