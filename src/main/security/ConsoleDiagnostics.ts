import type { PermissionName, PolicyDiagnosticsSink } from "./SecurityPolicy";

/**
 * Development-mode diagnostics sink: logs every navigation/permission
 * decision to the console so policy behavior is visible while
 * testing, per brief section 20 ("diagnostics as a first-class
 * citizen"). Swap for a structured/production sink before shipping —
 * this one is intentionally noisy.
 */
export class ConsoleDiagnostics implements PolicyDiagnosticsSink {
  recordNavigationAllowed(url: string): void {
    console.log(`[security] allowed navigation -> ${url}`);
  }

  recordNavigationBlocked(url: string, reason: string): void {
    console.warn(`[security] BLOCKED navigation -> ${url} (${reason})`);
  }

  recordPermissionDecision(name: PermissionName, granted: boolean): void {
    console.log(`[security] permission "${name}": ${granted ? "granted" : "denied"}`);
  }
}