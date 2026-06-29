export type CalculationType =
  | 'simple_interest'
  | 'compound_interest'
  | 'monetary_correction'
  | 'attorney_fees'
  | 'fgts';

export interface Calculation {
  id: string;
  law_office_id: string;
  case_id: string | null;
  title: string;
  calculation_type: CalculationType;
  principal_amount: number;
  annual_interest_rate: number;
  start_date: string;
  end_date: string;
  result_amount: number;
  notes: string | null;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface CalculationPayload {
  case_id: string | null;
  title: string;
  calculation_type: CalculationType;
  principal_amount: number;
  annual_interest_rate: number;
  start_date: string;
  end_date: string;
  notes: string | null;
}
