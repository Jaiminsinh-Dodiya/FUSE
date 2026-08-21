import { app } from "electron";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface WindowBounds {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export interface FuseConfig {
  schemaVersion: 0;
  window: WindowBounds;
  applications: { id: string }[];
}

const DEFAULT_CONFIG: FuseConfig = {
  schemaVersion: 0,
  window: { width: 1280, height: 800 },
  applications: [{ id: "github" }],
};

/**
 * Simple local JSON config, matching the schema in brief section 19.
 * Deliberately small: window bounds + application list only. No
 * theme/sidebar config yet — nothing is actually configurable there
 * yet, so adding fields for it now would be speculative (Rule 3: do
 * not abstract until a second real use case exists).
 *
 * Critical constraint (brief section 18): this file must NEVER
 * contain credentials, cookies, tokens, or any authentication data.
 * GitHub's session lives entirely in its own Electron session
 * partition (persist:fuse-github) — a completely separate system.
 */
export class ConfigurationManager {
  private readonly path = join(app.getPath("userData"), "fuse-config.json");
  private config: FuseConfig;

  constructor() {
    this.config = this.load();
  }

  private load(): FuseConfig {
    if (!existsSync(this.path)) {
      return { ...DEFAULT_CONFIG };
    }
    try {
      const raw = readFileSync(this.path, "utf-8");
      const parsed = JSON.parse(raw) as Partial<FuseConfig>;
      // Shallow-merge over defaults so a partial/older config file
      // doesn't crash on missing fields.
      return {
        schemaVersion: 0,
        window: { ...DEFAULT_CONFIG.window, ...parsed.window },
        applications: parsed.applications ?? DEFAULT_CONFIG.applications,
      };
    } catch (err) {
      console.error("[config] failed to read fuse-config.json, using defaults:", err);
      return { ...DEFAULT_CONFIG };
    }
  }

  save(): void {
    try {
      writeFileSync(this.path, JSON.stringify(this.config, null, 2), "utf-8");
    } catch (err) {
      console.error("[config] failed to write fuse-config.json:", err);
    }
  }

  getWindowBounds(): WindowBounds {
    return this.config.window;
  }

  setWindowBounds(bounds: WindowBounds): void {
    this.config.window = bounds;
  }
}