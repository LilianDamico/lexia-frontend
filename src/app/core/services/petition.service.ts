import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { Petition, PetitionCreate, PetitionRejectRequest, PetitionUpdate } from '../models/petition.model';

const API = API_ENDPOINTS.petitions;

@Injectable({ providedIn: 'root' })
export class PetitionService {
  private readonly http = inject(HttpClient);

  list(): Observable<Petition[]> {
    return this.http.get<Petition[]>(`${API}`).pipe(handleHttpError('carregar petições'));
  }

  getById(id: string): Observable<Petition> {
    return this.http.get<Petition>(`${API}/${id}`).pipe(handleHttpError('carregar a petição'));
  }

  create(payload: PetitionCreate): Observable<Petition> {
    return this.http.post<Petition>(`${API}`, payload).pipe(handleHttpError('criar a petição'));
  }

  update(id: string, payload: PetitionUpdate): Observable<Petition> {
    return this.http.put<Petition>(`${API}/${id}`, payload).pipe(handleHttpError('atualizar a petição'));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(handleHttpError('excluir a petição'));
  }

  /** Submete petição para revisão do advogado — DIRECT.md: toda geração requer validação humana. */
  submit(id: string): Observable<Petition> {
    return this.http.post<Petition>(`${API}/${id}/submit`, {}).pipe(handleHttpError('submeter a petição para revisão'));
  }

  /** Aprovação explícita do advogado — DIRECT.md: nenhuma ação crítica sem confirmação. */
  approve(id: string): Observable<Petition> {
    return this.http.post<Petition>(`${API}/${id}/approve`, {}).pipe(handleHttpError('aprovar a petição'));
  }

  /** Rejeição com motivo obrigatório — DIRECT.md: toda operação deve possuir rastreabilidade. */
  reject(id: string, payload: PetitionRejectRequest): Observable<Petition> {
    return this.http.post<Petition>(`${API}/${id}/reject`, payload).pipe(handleHttpError('rejeitar a petição'));
  }
}
