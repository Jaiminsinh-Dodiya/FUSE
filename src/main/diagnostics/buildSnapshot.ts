import { app, type BrowserWindow, type WebContentsView } from "electron";
import type { AppRegistry } from "../applications/AppRegistry";
import type { DiagnosticsCollector } from "./DiagnosticsCollector";

export interface DiagnosticsSnapshot {
  shell: { cpuPercent: number; memoryMB: number };
  github: { cpuPercent: number; memoryMB: number; state: string; session: string };
  navigation: { allowed: number; blocked: number };
  permissions: { granted: number; denied: number };
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
  githubView: WebContentsView | null,
  appRegistry: AppRegistry,
  diagnostics: DiagnosticsCollector,
): DiagnosticsSnapshot {
  const shellMetrics = findProcessMetrics(shellWindow.webContents.getOSProcessId());
  const githubMetrics = githubView
    ? findProcessMetrics(githubView.webContents.getOSProcessId())
    : { cpuPercent: 0, memoryMB: 0 };

  const githubEntry = appRegistry.get("github");
  const counts = diagnostics.getCounts();

  return {
    shell: shellMetrics,
    github: {
      ...githubMetrics,
      state: githubEntry?.state ?? "UNKNOWN",
      session: "persist:fuse-github",
    },
    navigation: {
      allowed: counts.navigationAllowed,
      blocked: counts.navigationBlocked,
    },
    permissions: {
      granted: counts.permissionsGranted,
      denied: counts.permissionsDenied,
    },
    // Honest, not aspirational: Master Search isn't built yet.
    shortcut: { masterSearch: "NOT_REGISTERED" },
    renderer: "HEALTHY",
  };
}