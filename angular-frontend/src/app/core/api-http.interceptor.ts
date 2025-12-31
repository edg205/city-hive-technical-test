import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from './token.service';

export const apiHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const jwt = tokenService.get();

  if (!jwt) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${jwt}` }
    })
  );
};
