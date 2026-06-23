import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { handleHttpError } from '../../core/http/http-error.handler';

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

@Injectable({ providedIn: 'root' })
export class CalculationsService {
  private readonly http = inject(HttpClient);

  list(): Observable<Calculation[]> {
    return this.http.get<Calculation[]>(`${API_ENDPOINTS.CALCULATIONS}/`).pipe(handleHttpError('listar cálculos'));
  }

  getById(id: string): Observable<Calculation> {
    return this.http.get<Calculation>(`${API_ENDPOINTS.CALCULATIONS}/${id}`).pipe(handleHttpError('carregar o cálculo'));
  }

  create(data: CalculationPayload): Observable<Calculation> {
    return this.http.post<Calculation>(`${API_ENDPOINTS.CALCULATIONS}/`, data).pipe(handleHttpError('criar cálculo'));
  }

  update(id: string, data: CalculationPayload): Observable<Calculation> {
    return this.http.put<Calculation>(`${API_ENDPOINTS.CALCULATIONS}/${id}`, data).pipe(handleHttpError('atualizar cálculo'));
  }

  delete(id: string): Observable<Calculation> {
    return this.http.delete<Calculation>(`${API_ENDPOINTS.CALCULATIONS}/${id}`).pipe(handleHttpError('excluir cálculo'));
  }
}
