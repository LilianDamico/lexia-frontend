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
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        const user: AuthUser = {
          userId: response.userId,
          email: response.email,
          role: response.role,
          lawOfficeId: response.lawOfficeId,
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
        localStorage.setItem(TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        const user: AuthUser = {
          userId: response.userId,
          email: response.email,
          role: response.role,
          lawOfficeId: response.lawOfficeId,
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

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${API_ENDPOINTS.auth}/forgot-password`, { email }).pipe(
      catchError((error: unknown) => {
        console.error('Erro ao solicitar redefinição de senha.', error);
        return throwError(() => new Error('Não foi possível processar a solicitação. Tente novamente.'));
      }),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${API_ENDPOINTS.users}/me/password`, { currentPassword, newPassword }).pipe(
      catchError((error: unknown) => {
        const status = (error as { status?: number }).status;
        if (status === 403) {
          return throwError(() => new Error('Senha atual incorreta.'));
        }
        console.error('Erro ao alterar senha.', error);
        return throwError(() => new Error('Não foi possível alterar a senha. Tente novamente.'));
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
      .post<TokenResponse>(`${API_ENDPOINTS.auth}/refresh`, { refreshToken: refreshToken })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
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
