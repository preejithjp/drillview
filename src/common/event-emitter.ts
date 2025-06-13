import { generateUUID } from './utils';

export class EventEmitter<T = any> {
  private events: Record<string, { id: string; listener: (...args: any[]) => void }[]> = {};

  on(event: string, listener: (...args: any[]) => void): string {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    const id = generateUUID(); // Generates a unique ID
    this.events[event].push({ id, listener });
    return id;
  }

  emit(event: string, ...args: T[]): void {
    if (this.events[event]) {
      this.events[event].forEach((listener) => {
        listener.listener(...args);
      });
    }
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l.listener !== listener);
    }
  }

  offById(event: string, listenerId: string): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l.id !== listenerId);
    }
  }

  hasEvent(event: string): boolean {
    return !!this.events[event];
  }
}
