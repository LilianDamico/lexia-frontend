import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import { handleHttpError } from '../http/http-error.handler';
import { Client, ClientCreate, ClientUpdate } from '../models/client.model';

const API = API_ENDPOINTS.clients;

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);

  list(): Observable<Client[]> {
    return this.http.get<Client[]>(`${API}`).pipe(handleHttpError('carregar clientes'));
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${API}/${id}`).pipe(handleHttpError('carregar o cliente'));
  }

  create(payload: ClientCreate): Observable<Client> {
    return this.http.post<Client>(`${API}`, payload).pipe(handleHttpError('criar o cliente'));
  }

  update(id: string, payload: ClientUpdate): Observable<Client> {
    return this.http.put<Client>(`${API}/${id}`, payload).pipe(handleHttpError('atualizar o cliente'));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(handleHttpError('excluir o cliente'));
  }
}
