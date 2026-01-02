import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from './token.service';

export const apiHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(TokenService).get();

  console.log('[interceptor]', req.method, req.url, 'jwt?', !!jwt); // TEMP DEBUG

  if (!jwt) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${jwt}` }
    })
  );
};
