import { Injectable } from '@angular/core';

const KEY = 'mysms_jwt';

@Injectable({ providedIn: 'root' })
export class TokenService {
  get(): string | null {
    return localStorage.getItem(KEY);
  }

  set(token: string | null): void {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  }
}
