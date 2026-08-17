/**
 * The v0.0 application definition. Deliberately small — this is not
 * the future declarative .unified format. Do not add capability
 * fields here until a second real application (YouTube Music) needs
 * them. See docs/architecture, section 9.
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
}
