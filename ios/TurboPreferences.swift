import React
import Foundation

@objc(TurboPreferences)
class TurboPreferences: NSObject {

  var defaults = UserDefaults.standard
  var suiteName: String?

  @objc
  func setName(_ name: String) {
    suiteName = name
    if let groupDefaults = UserDefaults(suiteName: name) {
      defaults = groupDefaults
    } else {
      print("Error setting name")
    }
  }
  
  @objc
  func get(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let value = defaults.string(forKey: key) ?? ""
    resolve(value)
  }

  @objc
  func getAll(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    var out: [String: String?] = [:]
    let keys = defaults.dictionaryRepresentation().keys
    for k in keys { out[k] = defaults.string(forKey: k) }
    resolve(out)
  }

  @objc
  func getMultiple(_ keys: NSArray, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    var out: [String: String?] = [:]
    for key in keys { out[key as! String] = defaults.string(forKey: key as! String) }
    resolve(out as [String : String?])
  }

  @objc
  func set(_ key: String, value: String) {
    if value != "" {
      defaults.set(value, forKey: key)
    }
  }
  
  @objc
  func setMultiple(_ values: NSArray) {
    for item in values {
      if let dict = item as? NSDictionary,
         let key = dict["key"] as? String,
         let value = dict["value"] as? String {
        if value != "" {
          defaults.set(value, forKey: key)
        }
      }
    }
  }

  @objc
  func contains(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let value = defaults.string(forKey: key) ?? ""
    resolve(value != "")
  }

  @objc
  func clear(_ key: String) {
    defaults.removeObject(forKey: key)
  }

  @objc
  func clearAll() {
    let allKeys = defaults.dictionaryRepresentation().keys
    for key in allKeys {
        defaults.removeObject(forKey: key)
    }
  }

  @objc
  func clearMultiple(_ keys: NSArray) {
    for key in keys {
      defaults.removeObject(forKey: key as! String)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
}
