package com.turbopreferences

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.module.annotations.ReactModule
import android.content.SharedPreferences

@ReactModule(name = TurboPreferencesModule.NAME)
class TurboPreferencesModule(reactContext: ReactApplicationContext) :
  NativeTurboPreferencesSpec(reactContext) {

  // Store reactContext as a class property so it can be accessed in methods
  private val context: ReactApplicationContext = reactContext

  override fun getName(): String {
    return NAME
  }

  private val DEFAULT_FILE = "default"

  // One change listener per touched store, held strongly — the system
  // only keeps weak references to SharedPreferences listeners
  private val watchedStores =
    mutableMapOf<String, Pair<SharedPreferences, SharedPreferences.OnSharedPreferenceChangeListener>>()

  private fun fileFor(name: String?): String {
    return if (name.isNullOrEmpty()) DEFAULT_FILE else name
  }

  private fun getPrefs(name: String?): SharedPreferences {
    val file = fileFor(name)
    val prefs = context.getSharedPreferences(file, Context.MODE_PRIVATE)
    watchStore(file, prefs)
    return prefs
  }

  @Synchronized
  private fun watchStore(file: String, prefs: SharedPreferences) {
    if (watchedStores.containsKey(file)) return
    val listener =
      SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
        val event = Arguments.createMap()
        if (key != null) {
          event.putString("key", key)
        } else {
          // key is null when the store was cleared as a whole (API 30+)
          event.putNull("key")
        }
        if (file == DEFAULT_FILE) {
          event.putNull("store")
        } else {
          event.putString("store", file)
        }
        emitOnPreferenceChange(event)
      }
    prefs.registerOnSharedPreferenceChangeListener(listener)
    watchedStores[file] = Pair(prefs, listener)
  }

  @Synchronized
  override fun invalidate() {
    for ((prefs, listener) in watchedStores.values) {
      prefs.unregisterOnSharedPreferenceChangeListener(listener)
    }
    watchedStores.clear()
    super.invalidate()
  }

  // ----- Single key ops -----

  override fun get(name: String?, key: String, promise: Promise) {
    try {
      val value = getPrefs(name).getString(key, null)
      promise.resolve(value)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting key $key: ${e.message}")
      promise.reject("E_GET_FAILED", e.message, e)
    }
  }

  override fun set(name: String?, key: String, value: String, promise: Promise) {
    try {
      if (key != "") {
        getPrefs(name).edit().putString(key, value).apply()
        promise.resolve(null)
      } else {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
      }
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting key $key: ${e.message}")
      promise.reject("E_SET_FAILED", e.message, e)
    }
  }

  override fun clear(name: String?, key: String, promise: Promise) {
    try {
      getPrefs(name).edit().remove(key).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing key $key: ${e.message}")
      promise.reject("E_CLEAR_FAILED", e.message, e)
    }
  }

  override fun contains(name: String?, key: String, promise: Promise) {
    try {
      promise.resolve(getPrefs(name).contains(key))
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error checking if key contains: ${e.message}")
      promise.reject("E_CONTAINS_FAILED", e.message, e)
    }
  }

  // ----- Typed ops -----

  override fun setBoolean(name: String?, key: String, value: Boolean, promise: Promise) {
    try {
      if (key == "") {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
        return
      }
      getPrefs(name).edit().putBoolean(key, value).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting boolean $key: ${e.message}")
      promise.reject("E_SET_BOOLEAN_FAILED", e.message, e)
    }
  }

  override fun getBoolean(name: String?, key: String, promise: Promise) {
    try {
      val value = getPrefs(name).all[key]
      promise.resolve(value as? Boolean)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting boolean $key: ${e.message}")
      promise.reject("E_GET_BOOLEAN_FAILED", e.message, e)
    }
  }

  override fun setInt(name: String?, key: String, value: Double, promise: Promise) {
    try {
      if (key == "") {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
        return
      }
      getPrefs(name).edit().putInt(key, value.toInt()).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting int $key: ${e.message}")
      promise.reject("E_SET_INT_FAILED", e.message, e)
    }
  }

  override fun getInt(name: String?, key: String, promise: Promise) {
    try {
      val value = getPrefs(name).all[key]
      if (value is Number) {
        promise.resolve(value.toInt())
      } else {
        promise.resolve(null)
      }
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting int $key: ${e.message}")
      promise.reject("E_GET_INT_FAILED", e.message, e)
    }
  }

  override fun setDouble(name: String?, key: String, value: Double, promise: Promise) {
    try {
      if (key == "") {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
        return
      }
      // SharedPreferences has no putDouble — stored as Float
      getPrefs(name).edit().putFloat(key, value.toFloat()).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting double $key: ${e.message}")
      promise.reject("E_SET_DOUBLE_FAILED", e.message, e)
    }
  }

  override fun getDouble(name: String?, key: String, promise: Promise) {
    try {
      val value = getPrefs(name).all[key]
      if (value is Number) {
        promise.resolve(value.toDouble())
      } else {
        promise.resolve(null)
      }
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting double $key: ${e.message}")
      promise.reject("E_GET_DOUBLE_FAILED", e.message, e)
    }
  }

  // ----- Batch ops -----

  override fun setMultiple(name: String?, values: ReadableArray, promise: Promise) {
    try {
      val editor = getPrefs(name).edit()

      for (i in 0 until values.size()) {
        val item = values.getMap(i)
        if (item != null) {
          val key = item.getString("key") ?: ""
          val value = item.getString("value") ?: ""

          if (key != "") {
            editor.putString(key, value)
          }
        }
      }
      editor.apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting multiple keys: ${e.message}")
      promise.reject("E_SET_MULTIPLE_FAILED", e.message, e)
    }
  }

  override fun getMultiple(name: String?, keys: ReadableArray, promise: Promise) {
    try {
      val prefs = getPrefs(name)
      val result: WritableMap = Arguments.createMap()

      for (i in 0 until keys.size()) {
        val key = keys.getString(i)
        if (key != null) {
          val value = prefs.getString(key, null)
          result.putString(key, value)
        }
      }

      promise.resolve(result)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting multiple keys: ${e.message}")
      promise.reject("E_GET_MULTIPLE_FAILED", e.message, e)
    }
  }

  override fun clearMultiple(name: String?, keys: ReadableArray, promise: Promise) {
    try {
      val editor = getPrefs(name).edit()

      for (i in 0 until keys.size()) {
        val key = keys.getString(i)
        if (key != null) {
          editor.remove(key)
        }
      }
      editor.apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing multiple keys: ${e.message}")
      promise.reject("E_CLEAR_MULTIPLE_FAILED", e.message, e)
    }
  }

  // ----- Whole-store ops -----

  override fun getAll(name: String?, promise: Promise) {
    try {
      val allPrefs = getPrefs(name).all

      val writableMap: WritableMap = Arguments.createMap()
      for ((key, value) in allPrefs) {
        writableMap.putString(key.toString(), value.toString())
      }

      promise.resolve(writableMap)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting all preferences: ${e.message}")
      promise.reject("E_GET_ALL_FAILED", e.message, e)
    }
  }

  override fun clearAll(name: String?, promise: Promise) {
    try {
      getPrefs(name).edit().clear().apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing all preferences: ${e.message}")
      promise.reject("E_CLEAR_ALL_FAILED", e.message, e)
    }
  }

  // ----- Widgets -----

  override fun reloadWidgets(kind: String?, promise: Promise) {
    try {
      // `kind` is a WidgetKit (iOS) concept; on Android all of the app's
      // widget providers are refreshed.
      val manager = AppWidgetManager.getInstance(context)
      val providers = manager.installedProviders
        .filter { it.provider.packageName == context.packageName }

      for (info in providers) {
        val ids = manager.getAppWidgetIds(info.provider)
        if (ids.isEmpty()) continue

        val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).apply {
          component = info.provider
          putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        }
        context.sendBroadcast(intent)
      }
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error reloading widgets: ${e.message}")
      promise.reject("E_RELOAD_WIDGETS_FAILED", e.message, e)
    }
  }

  companion object {
    const val NAME = "TurboPreferences"
  }
}
