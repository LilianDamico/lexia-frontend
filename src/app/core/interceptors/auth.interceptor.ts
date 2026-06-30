import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Shared Observable that serializes concurrent token-refresh calls.
// Multiple simultaneous 401s re-use the same refresh request instead of
// each firing an independent call (which would cause all but the first to
// fail because our backend rotates and immediately invalidates refresh tokens).
let refreshTokens$: Observable<void> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/login')
      ) {
        if (!refreshTokens$) {
          refreshTokens$ = authService.refreshTokens().pipe(shareReplay(1));
        }

        return refreshTokens$.pipe(
          switchMap(() => {
            refreshTokens$ = null;
            const newToken = authService.getToken();
            const retryReq = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;
            return next(retryReq);
          }),
          catchError((refreshError: unknown) => {
            refreshTokens$ = null;
            void router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
