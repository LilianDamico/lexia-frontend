import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { Calculation, CalculationPayload } from '../models/calculation.model';

export type { Calculation, CalculationPayload } from '../models/calculation.model';
export type { CalculationType } from '../models/calculation.model';

@Injectable({ providedIn: 'root' })
export class CalculationsService {
  private readonly http = inject(HttpClient);

  list(): Observable<Calculation[]> {
    return this.http.get<Calculation[]>(`${API_ENDPOINTS.calculations}/`).pipe(handleHttpError('listar cálculos'));
  }

  getById(id: string): Observable<Calculation> {
    return this.http.get<Calculation>(`${API_ENDPOINTS.calculations}/${id}`).pipe(handleHttpError('carregar o cálculo'));
  }

  create(data: CalculationPayload): Observable<Calculation> {
    return this.http.post<Calculation>(`${API_ENDPOINTS.calculations}/`, data).pipe(handleHttpError('criar cálculo'));
  }

  update(id: string, data: CalculationPayload): Observable<Calculation> {
    return this.http.put<Calculation>(`${API_ENDPOINTS.calculations}/${id}`, data).pipe(handleHttpError('atualizar cálculo'));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.calculations}/${id}`).pipe(handleHttpError('excluir cálculo'));
  }
}
