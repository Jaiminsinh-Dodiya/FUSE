import type { PermissionName, PolicyDiagnosticsSink } from "../security/SecurityPolicy";
import type { CapabilityDiagnosticsSink } from "../capabilities/CapabilityManager";

/**
 * Replaces ConsoleDiagnostics: still logs every decision to console
 * (unchanged dev-mode behavior), but also keeps running counts so a
 * real diagnostics panel has actual numbers instead of console noise
 * nobody's reading. See brief section 37.
 */
export class DiagnosticsCollector implements PolicyDiagnosticsSink, CapabilityDiagnosticsSink {
  private navigationAllowed = 0;
  private navigationBlocked = 0;
  private permissionsGranted = 0;
  private permissionsDenied = 0;
  private downloadsStarted = 0;
  private downloadsCompleted = 0;

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

  recordDownloadStarted(appId: string, filename: string): void {
    this.downloadsStarted++;
    console.log(`[capabilities] download started for "${appId}": ${filename}`);
  }

  recordDownloadCompleted(appId: string, filename: string, success: boolean): void {
    if (success) this.downloadsCompleted++;
    console.log(`[capabilities] download completed for "${appId}": ${filename} (success: ${success})`);
  }

  getCounts() {
    return {
      navigationAllowed: this.navigationAllowed,
      navigationBlocked: this.navigationBlocked,
      permissionsGranted: this.permissionsGranted,
      permissionsDenied: this.permissionsDenied,
      downloadsStarted: this.downloadsStarted,
      downloadsCompleted: this.downloadsCompleted,
    };
  }
}