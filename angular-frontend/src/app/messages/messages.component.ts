import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MessagesService } from './messages.service';
import { AuthService } from '../core/auth.service';
import { AuthStore } from '../core/auth.store';
import { Message } from '../core/models';
import { normalizePhone, isValidE164 } from '../core/phone';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly messagesService = inject(MessagesService);
  private readonly authService = inject(AuthService);
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  // Page state
  readonly loading = signal(false);
  readonly refreshing = signal(false);
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);

  // Data
  readonly messages = signal<Message[]>([]);

  // Form state
  readonly toNumberRaw = signal('');
  readonly body = signal('');

  // Touch tracking
  readonly touchedTo = signal(false);
  readonly touchedBody = signal(false);

  // Phone normalization + validation
  readonly toNumber = computed(() => normalizePhone(this.toNumberRaw()));
  readonly phoneValid = computed(() => isValidE164(this.toNumber()));
  readonly showPhoneHint = computed(
    () => this.touchedTo() && !this.phoneValid()
  );

  readonly canSend = computed(() => {
    if (this.sending()) return false;
    if (!this.phoneValid()) return false;
    if (!this.body().trim()) return false;
    return true;
  });

  constructor() {
    if (!this.authStore.isAuthenticated()) {
      this.router.navigateByUrl('/auth');
      return;
    }

    this.loadMessages(true);
  }

  refresh(): void {
    this.loadMessages(false);
  }

  private loadMessages(initial: boolean): void {
    this.error.set(null);
    initial ? this.loading.set(true) : this.refreshing.set(true);

    this.messagesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (msgs) => {
          this.messages.set(msgs ?? []);
          this.loading.set(false);
          this.refreshing.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.refreshing.set(false);
          this.error.set(this.extractErrorMessage(err) || 'Failed to load messages.');
        },
      });
  }

  send(): void {
    this.error.set(null);
    this.touchedTo.set(true);
    this.touchedBody.set(true);

    if (!this.canSend()) return;

    this.sending.set(true);

    const to = this.toNumber();
    const body = this.body().trim();

    this.messagesService
      .create(to, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.messages.update((list) => [created, ...list]);
          this.sending.set(false);
          this.body.set('');
          this.touchedBody.set(false);
        },
        error: (err) => {
          this.sending.set(false);
          this.error.set(this.extractErrorMessage(err) || 'Failed to send message.');
        },
      });
  }

  logout(): void {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigateByUrl('/auth'),
        error: () => this.router.navigateByUrl('/auth'),
      });
  }

  trackById = (_: number, m: Message) =>
    (m as any).id ?? (m as any).twilio_sid ?? _;

  private extractErrorMessage(err: any): string | null {
    const msg =
      err?.error?.error?.message ||
      err?.error?.message ||
      err?.message;

    return typeof msg === 'string' && msg.trim().length ? msg : null;
  }
}
