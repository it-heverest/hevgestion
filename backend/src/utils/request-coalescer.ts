// src/utils/request-coalescer.ts
// Coalesces async requests by key - prevents duplicate API calls

type PendingRequest<T> = {
  promise: Promise<T>;
  callbacks: Array<(result: T) => void>;
  errorCallbacks: Array<(error: Error) => void>;
};

export class RequestCoalescer {
  private pending: Map<string, PendingRequest<any>> = new Map();
  private ttl: number;

  constructor(ttl: number = 5000) {
    this.ttl = ttl;
  }

  async run<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);

    if (existing) {
      console.log(`[Coalescer] Reusing pending request for key: ${key}`);
      return new Promise<T>((resolve, reject) => {
        existing.callbacks.push(resolve);
        existing.errorCallbacks.push(reject);
      });
    }

    console.log(`[Coalescer] Creating new request for key: ${key}`);

    const promise = factory();
    const callbacks: Array<(result: T) => void> = [];
    const errorCallbacks: Array<(error: Error) => void> = [];

    const wrappers: Promise<T> = new Promise<T>((resolve, reject) => {
      callbacks.push(resolve);
      errorCallbacks.push(reject);
    });

    this.pending.set(key, { promise, callbacks, errorCallbacks });

    try {
      const result = await promise;
      console.log(`[Coalescer] Request completed for key: ${key}`);

      const pending = this.pending.get(key);
      if (pending) {
        pending.callbacks.forEach(cb => cb(result));
        this.pending.delete(key);
      }

      return result;
    } catch (error) {
      console.log(`[Coalescer] Request failed for key: ${key}`, error);

      const pending = this.pending.get(key);
      if (pending) {
        pending.errorCallbacks.forEach(cb => cb(error as Error));
        this.pending.delete(key);
      }

      throw error;
    }
  }

  hasPending(key: string): boolean {
    return this.pending.has(key);
  }

  clear(key?: string): void {
    if (key) {
      this.pending.delete(key);
    } else {
      this.pending.clear();
    }
  }

  getPendingCount(): number {
    return this.pending.size;
  }
}

export const requestCoalescer = new RequestCoalescer();