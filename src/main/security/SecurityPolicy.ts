/**
 * Central policy decisions for remote content. Every navigation,
 * new-window request, and permission request must pass through here.
 * No caller should implement its own ad-hoc allow/deny logic.
 * See docs/architecture sections 17-19.
 */

export type PermissionName =
  | "clipboard-read"
  | "clipboard-sanitized-write"
  | "notifications"
  | "camera"
  | "microphone"
  | "geolocation"
  | "media"
  | "openExternal";

export interface AppSecurityConfig {
  /** Exact hostnames (no wildcards yet) allowed for top-level navigation. */
  readonly allowedNavigationHosts: readonly string[];
  /** Permissions explicitly granted for this application. Default: none. */
  readonly grantedPermissions: readonly PermissionName[];
}

export type NavigationDecision =
  | { allow: true }
  | { allow: false; reason: string };

export interface PolicyDiagnosticsSink {
  recordNavigationAllowed(url: string): void;
  recordNavigationBlocked(url: string, reason: string): void;
  recordPermissionDecision(name: PermissionName, granted: boolean): void;
}

export class SecurityPolicy {
  constructor(
    private readonly configs: ReadonlyMap<string, AppSecurityConfig>,
    private readonly diagnostics?: PolicyDiagnosticsSink,
  ) {}

  /**
   * Decide whether a top-level navigation inside an application's
   * WebContentsView is allowed. Conservative default: deny unless the
   * destination host is explicitly listed for that application.
   */
  evaluateNavigation(appId: string, targetUrl: string): NavigationDecision {
    const config = this.configs.get(appId);
    if (!config) {
      const reason = `no security config registered for app "${appId}"`;
      this.diagnostics?.recordNavigationBlocked(targetUrl, reason);
      return { allow: false, reason };
    }

    let host: string;
    try {
      host = new URL(targetUrl).hostname;
    } catch {
      const reason = "unparseable URL";
      this.diagnostics?.recordNavigationBlocked(targetUrl, reason);
      return { allow: false, reason };
    }

    const isAllowed = config.allowedNavigationHosts.some(
      (allowedHost) => host === allowedHost || host.endsWith(`.${allowedHost}`),
    );

    if (!isAllowed) {
      const reason = `host "${host}" not in allowlist for "${appId}"`;
      this.diagnostics?.recordNavigationBlocked(targetUrl, reason);
      return { allow: false, reason };
    }

    this.diagnostics?.recordNavigationAllowed(targetUrl);
    return { allow: true };
  }

  /**
   * New-window / window.open requests are never allowed to create an
   * Electron-managed window directly. The caller (ViewManager) is
   * expected to open allowed external destinations in the system
   * browser instead — see brief section 10, "External Links".
   */
  evaluateNewWindow(appId: string, targetUrl: string): NavigationDecision {
    // A new window is only ever redirected externally, never created
    // in-process, so this reuses the same host-allowlist question but
    // the caller must treat `allow: true` as "open externally", not
    // "create a BrowserWindow".
    return this.evaluateNavigation(appId, targetUrl);
  }

  evaluatePermission(appId: string, name: PermissionName): boolean {
    const config = this.configs.get(appId);
    const granted = config?.grantedPermissions.includes(name) ?? false;
    this.diagnostics?.recordPermissionDecision(name, granted);
    return granted;
  }
}
