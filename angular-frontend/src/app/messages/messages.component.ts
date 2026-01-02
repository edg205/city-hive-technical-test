import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MessagesService } from './messages.service';
import { AuthService } from '../core/auth.service';
import { Message } from '../core/models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];

  to_number = '';
  body = '';

  error: string | null = null;
  loading = false;

  constructor(
    private messagesService: MessagesService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error = null;

    this.messagesService.list().subscribe({
      next: (r) => {
        this.messages = r.messages ?? [];
          this.cdr.detectChanges();
      },
      error: (err) => {
        this.error =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Failed to load messages';
      }
    });
  }

  send(): void {
    this.error = null;

    if (!this.to_number || !this.body) return;

    this.loading = true;

    this.messagesService.send(this.to_number, this.body).subscribe({
      next: (r) => {
        this.loading = false;
        this.body = '';

        if (r?.message) {
          // Prepend for instant UX
          this.messages = [r.message, ...this.messages];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Failed to send message';
      }
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/auth'),
      error: () => {
        // even if API logout fails, clear client state by navigating away
        this.router.navigateByUrl('/auth');
      }
    });
  }
}
