import { contextBridge, ipcRenderer } from "electron";

const fuseApi = {
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  windowControls: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
  },
  applications: {
    reload: (appId: string) => ipcRenderer.invoke(`app:reload:${appId}`),
    onStateChanged: (
      callback: (payload: { appId: string; state: string }) => void,
    ) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        payload: { appId: string; state: string },
      ) => callback(payload);
      ipcRenderer.on("app:stateChanged", listener);
      return () => ipcRenderer.removeListener("app:stateChanged", listener);
    },
  },
  diagnostics: {
    get: () => ipcRenderer.invoke("diagnostics:get"),
  }
};

contextBridge.exposeInMainWorld("fuse", fuseApi);

export type FuseApi = typeof fuseApi;