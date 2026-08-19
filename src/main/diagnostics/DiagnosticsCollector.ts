import type { PermissionName, PolicyDiagnosticsSink } from "../security/SecurityPolicy";

/**
 * Replaces ConsoleDiagnostics: still logs every decision to console
 * (unchanged dev-mode behavior), but also keeps running counts so a
 * real diagnostics panel has actual numbers instead of console noise
 * nobody's reading. See brief section 37.
 */
export class DiagnosticsCollector implements PolicyDiagnosticsSink {
  private navigationAllowed = 0;
  private navigationBlocked = 0;
  private permissionsGranted = 0;
  private permissionsDenied = 0;

  recordNavigationAllowed(url: string): void {
    this.navigationAllowed++;
    console.log(`[security] allowed navigation -> ${url}`);
  }

  recordNavigationBlocked(url: string, reason: string): void {
    this.navigationBlocked++;
    console.warn(`[security] BLOCKED navigation -> ${url} (${reason})`);
  }

  recordPermissionDecision(name: PermissionName, granted: boolean): void {
    if (granted) this.permissionsGranted++;
    else this.permissionsDenied++;
    console.log(`[security] permission "${name}": ${granted ? "granted" : "denied"}`);
  }

  getCounts() {
    return {
      navigationAllowed: this.navigationAllowed,
      navigationBlocked: this.navigationBlocked,
      permissionsGranted: this.permissionsGranted,
      permissionsDenied: this.permissionsDenied,
    };
  }
}