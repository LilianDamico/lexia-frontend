import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { handleHttpError } from '../../core/http/http-error.handler';

export interface UserAdmin {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'lawyer' | 'assistant' | 'viewer';
  is_active: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdministrationService {
  private readonly http = inject(HttpClient);

  listUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(`${API_ENDPOINTS.USERS}/`).pipe(handleHttpError('listar usuários do escritório'));
  }
}
