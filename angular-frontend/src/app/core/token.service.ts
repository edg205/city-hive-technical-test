import { Injectable } from '@angular/core';

const KEY = 'mysms_jwt';

@Injectable({ providedIn: 'root' })
export class TokenService {
  get(): string | null {
    return localStorage.getItem(KEY);
  }

  set(token: string | null) {
    if (!token) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, token);
  }

  isLoggedIn(): boolean {
    return !!this.get();
  }
}
