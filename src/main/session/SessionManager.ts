import { session, type Session } from "electron";
import type { AppSecurityConfig, PermissionName } from "../security/SecurityPolicy";

/**
 * Owns per-application Electron session partitions. Each application
 * gets its own persistent, isolated session — cookies, localStorage,
 * and cached credentials for GitHub never leak into any other
 * application's session, and vice versa. See docs/architecture
 * section 8 ("Session Isolation").
 */
export class SessionManager {
  private readonly sessions = new Map<string, Session>();

  /**
   * Returns (creating if needed) the persistent session partition for
   * an application. Partition name is deterministic from the app id
   * so relaunching FUSE reuses the same signed-in session.
   */
  getOrCreate(appId: string, securityConfig: AppSecurityConfig): Session {
    const existing = this.sessions.get(appId);
    if (existing) {
      return existing;
    }

    const partition = `persist:fuse-${appId}`;
    const appSession = session.fromPartition(partition);

    // GitHub (and many sites behind bot-detection like Cloudflare)
    // flag Electron's default UA string, which literally contains
    // "Electron/x.x.x". Present as the underlying Chromium browser
    // instead — Electron genuinely is Chromium, this isn't spoofing
    // a different engine, just omitting the giveaway suffix.
    appSession.setUserAgent(
      appSession.getUserAgent().replace(/\s*Electron\/\S+/, ""),
    );

    this.applyPermissionHandler(appSession, appId, securityConfig);

    this.sessions.set(appId, appSession);
    return appSession;
  }

  private applyPermissionHandler(
    appSession: Session,
    appId: string,
    securityConfig: AppSecurityConfig,
  ): void {
    // Default-deny: only what's explicitly listed in the app's
    // security config is granted. No prompt-and-hope-for-the-best —
    // an unlisted permission request is silently denied, consistent
    // with SecurityPolicy.evaluatePermission's own default-deny logic.
    appSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      const granted = securityConfig.grantedPermissions.includes(
        permission as PermissionName,
      );
      callback(granted);
    });

    appSession.setPermissionCheckHandler((_webContents, permission) => {
      return securityConfig.grantedPermissions.includes(permission as PermissionName);
    });
  }
}