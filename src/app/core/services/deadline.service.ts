import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { Deadline, DeadlineCreate, DeadlineUpdate } from '../models/deadline.model';

const API = API_ENDPOINTS.deadlines;

@Injectable({ providedIn: 'root' })
export class DeadlineService {
  private readonly http = inject(HttpClient);

  list(): Observable<Deadline[]> {
    return this.http.get<Deadline[]>(`${API}/`).pipe(handleHttpError('carregar prazos'));
  }

  listByCase(caseId: string): Observable<Deadline[]> {
    return this.http.get<Deadline[]>(`${API}/`, { params: { case_id: caseId } }).pipe(handleHttpError('carregar prazos do caso'));
  }

  getById(id: string): Observable<Deadline> {
    return this.http.get<Deadline>(`${API}/${id}`).pipe(handleHttpError('carregar o prazo'));
  }

  create(payload: DeadlineCreate): Observable<Deadline> {
    return this.http.post<Deadline>(`${API}/`, payload).pipe(handleHttpError('criar o prazo'));
  }

  update(id: string, payload: DeadlineUpdate): Observable<Deadline> {
    return this.http.put<Deadline>(`${API}/${id}`, payload).pipe(handleHttpError('atualizar o prazo'));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(handleHttpError('excluir o prazo'));
  }
}
