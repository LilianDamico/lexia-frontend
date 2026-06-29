export interface AuditEvent {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  user_email: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
