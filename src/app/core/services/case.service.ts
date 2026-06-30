import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { LegalArea, LegalCase, LegalCaseCreate, LegalCaseUpdate } from '../models/case.model';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private readonly http = inject(HttpClient);

  list(): Observable<LegalCase[]> {
    return this.http.get<LegalCase[]>(`${API_ENDPOINTS.cases}`).pipe(handleHttpError('carregar casos'));
  }

  getById(id: string): Observable<LegalCase> {
    return this.http.get<LegalCase>(`${API_ENDPOINTS.cases}/${id}`).pipe(handleHttpError('carregar o caso'));
  }

  create(payload: LegalCaseCreate): Observable<LegalCase> {
    return this.http.post<LegalCase>(`${API_ENDPOINTS.cases}`, payload).pipe(handleHttpError('criar o caso'));
  }

  update(id: string, payload: LegalCaseUpdate): Observable<LegalCase> {
    return this.http.put<LegalCase>(`${API_ENDPOINTS.cases}/${id}`, payload).pipe(handleHttpError('atualizar o caso'));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.cases}/${id}`).pipe(handleHttpError('excluir o caso'));
  }

  getLegalAreas(): Observable<LegalArea[]> {
    return this.http.get<LegalArea[]>(`${API_ENDPOINTS.legalAreas}`).pipe(handleHttpError('carregar áreas jurídicas'));
  }
}
