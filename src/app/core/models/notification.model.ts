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
