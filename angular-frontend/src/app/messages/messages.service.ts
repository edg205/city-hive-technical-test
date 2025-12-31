import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Message } from '../core/models';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<{ messages: Message[] }> {
    return this.http.get<{ messages: Message[] }>(`${this.base}/api/messages`);
  }

  send(to_number: string, body: string): Observable<{ message: Message }> {
    return this.http.post<{ message: Message }>(`${this.base}/api/messages`, { to_number, body });
  }
}
