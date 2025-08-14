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

  // Remove the single prefs object and create it dynamically
  private fun getPrefs(): SharedPreferences {
    return context.getSharedPreferences(prefs_name, Context.MODE_PRIVATE)
  }

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  override fun setName(name: String) {
    prefs_name = name
    // Now when set/get are called, they'll use the new name
  }

  override fun set(key: String, value: String) {
    try {
      val prefs = getPrefs() // Get current preferences with current name
      val editor = prefs.edit()
      editor.putString(key, value)
      editor.apply()
    } catch (e: Exception) {
      // set doesn't return a promise, so we can't reject
      // Just log the error or handle it silently
    }
  }

  override fun get(key: String, promise: Promise) {
    try {
      val prefs = getPrefs() // Get current preferences with current name
      val value = prefs.getString(key, null) 
      promise.resolve(value)
    } catch (e: Exception) {
      promise.reject("E_GET_FAILED", e.message, e)
    }
  }

  companion object {
    const val NAME = "TurboPreferences"
  }
}
