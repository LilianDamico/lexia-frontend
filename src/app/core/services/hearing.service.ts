import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { Hearing, HearingCreate, HearingUpdate } from '../models/hearing.model';

const API = API_ENDPOINTS.hearings;

@Injectable({ providedIn: 'root' })
export class HearingService {
  private readonly http = inject(HttpClient);

  list(): Observable<Hearing[]> {
    return this.http.get<Hearing[]>(`${API}/`).pipe(handleHttpError('carregar audiências'));
  }

  listByCase(caseId: string): Observable<Hearing[]> {
    return this.http.get<Hearing[]>(`${API}/`, { params: { case_id: caseId } }).pipe(handleHttpError('carregar audiências do caso'));
  }

  getById(id: string): Observable<Hearing> {
    return this.http.get<Hearing>(`${API}/${id}`).pipe(handleHttpError('carregar a audiência'));
  }

  create(payload: HearingCreate): Observable<Hearing> {
    return this.http.post<Hearing>(`${API}/`, payload).pipe(handleHttpError('criar a audiência'));
  }

  update(id: string, payload: HearingUpdate): Observable<Hearing> {
    return this.http.put<Hearing>(`${API}/${id}`, payload).pipe(handleHttpError('atualizar a audiência'));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(handleHttpError('excluir a audiência'));
  }
}
