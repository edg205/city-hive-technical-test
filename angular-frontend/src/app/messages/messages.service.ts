import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Message } from '../core/models';

type MessagesIndexResponse = { messages: Message[] } | Message[];
type MessageCreateResponse = { message: Message } | Message;

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Message[]> {
    return this.http.get<MessagesIndexResponse>(`${this.base}/api/messages`).pipe(
      map((res) => (Array.isArray(res) ? res : res.messages ?? []))
    );
  }

  create(to_number: string, body: string): Observable<Message> {
    return this.http
      .post<MessageCreateResponse>(`${this.base}/api/messages`, { to_number, body })
      .pipe(map((res) => ('message' in (res as any) ? (res as any).message : (res as Message))));
  }
}
