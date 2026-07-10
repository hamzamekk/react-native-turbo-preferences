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

  private var prefs_name = "default"

  // The system holds listeners weakly — keep a strong reference here
  private val changeListener =
    SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
      val event = Arguments.createMap()
      if (key != null) {
        event.putString("key", key)
      } else {
        // key is null when the store was cleared as a whole (API 30+)
        event.putNull("key")
      }
      emitOnPreferenceChange(event)
    }
  private var listenedPrefs: SharedPreferences? = null

  private fun getPrefs(): SharedPreferences {
    return context.getSharedPreferences(prefs_name, Context.MODE_PRIVATE)
  }

  private fun attachChangeListener() {
    val prefs = getPrefs()
    if (prefs === listenedPrefs) return
    listenedPrefs?.unregisterOnSharedPreferenceChangeListener(changeListener)
    prefs.registerOnSharedPreferenceChangeListener(changeListener)
    listenedPrefs = prefs
  }

  override fun initialize() {
    super.initialize()
    attachChangeListener()
  }

  override fun invalidate() {
    listenedPrefs?.unregisterOnSharedPreferenceChangeListener(changeListener)
    listenedPrefs = null
    super.invalidate()
  }

  override fun setName(name: String?, promise: Promise) {
    try {
      prefs_name = if (name.isNullOrEmpty()) "default" else name
      attachChangeListener()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting name: ${e.message}")
      promise.reject("E_SET_NAME_FAILED", e.message, e)
    }
  }

  override fun set(key: String, value: String, promise: Promise) {
    try {
      if (key != "") {
        val prefs = getPrefs()
        val editor = prefs.edit()
        editor.putString(key, value)
        editor.apply()
        promise.resolve(null)
      } else {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
      }
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting key $key: ${e.message}")
      promise.reject("E_SET_FAILED", e.message, e)
    }
  }

  override fun setBoolean(key: String, value: Boolean, promise: Promise) {
    try {
      if (key == "") {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
        return
      }
      getPrefs().edit().putBoolean(key, value).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting boolean $key: ${e.message}")
      promise.reject("E_SET_BOOLEAN_FAILED", e.message, e)
    }
  }

  override fun getBoolean(key: String, promise: Promise) {
    try {
      val value = getPrefs().all[key]
      promise.resolve(value as? Boolean)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting boolean $key: ${e.message}")
      promise.reject("E_GET_BOOLEAN_FAILED", e.message, e)
    }
  }

  override fun setInt(key: String, value: Double, promise: Promise) {
    try {
      if (key == "") {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
        return
      }
      getPrefs().edit().putInt(key, value.toInt()).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting int $key: ${e.message}")
      promise.reject("E_SET_INT_FAILED", e.message, e)
    }
  }

  override fun getInt(key: String, promise: Promise) {
    try {
      val value = getPrefs().all[key]
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

  override fun setDouble(key: String, value: Double, promise: Promise) {
    try {
      if (key == "") {
        promise.reject("E_INVALID_KEY", "Key cannot be empty")
        return
      }
      // SharedPreferences has no putDouble — stored as Float
      getPrefs().edit().putFloat(key, value.toFloat()).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting double $key: ${e.message}")
      promise.reject("E_SET_DOUBLE_FAILED", e.message, e)
    }
  }

  override fun getDouble(key: String, promise: Promise) {
    try {
      val value = getPrefs().all[key]
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

  override fun setMultiple(values: ReadableArray, promise: Promise) {
    try {
      val prefs = getPrefs()
      val editor = prefs.edit()

      for (i in 0 until values.size()) {
        val item = values.getMap(i)
        if (item != null) {
          val key = item.getString("key") ?: ""
          val value = item.getString("value") ?: ""

          if(key != ""){
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

  override fun getMultiple(keys: ReadableArray, promise: Promise) {
    try {
      val prefs = getPrefs()
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

  override fun clearMultiple(keys: ReadableArray, promise: Promise) {
    try {
      val prefs = getPrefs()
      val editor = prefs.edit()
      
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

  override fun get(key: String, promise: Promise) {
    try {
      val prefs = getPrefs()
      val value = prefs.getString(key, null) 
      promise.resolve(value)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting key $key: ${e.message}")
      promise.reject("E_GET_FAILED", e.message, e)
    }
  }

  override fun getAll(promise: Promise) {
     try {
      val prefs = getPrefs()
      val allPrefs = prefs.all
      
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

  override fun clear(key: String, promise: Promise) {
     try {
      val prefs = getPrefs()
      prefs.edit().remove(key).apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing key $key: ${e.message}")
      promise.reject("E_CLEAR_FAILED", e.message, e)
    }
  }

  override fun clearAll(promise: Promise) {
     try {
      val prefs = getPrefs()
      prefs.edit().clear().apply()
      promise.resolve(null)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing all preferences: ${e.message}")
      promise.reject("E_CLEAR_ALL_FAILED", e.message, e)
    }
  }

  override fun contains(key: String, promise: Promise) {
    try {
      val prefs = getPrefs()
      val containsKey = prefs.contains(key)
      
      promise.resolve(containsKey)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error checking if key contains: ${e.message}")
      promise.reject("E_CONTAINS_FAILED", e.message, e)
    }
  }

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
