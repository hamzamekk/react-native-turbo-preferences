package com.turbopreferences

import android.content.Context
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

  // Example method
  // See https://reactnative.dev/docs/native-modules-android

  private var prefs_name = "default"

  private fun getPrefs(): SharedPreferences {
    return context.getSharedPreferences(prefs_name, Context.MODE_PRIVATE)
  }

  override fun setName(name: String) {
    prefs_name = name
  }

  override fun set(key: String, value: String) {
    try {
      if (key != "") {
      val prefs = getPrefs() // Get current preferences with current name
      val editor = prefs.edit()
      editor.putString(key, value)
      editor.apply()
      }
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting key $key: ${e.message}")
    }
  }

  override fun setMultiple(values: ReadableArray) {
    try {
      val prefs = getPrefs() // Get current preferences with current name
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
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting multiple keys: ${e.message}")
    }
  }

  override fun get(key: String, promise: Promise) {
    try {
      val prefs = getPrefs() // Get current preferences with current name
      val value = prefs.getString(key, null) 
      // Log for debugging
      promise.resolve(value)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting key $key: ${e.message}")
      promise.reject("E_GET_FAILED", e.message, e)
    }
  }

  override fun getAll(promise: Promise) {
     try {
      val prefs = getPrefs() // Get current preferences with current name
      val allPrefs = prefs.all
      
      // Create a WritableMap for proper TurboModule compatibility
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

  override fun clear(key: String) {
     try {
      val prefs = getPrefs() // Get current preferences with current name
      prefs.edit().remove(key).apply()
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing key $key: ${e.message}")
    }
  }

  override fun clearAll() {
     try {
      val prefs = getPrefs() // Get current preferences with current name
      prefs.edit().clear().apply()
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing all preferences: ${e.message}")
    }
  }

  override fun contains(key: String, promise: Promise) {
    try {
      val prefs = getPrefs() // Get current preferences with current name
      val containsKey = prefs.contains(key)
      
      promise.resolve(containsKey)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error checking if key contains: ${e.message}")
    }
  }

  companion object {
    const val NAME = "TurboPreferences"
  }
}
