import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from './models';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthStore) {}

  signup(email: string, password: string, passwordConfirmation: string): Observable<User> {
    return this.http
      .post<User>(
        `${this.base}/signup`,
        { user: { email, password, password_confirmation: passwordConfirmation } },
        { observe: 'response' }
      )
      .pipe(
        tap((resp) => this.storeJwt(resp)),
        map((resp) => resp.body as User)
      );
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>(
        `${this.base}/login`,
        { user: { email, password } },
        { observe: 'response' }
      )
      .pipe(
        tap((resp) => this.storeJwt(resp)),
        map((resp) => resp.body as User)
      );
  }

  logout(): Observable<void> {
    return this.http.delete<void>(`${this.base}/logout`).pipe(
      tap(() => this.auth.clear()),
      map(() => undefined)
    );
  }

  private storeJwt(resp: HttpResponse<any>): void {
    const header =
      resp.headers.get('Authorization') ||
      resp.headers.get('authorization');

    if (!header) return;

    const [type, token] = header.trim().split(/\s+/);
    if (type?.toLowerCase() === 'bearer' && token) {
      this.auth.setToken(token);
    }
  }
}
