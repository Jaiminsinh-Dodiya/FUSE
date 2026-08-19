import type { FuseApi } from "../preload/index";

declare global {
  interface Window {
    fuse: FuseApi;
  }
}

export {};
