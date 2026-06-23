export interface Client { id: string; law_office_id: string; name: string; document_number: string | null; email: string | null; phone: string | null; notes: string | null; created_at: string; updated_at: string; is_active: boolean; }
export interface ClientCreate { law_office_id: string; name: string; document_number?: string | null; email?: string | null; phone?: string | null; notes?: string | null; }
export interface ClientUpdate { name?: string | null; document_number?: string | null; email?: string | null; phone?: string | null; notes?: string | null; }
