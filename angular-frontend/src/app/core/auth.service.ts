import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private token: TokenService) {}

  signup(email: string, password: string, passwordConfirmation: string): Observable<User> {
    return this.http.post<{ user: User }>(
      `${this.base}/signup`,
      { user: { email, password, password_confirmation: passwordConfirmation } },
      { observe: 'response' }
    ).pipe(
      map((resp: HttpResponse<{ user: User }>) => {
        this.storeJwt(resp);
        return resp.body!.user;
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<{ user: User }>(
      `${this.base}/login`,
      { user: { email, password } },
      { observe: 'response' }
    ).pipe(
      map((resp: HttpResponse<{ user: User }>) => {
        this.storeJwt(resp);
        return resp.body!.user;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.delete<void>(`${this.base}/logout`).pipe(
      map(() => {
        this.token.set(null);
        return;
      })
    );
  }

  private storeJwt(resp: HttpResponse<any>): void {
    const auth =
      resp.headers.get('Authorization') ||
      resp.headers.get('authorization');

    console.log('[AuthService] auth header:', auth); // TEMP DEBUG

    if (!auth) return;

    const [type, token] = auth.trim().split(/\s+/);
    if (type?.toLowerCase() === 'bearer' && token) {
      this.token.set(token);
    }
  }

}
