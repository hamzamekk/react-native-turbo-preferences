import Foundation
#if canImport(WidgetKit)
import WidgetKit
#endif

/// Obj-C-visible shim around WidgetCenter (a Swift-only API), looked up
/// from TurboPreferences.mm via NSClassFromString.
@objc(TurboPreferencesWidgets)
public class TurboPreferencesWidgets: NSObject {

  @objc(reloadAllTimelines)
  public static func reloadAllTimelines() {
    #if canImport(WidgetKit)
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
    #endif
  }

  @objc(reloadTimelinesOfKind:)
  public static func reloadTimelines(ofKind kind: String) {
    #if canImport(WidgetKit)
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadTimelines(ofKind: kind)
    }
    #endif
  }
}
