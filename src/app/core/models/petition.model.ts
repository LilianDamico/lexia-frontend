export type OperationStatus =
  | 'pending'
  | 'processing'
  | 'generated'
  | 'validated'
  | 'approved'
  | 'rejected';

export interface Petition {
  id: string;
  law_office_id: string;
  case_id: string;
  title: string;
  petition_type: string | null;
  operation_status: OperationStatus;
  content: string;
  ai_generated: boolean;
  ai_model_used: string | null;
  approved_by_id: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PetitionCreate {
  case_id: string;
  title: string;
  petition_type?: string | null;
  content: string;
}

export interface PetitionUpdate {
  title?: string | null;
  petition_type?: string | null;
  content?: string | null;
}

export interface PetitionSubmitRequest {
  readonly _tag: 'submit';
}

export interface PetitionApproveRequest {
  readonly _tag: 'approve';
}

export interface PetitionRejectRequest {
  rejection_reason: string;
}
