import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  mode: 'login' | 'signup' = 'login';

  email = '';
  password = '';
  passwordConfirmation = '';
  error: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.error = null;

    const onSuccess = () => {
      this.router.navigateByUrl('/messages');
    };

    const onError = (err: any) => {
      this.error =
        err?.error?.error?.message ||
        err?.error?.message ||
        'Authentication failed';
    };

    if (this.mode === 'login') {
      this.auth.login(this.email, this.password).subscribe({
        next: onSuccess,
        error: onError
      });
    } else {
      this.auth
        .signup(this.email, this.password, this.passwordConfirmation)
        .subscribe({
          next: onSuccess,
          error: onError
        });
    }
  }

  toggleMode(): void {
    this.error = null;
    this.mode = this.mode === 'login' ? 'signup' : 'login';
  }
}
