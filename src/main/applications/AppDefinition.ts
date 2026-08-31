export interface MediaCapability {
  readonly backgroundAudio?: boolean;
  readonly mediaKeys?: boolean;
}

export interface DownloadsCapability {
  readonly enabled?: boolean;
  readonly defaultFolder?: "downloads" | "ask";
}

export interface AppCapabilities {
  readonly media?: MediaCapability;
  readonly downloads?: DownloadsCapability;
  readonly notifications?: boolean;
  readonly clipboard?: boolean;
  readonly externalLinks?: boolean;
}

/**
 * The FUSE application definition. Foundation for the future declarative
 * .unified format. Encapsulates identity, navigation entry, and declared
 * capabilities.
 */
export interface AppDefinition {
  /** Stable identifier, e.g. "github". Used as session partition suffix. */
  readonly id: string;
  /** Display name shown in the sidebar and command palette. */
  readonly name: string;
  /** Primary URL loaded into the WebContentsView. */
  readonly url: string;
  /** Optional icon reference (path or identifier), resolved by the renderer. */
  readonly icon?: string;
  /** Optional grouping category, e.g. "development". */
  readonly category?: string;
  /** Declared capabilities for this application (Phase 7). */
  readonly capabilities?: AppCapabilities;
}
