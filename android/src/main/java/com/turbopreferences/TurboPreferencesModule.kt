package com.turbopreferences

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
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

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  override fun setName(name: String) {
    prefs_name = name
  }

  override fun set(key: String, value: String) {
    try {
      val prefs = getPrefs() // Get current preferences with current name
      val editor = prefs.edit()
      editor.putString(key, value)
      editor.apply()
      // Log for debugging
      android.util.Log.d("TurboPreferences", "Set key: $key = $value in preferences: $prefs_name")
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error setting key $key: ${e.message}")
    }
  }

  override fun get(key: String, promise: Promise) {
    try {
      val prefs = getPrefs() // Get current preferences with current name
      val value = prefs.getString(key, null) 
      // Log for debugging
      android.util.Log.d("TurboPreferences", "Get key: $key = $value from preferences: $prefs_name")
      promise.resolve(value)
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error getting key $key: ${e.message}")
      promise.reject("E_GET_FAILED", e.message, e)
    }
  }

  override fun clear(key: String) {
     try {
      val prefs = getPrefs() // Get current preferences with current name
      prefs.edit().remove(key).apply()
      // Log for debugging
      android.util.Log.d("TurboPreferences", "Cleared key: $key from preferences: $prefs_name")
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing key $key: ${e.message}")
    }
  }

  override fun clearAll() {
     try {
      val prefs = getPrefs() // Get current preferences with current name
      prefs.edit().clear().apply()
      // Log for debugging
      android.util.Log.d("TurboPreferences", "Cleared all preferences: $prefs_name")
    } catch (e: Exception) {
      android.util.Log.e("TurboPreferences", "Error clearing all preferences: ${e.message}")
    }
  }

  companion object {
    const val NAME = "TurboPreferences"
  }
}
