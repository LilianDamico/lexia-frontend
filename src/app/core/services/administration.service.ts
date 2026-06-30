import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { UserAdmin } from '../models/user.model';

export type { UserAdmin } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdministrationService {
  private readonly http = inject(HttpClient);

  listUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(`${API_ENDPOINTS.users}`).pipe(handleHttpError('listar usuários do escritório'));
  }
}
