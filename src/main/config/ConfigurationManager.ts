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
  activeApplication?: string;
}

const DEFAULT_CONFIG: FuseConfig = {
  schemaVersion: 0,
  window: { width: 1280, height: 800 },
  applications: [{ id: "github" }, { id: "youtube-music" }],
  activeApplication: "github",
};

/**
 * Simple local JSON config, matching the schema in brief section 19.
 * Deliberately small: window bounds + application list + active
 * application only. No theme/sidebar config yet — nothing is
 * actually configurable there yet, so adding fields for it now would
 * be speculative (Rule 3: do not abstract until a second real use
 * case exists).
 *
 * Critical constraint (brief section 18): this file must NEVER
 * contain credentials, cookies, tokens, or any authentication data.
 * Each application's session lives entirely in its own Electron
 * session partition — a completely separate system.
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
        activeApplication: parsed.activeApplication ?? DEFAULT_CONFIG.activeApplication,
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

  getApplicationIds(): string[] {
    return this.config.applications.map((a) => a.id);
  }

  getActiveApplication(): string | undefined {
    return this.config.activeApplication;
  }

  setActiveApplication(appId: string): void {
    this.config.activeApplication = appId;
  }
}