import { contextBridge } from "electron";

/**
 * The ONLY surface the renderer can use to reach the main process.
 * Deliberately tiny for 0.0 — a version string and nothing else.
 * Every future capability (app list, command palette actions,
 * window controls) must be added here explicitly and typed in
 * fuse.d.ts; the renderer must never get direct ipcRenderer or
 * Node access. See docs/architecture section 7.2.
 */
const fuseApi = {
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
};

contextBridge.exposeInMainWorld("fuse", fuseApi);

export type FuseApi = typeof fuseApi;
