import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { AuditEvent } from '../models/audit.model';

export type { AuditEvent } from '../models/audit.model';

interface AuditEventApiResponse {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata_json: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);

  list(): Observable<AuditEvent[]> {
    return this.http
      .get<AuditEventApiResponse[]>(`${API_ENDPOINTS.audit}/events`)
      .pipe(
        map((events) => events.map((event) => this.mapEvent(event))),
        handleHttpError('listar eventos de auditoria'),
      );
  }

  private mapEvent(event: AuditEventApiResponse): AuditEvent {
    return {
      id: event.id,
      event_type: event.action,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      user_id: event.actor_user_id,
      user_email: null,
      details: this.parseDetails(event.metadata_json, event.ip_address, event.user_agent),
      created_at: event.created_at,
    };
  }

  private parseDetails(
    metadataJson: string | null,
    ipAddress: string | null,
    userAgent: string | null,
  ): Record<string, unknown> {
    let parsedMetadata: Record<string, unknown> = {};

    if (metadataJson) {
      try {
        parsedMetadata = JSON.parse(metadataJson) as Record<string, unknown>;
      } catch {
        parsedMetadata = { metadata_json: metadataJson };
      }
    }

    return {
      ...parsedMetadata,
      ...(ipAddress ? { ip_address: ipAddress } : {}),
      ...(userAgent ? { user_agent: userAgent } : {}),
    };
  }
}
