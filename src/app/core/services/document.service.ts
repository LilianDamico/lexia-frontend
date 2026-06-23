import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { Document } from '../models/document.model';

const API = API_ENDPOINTS.documents;

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);

  listByCase(caseId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${API}/case/${caseId}`).pipe(handleHttpError('carregar documentos do caso'));
  }

  upload(caseId: string, file: File, documentType: string | null): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) {
      formData.append('document_type', documentType);
    }

    return this.http.post<Document>(`${API}/upload/${caseId}`, formData).pipe(handleHttpError('enviar o documento'));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(handleHttpError('excluir o documento'));
  }
}
