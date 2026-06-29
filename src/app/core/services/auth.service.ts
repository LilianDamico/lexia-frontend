import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthUser, LoginRequest, RegisterRequest, TokenResponse } from '../models/auth.model';
import { API_ENDPOINTS } from '../config/api.config';

const TOKEN_KEY = 'lexia_token';
const REFRESH_TOKEN_KEY = 'lexia_refresh_token';
const USER_KEY = 'lexia_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _user = signal<AuthUser | null>(this.loadStoredUser());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null && Boolean(this.getToken()));
  readonly lawOfficeId = computed(() => this._user()?.lawOfficeId ?? '');

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API_ENDPOINTS.auth}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
        const user: AuthUser = {
          userId: response.user_id,
          email: response.email,
          role: response.role,
          lawOfficeId: response.law_office_id,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._user.set(user);
      }),
      catchError((error: unknown) => {
        console.error('Erro ao autenticar usuário.', error);
        return throwError(() => new Error('Não foi possível autenticar com as credenciais informadas.'));
      }),
    );
  }

  register(data: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${API_ENDPOINTS.auth}/register`, data).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
        const user: AuthUser = {
          userId: response.user_id,
          email: response.email,
          role: response.role,
          lawOfficeId: response.law_office_id,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._user.set(user);
      }),
      catchError((error: unknown) => {
        console.error('Erro ao registrar usuário.', error);
        return throwError(() => new Error('Não foi possível criar a conta. Verifique os dados e tente novamente.'));
      }),
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.http
        .post(`${API_ENDPOINTS.auth}/logout`, { refresh_token: refreshToken })
        .subscribe({ error: (e) => console.warn('Logout remoto falhou:', e) });
    }
    this.clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  refreshTokens(): Observable<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
    }

    return this.http
      .post<TokenResponse>(`${API_ENDPOINTS.auth}/refresh`, { refresh_token: refreshToken })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.access_token);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
        }),
        map(() => undefined),
        catchError((error: unknown) => {
          console.error('[AuthService] Refresh token inválido — forçando logout.', error);
          this.clearSession();
          return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
        }),
      );
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private loadStoredUser(): AuthUser | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch (error: unknown) {
      console.error('Falha ao restaurar usuário autenticado.', error);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    }
  }
}
