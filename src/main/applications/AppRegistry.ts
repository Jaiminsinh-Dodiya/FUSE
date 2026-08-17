import type { AppDefinition } from "./AppDefinition";
import { type AppLifecycleState, canTransition } from "./AppState";

interface RegisteredApp {
  definition: AppDefinition;
  state: AppLifecycleState;
}

/**
 * Owns the set of known application definitions and their current
 * lifecycle state. Lives in the main process only — the renderer
 * reads a projection of this over the preload API, it never mutates
 * it directly. See docs/architecture section 7.1 and 16.
 */
export class AppRegistry {
  private readonly apps = new Map<string, RegisteredApp>();

  register(definition: AppDefinition): void {
    if (this.apps.has(definition.id)) {
      throw new Error(`AppRegistry: duplicate application id "${definition.id}"`);
    }
    this.apps.set(definition.id, { definition, state: "CREATED" });
  }

  get(id: string): RegisteredApp | undefined {
    return this.apps.get(id);
  }

  list(): readonly AppDefinition[] {
    return Array.from(this.apps.values(), (entry) => entry.definition);
  }

  /**
   * Explicit, validated state transition. Throws rather than silently
   * ignoring an illegal transition, so bugs surface immediately
   * instead of leaving an application in an inconsistent state.
   */
  transition(id: string, to: AppLifecycleState): void {
    const entry = this.apps.get(id);
    if (!entry) {
      throw new Error(`AppRegistry: unknown application id "${id}"`);
    }
    if (!canTransition(entry.state, to)) {
      throw new Error(
        `AppRegistry: illegal transition for "${id}": ${entry.state} -> ${to}`,
      );
    }
    entry.state = to;
  }
}
