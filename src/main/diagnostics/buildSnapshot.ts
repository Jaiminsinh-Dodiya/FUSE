import { app, type BrowserWindow, type WebContentsView } from "electron";
import type { AppRegistry } from "../applications/AppRegistry";
import type { DiagnosticsCollector } from "./DiagnosticsCollector";
import type { CapabilityManager } from "../capabilities/CapabilityManager";
import type { AppCapabilities } from "../applications/AppDefinition";

export interface DiagnosticsSnapshot {
  shell: { cpuPercent: number; memoryMB: number };
  activeApp: {
    id: string;
    cpuPercent: number;
    memoryMB: number;
    state: string;
    session: string;
    capabilities: AppCapabilities;
    isPlayingMedia: boolean;
    activeDownloads: number;
  };
  navigation: { allowed: number; blocked: number };
  permissions: { granted: number; denied: number };
  downloads: { started: number; completed: number };
  shortcut: { masterSearch: "REGISTERED" | "NOT_REGISTERED" };
  renderer: "HEALTHY";
}

function findProcessMetrics(pid: number) {
  const entry = app.getAppMetrics().find((m) => m.pid === pid);
  return {
    cpuPercent: entry ? Math.round(entry.cpu.percentCPUUsage * 10) / 10 : 0,
    // workingSetSize is in KB; convert to MB for readability.
    memoryMB: entry ? Math.round(entry.memory.workingSetSize / 1024) : 0,
  };
}

/**
 * Assembles a point-in-time diagnostics snapshot. Called on-demand
 * (renderer requests it when the panel opens / refreshes) rather than
 * pushed continuously — brief section 36 explicitly prefers
 * event-driven work over polling/timers running in the background.
 */
export function buildSnapshot(
  shellWindow: BrowserWindow,
  activeView: WebContentsView | null,
  appRegistry: AppRegistry,
  diagnostics: DiagnosticsCollector,
  masterSearchRegistered: boolean,
  activeAppId: string,
  capabilityManager?: CapabilityManager,
): DiagnosticsSnapshot {
  const shellMetrics = findProcessMetrics(shellWindow.webContents.getOSProcessId());
  const activeMetrics = activeView
    ? findProcessMetrics(activeView.webContents.getOSProcessId())
    : { cpuPercent: 0, memoryMB: 0 };

  const activeEntry = appRegistry.get(activeAppId);
  const capStatus = capabilityManager?.getStatus(activeAppId);
  const counts = diagnostics.getCounts();

  return {
    shell: shellMetrics,
    activeApp: {
      id: activeAppId,
      ...activeMetrics,
      state: activeEntry?.state ?? "UNKNOWN",
      session: `persist:fuse-${activeAppId}`,
      capabilities: activeEntry?.definition.capabilities ?? {},
      isPlayingMedia: capStatus?.isPlayingMedia ?? false,
      activeDownloads: capStatus?.activeDownloadsCount ?? 0,
    },
    navigation: {
      allowed: counts.navigationAllowed,
      blocked: counts.navigationBlocked,
    },
    permissions: {
      granted: counts.permissionsGranted,
      denied: counts.permissionsDenied,
    },
    downloads: {
      started: counts.downloadsStarted,
      completed: counts.downloadsCompleted,
    },
    shortcut: { masterSearch: masterSearchRegistered ? "REGISTERED" : "NOT_REGISTERED" },
    renderer: "HEALTHY",
  };
}