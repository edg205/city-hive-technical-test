import { Injectable, computed, signal } from '@angular/core';

type AuthState = {
  token: string | null;
  initialized: boolean;
};

const KEY = 'mysms_jwt';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly state = signal<AuthState>({
    // Read immediately at service construction time
    token: typeof window !== 'undefined' ? localStorage.getItem(KEY) : null,
    initialized: true,
  });

  readonly token = computed(() => this.state().token);
  readonly initialized = computed(() => this.state().initialized);
  readonly isAuthenticated = computed(() => !!this.state().token);

  setToken(token: string | null): void {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem(KEY, token);
      else localStorage.removeItem(KEY);
    }

    this.state.update((s) => ({ ...s, token }));
  }

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEY);
    }
    this.state.set({ token: null, initialized: true });
  }
}
