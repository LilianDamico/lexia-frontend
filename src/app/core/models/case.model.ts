export type CaseStatus = 'draft' | 'active' | 'suspended' | 'closed' | 'archived';

export interface LegalCase { id: string; law_office_id: string; client_id: string; legal_area_id: string; title: string; description: string | null; status: CaseStatus; case_number: string | null; court: string | null; facts_summary: string | null; strategy_notes: string | null; ai_summary: string | null; risk_assessment: string | null; next_steps: string | null; created_at: string; updated_at: string; is_active: boolean; }
export interface LegalCaseCreate { law_office_id: string; client_id: string; legal_area_id: string; title: string; description?: string | null; status?: CaseStatus; case_number?: string | null; court?: string | null; facts_summary?: string | null; strategy_notes?: string | null; }
export interface LegalCaseUpdate { title?: string | null; description?: string | null; status?: CaseStatus | null; case_number?: string | null; court?: string | null; facts_summary?: string | null; strategy_notes?: string | null; }
export interface LegalArea { id: string; name: string; area_type: string; }
