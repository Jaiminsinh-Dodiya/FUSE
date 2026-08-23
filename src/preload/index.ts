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
    setOverlayVisible: (open: boolean) => ipcRenderer.invoke("appview:setOverlayVisible", open),
    switch: (appId: string) => ipcRenderer.invoke("applications:switch", appId),
    getActive: (): Promise<string | null> => ipcRenderer.invoke("applications:getActive"),
    onActiveChanged: (callback: (payload: { appId: string }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: { appId: string }) =>
        callback(payload);
      ipcRenderer.on("app:activeChanged", listener);
      return () => ipcRenderer.removeListener("app:activeChanged", listener);
    },

  },
  diagnostics: {
    get: () => ipcRenderer.invoke("diagnostics:get"),
  },
  commands: {
    list: (): Promise<{ id: string; title: string }[]> => ipcRenderer.invoke("commands:list"),
    execute: (id: string) => ipcRenderer.invoke("commands:execute", id),
    onTogglePalette: (callback: () => void) => {
      const listener = () => callback();
      ipcRenderer.on("commands:togglePalette", listener);
      return () => ipcRenderer.removeListener("commands:togglePalette", listener);
    },
  },
};

contextBridge.exposeInMainWorld("fuse", fuseApi);

export type FuseApi = typeof fuseApi;