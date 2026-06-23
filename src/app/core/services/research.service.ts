import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { ResearchRequest, ResearchResponse } from '../models/research.model';

@Injectable({ providedIn: 'root' })
export class ResearchService {
  private readonly http = inject(HttpClient);

  search(request: ResearchRequest): Observable<ResearchResponse> {
    return this.http
      .post<ResearchResponse>(`${API_ENDPOINTS.research}/internal`, request)
      .pipe(handleHttpError('executar a pesquisa interna'));
  }
}
