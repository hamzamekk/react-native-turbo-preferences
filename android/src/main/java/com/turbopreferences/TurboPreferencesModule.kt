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

  private var prefs_name = "default"

  private fun getPrefs(): SharedPreferences {
    return context.getSharedPreferences(prefs_name, Context.MODE_PRIVATE)
  }

  override fun setName(name: String, promise: Promise) {
    try {
      prefs_name = name
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

  companion object {
    const val NAME = "TurboPreferences"
  }
}
