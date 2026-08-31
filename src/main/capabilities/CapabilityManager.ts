import type { Session, WebContentsView, DownloadItem } from "electron";
import type { AppDefinition, AppCapabilities } from "../applications/AppDefinition";

export interface AppCapabilityStatus {
  readonly capabilities: AppCapabilities;
  readonly isPlayingMedia: boolean;
  readonly activeDownloadsCount: number;
}

export interface CapabilityDiagnosticsSink {
  recordDownloadStarted?(appId: string, filename: string): void;
  recordDownloadCompleted?(appId: string, filename: string, success: boolean): void;
  recordMediaStateChanged?(appId: string, isPlaying: boolean): void;
}

/**
 * CapabilityManager — Phase 7 Capability System.
 * 
 * Enforces declared capabilities on live WebContentsViews and Sessions:
 * - Downloads: allows or blocks downloads based on `downloads.enabled`.
 * - Media: tracks active media playback and ensures background audio policy.
 * - Diagnostics: reports live capability state and metrics.
 */
export class CapabilityManager {
  private readonly capabilityStatus = new Map<string, AppCapabilityStatus>();
  private readonly activeDownloads = new Map<string, Set<DownloadItem>>();
  private readonly sessionsHandled = new Set<string>();

  constructor(private readonly diagnostics?: CapabilityDiagnosticsSink) {}

  /**
   * Attach capability handlers to an application's session.
   */
  attachSession(appId: string, session: Session, def: AppDefinition): void {
    if (this.sessionsHandled.has(appId)) return;
    this.sessionsHandled.add(appId);

    const downloadsCapability = def.capabilities?.downloads;

    session.on("will-download", (event, item, _webContents) => {
      if (!downloadsCapability?.enabled) {
        console.warn(`[capabilities] blocked download for "${appId}" (downloads capability not declared)`);
        event.preventDefault();
        return;
      }

      let appDownloads = this.activeDownloads.get(appId);
      if (!appDownloads) {
        appDownloads = new Set();
        this.activeDownloads.set(appId, appDownloads);
      }
      appDownloads.add(item);
      this.updateStatus(appId, def.capabilities ?? {});

      const filename = item.getFilename();
      this.diagnostics?.recordDownloadStarted?.(appId, filename);

      item.on("done", (_e, state) => {
        appDownloads?.delete(item);
        this.updateStatus(appId, def.capabilities ?? {});
        this.diagnostics?.recordDownloadCompleted?.(appId, filename, state === "completed");
      });
    });
  }

  /**
   * Attach capability monitors to an application's WebContentsView.
   */
  attachView(appId: string, view: WebContentsView, def: AppDefinition): void {
    const { webContents } = view;
    const mediaCapability = def.capabilities?.media;

    this.updateStatus(appId, def.capabilities ?? {});

    if (mediaCapability) {
      webContents.on("media-started-playing", () => {
        this.updateStatus(appId, def.capabilities ?? {}, true);
        this.diagnostics?.recordMediaStateChanged?.(appId, true);
      });

      webContents.on("media-paused", () => {
        const isAudible = webContents.isCurrentlyAudible();
        this.updateStatus(appId, def.capabilities ?? {}, isAudible);
        this.diagnostics?.recordMediaStateChanged?.(appId, isAudible);
      });
    }
  }

  getStatus(appId: string): AppCapabilityStatus | undefined {
    return this.capabilityStatus.get(appId);
  }

  getAllStatuses(): ReadonlyMap<string, AppCapabilityStatus> {
    return this.capabilityStatus;
  }

  private updateStatus(
    appId: string,
    capabilities: AppCapabilities,
    isPlayingMedia?: boolean,
  ): void {
    const prev = this.capabilityStatus.get(appId);
    const downloadsCount = this.activeDownloads.get(appId)?.size ?? 0;
    const isPlaying = isPlayingMedia !== undefined ? isPlayingMedia : (prev?.isPlayingMedia ?? false);

    this.capabilityStatus.set(appId, {
      capabilities,
      isPlayingMedia: isPlaying,
      activeDownloadsCount: downloadsCount,
    });
  }
}
