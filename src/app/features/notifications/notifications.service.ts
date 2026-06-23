import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { handleHttpError } from '../../core/http/http-error.handler';

export interface AppNotification {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  reference_type: string | null;
  reference_id: string | null;
  read_at: string | null;
  created_at: string;
  is_active: boolean;
}

interface MarkReadResponse {
  updated: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);

  list(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${API_ENDPOINTS.NOTIFICATIONS}/`).pipe(handleHttpError('listar notificações'));
  }

  markRead(notificationIds: string[]): Observable<MarkReadResponse> {
    return this.http
      .post<MarkReadResponse>(`${API_ENDPOINTS.NOTIFICATIONS}/mark-read`, { notification_ids: notificationIds })
      .pipe(handleHttpError('marcar notificações como lidas'));
  }
}
