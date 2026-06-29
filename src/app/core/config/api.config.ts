/** Configuração centralizada de endpoints da API LexIA. */
import { environment } from '../../../environments/environment';

export const API_BASE = environment.apiBaseUrl;

export const API_ENDPOINTS = {
  auth: `${API_BASE}/auth`,
  clients: `${API_BASE}/clients`,
  cases: `${API_BASE}/cases`,
  legalAreas: `${API_BASE}/legal-areas`,
  deadlines: `${API_BASE}/deadlines`,
  hearings: `${API_BASE}/hearings`,
  petitions: `${API_BASE}/petitions`,
  documents: `${API_BASE}/documents`,
  research: `${API_BASE}/research`,
  calculations: `${API_BASE}/calculations`,
  notifications: `${API_BASE}/notifications`,
  users: `${API_BASE}/users`,
  audit: `${API_BASE}/audit`,
} as const;
