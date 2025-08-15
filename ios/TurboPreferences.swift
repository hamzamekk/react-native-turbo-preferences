import React
import Foundation

@objc(TurboPreferences)
class TurboPreferences: NSObject {

  var defaults = UserDefaults.standard

  @objc
  func setName(_ name: String) {
    if let groupDefaults = UserDefaults(suiteName: name) {
      defaults = groupDefaults
    } else {
      print("Error setting name")
    }
  }

  @objc
  func multiply(_ a: Double, b: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let result = a * b
    resolve(NSNumber(value: result))
  }
  
  @objc
  func get(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let value = defaults.string(forKey: key) ?? ""
    resolve(value)
  }

  @objc
  func set(_ key: String, value: String) {
    defaults.set(value, forKey: key)
  }

    
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
}
