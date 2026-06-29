export interface UserAdmin {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'lawyer' | 'assistant' | 'viewer';
  is_active: boolean;
  created_at: string;
}
