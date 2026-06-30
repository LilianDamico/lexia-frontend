import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { AppNotification } from '../models/notification.model';

export type { AppNotification } from '../models/notification.model';

interface MarkReadResponse {
  updated: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);

  list(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${API_ENDPOINTS.notifications}`).pipe(handleHttpError('listar notificações'));
  }

  markRead(notificationIds: string[]): Observable<MarkReadResponse> {
    return this.http
      .post<MarkReadResponse>(`${API_ENDPOINTS.notifications}/mark-read`, { notification_ids: notificationIds })
      .pipe(handleHttpError('marcar notificações como lidas'));
  }
}
