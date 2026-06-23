export interface Deadline { id: string; law_office_id: string; case_id: string; title: string; description: string | null; due_at: string; status: string; completed_at: string | null; created_at: string; updated_at: string; is_active: boolean; }
export interface DeadlineCreate { case_id: string; title: string; description?: string | null; due_at: string; status?: string; }
export interface DeadlineUpdate { title?: string | null; description?: string | null; due_at?: string | null; status?: string | null; }
