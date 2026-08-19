export interface Command {
  id: string;
  title: string;
  run: () => void | Promise<void>;
}

/**
 * Small, flat command registry — brief section 27: "Do not create
 * hundreds of commands." Just enough for a real Master Search.
 */
export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  register(command: Command): void {
    if (this.commands.has(command.id)) {
      throw new Error(`CommandRegistry: duplicate command id "${command.id}"`);
    }
    this.commands.set(command.id, command);
  }

  list(): { id: string; title: string }[] {
    return Array.from(this.commands.values(), ({ id, title }) => ({ id, title }));
  }

  async execute(id: string): Promise<void> {
    const command = this.commands.get(id);
    if (!command) {
      throw new Error(`CommandRegistry: unknown command id "${id}"`);
    }
    await command.run();
  }
}