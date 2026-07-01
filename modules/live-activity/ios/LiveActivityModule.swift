import ActivityKit
import ExpoModulesCore

public class LiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LiveActivityModule")

    Function("areActivitiesEnabled") { () -> Bool in
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    // The following are stubs — real ActivityKit wiring lands in Phase 3 Task 5.
    AsyncFunction("startWorkActivity") { (clockInAt: String, targetLeaveAt: String) -> String? in
      return nil
    }

    AsyncFunction("endWorkActivity") { () in
    }

    AsyncFunction("updateWorkActivity") { (targetLeaveAt: String) in
    }

    AsyncFunction("hasActiveWorkActivity") { () -> Bool in
      return false
    }
  }
}
