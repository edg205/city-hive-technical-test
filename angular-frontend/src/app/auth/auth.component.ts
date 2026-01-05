import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/auth.service';
import { AuthStore } from '../core/auth.store';

type Mode = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  // UI state
  readonly mode = signal<Mode>('login');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  // Form state
  readonly email = signal('');
  readonly password = signal('');
  readonly passwordConfirmation = signal('');

  // Touch tracking (for showing inline hints only after interaction)
  readonly touchedEmail = signal(false);
  readonly touchedPassword = signal(false);
  readonly touchedPasswordConfirmation = signal(false);

  // Derived
  readonly isSignup = computed(() => this.mode() === 'signup');

  readonly emailTrimmed = computed(() => this.email().trim());
  readonly emailValid = computed(() => this.emailTrimmed().length > 0);

  readonly passwordValid = computed(() => this.password().length > 0);

  readonly passwordConfirmationValid = computed(() => {
    if (!this.isSignup()) return true;
    return this.passwordConfirmation().length > 0 && this.passwordConfirmation() === this.password();
  });

  readonly showEmailHint = computed(() => this.touchedEmail() && !this.emailValid());
  readonly showPasswordHint = computed(() => this.touchedPassword() && !this.passwordValid());
  readonly showPasswordConfirmHint = computed(() => {
    if (!this.isSignup()) return false;
    return this.touchedPasswordConfirmation() && !this.passwordConfirmationValid();
  });

  readonly canSubmit = computed(() => {
    if (this.submitting()) return false;
    if (!this.emailValid() || !this.passwordValid()) return false;
    if (this.isSignup() && !this.passwordConfirmationValid()) return false;
    return true;
  });

  constructor() {
    // If already logged in, go straight to messages.
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        this.router.navigateByUrl('/messages');
      }
    });
  }

  submit(): void {
    this.error.set(null);

    // Mark fields touched so user sees what’s missing
    this.touchedEmail.set(true);
    this.touchedPassword.set(true);
    if (this.isSignup()) this.touchedPasswordConfirmation.set(true);

    if (!this.canSubmit()) return;

    this.submitting.set(true);

    const onSuccess = () => {
      this.submitting.set(false);
      this.router.navigateByUrl('/messages');
    };

    const onError = (err: any) => {
      this.submitting.set(false);
      this.error.set(this.extractErrorMessage(err));
    };

    if (this.mode() === 'login') {
      this.authService.login(this.emailTrimmed(), this.password()).subscribe({
        next: onSuccess,
        error: onError,
      });
    } else {
      this.authService
        .signup(this.emailTrimmed(), this.password(), this.passwordConfirmation())
        .subscribe({
          next: onSuccess,
          error: onError,
        });
    }
  }

  toggleMode(): void {
    this.error.set(null);
    this.submitting.set(false);

    const next: Mode = this.mode() === 'login' ? 'signup' : 'login';
    this.mode.set(next);

    // Reset touch state to avoid showing irrelevant hints after switching
    this.touchedEmail.set(false);
    this.touchedPassword.set(false);
    this.touchedPasswordConfirmation.set(false);

    if (next === 'login') {
      this.passwordConfirmation.set('');
    }
  }

  private extractErrorMessage(err: any): string {
    const msg =
      err?.error?.error?.message ||
      err?.error?.message ||
      err?.message;

    return typeof msg === 'string' && msg.trim().length > 0
      ? msg
      : 'Authentication failed';
  }
}
