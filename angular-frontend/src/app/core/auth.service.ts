import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private token: TokenService) {}

  signup(email: string, password: string, passwordConfirmation: string): Observable<User> {
    return this.http.post<{ user: User }>(
      `${this.base}/api/signup`,
      { user: { email, password, password_confirmation: passwordConfirmation } },
      { observe: 'response' }
    ).pipe(
      map((resp: HttpResponse<{ user: User }>) => {
        const auth = resp.headers.get('Authorization');
        if (auth?.toLowerCase().startsWith('bearer ')) {
          this.token.set(auth.split(' ')[1]);
        }
        return resp.body!.user;
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<{ user: User }>(
      `${this.base}/api/login`,
      { user: { email, password } },
      { observe: 'response' }
    ).pipe(
      map((resp: HttpResponse<{ user: User }>) => {
        const auth = resp.headers.get('Authorization');
        if (auth?.toLowerCase().startsWith('bearer ')) {
          this.token.set(auth.split(' ')[1]);
        }
        return resp.body!.user;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/logout`).pipe(
      map(() => {
        this.token.set(null);
        return;
      })
    );
  }
}
