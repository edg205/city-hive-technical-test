import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthStore } from './auth.store';

export const apiHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  const jwt = auth.token();

  const reqWithAuth = jwt
    ? req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } })
    : req;

  return next(reqWithAuth).pipe(
    catchError((err) => {
      // Central handling for expired/revoked tokens
      if (err?.status === 401) {
        auth.clear();
        router.navigateByUrl('/auth');
      }
      return throwError(() => err);
    })
  );
};
