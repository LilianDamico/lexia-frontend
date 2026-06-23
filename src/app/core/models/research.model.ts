/**
 * Modelo de resposta da pesquisa jurídica interna.
 * Conforme DIRECT.md — Confiabilidade: toda informação apresentada deve indicar
 * Fonte, Trecho utilizado, Tipo, Nível de confiança e Origem da evidência.
 */
export interface ResearchResponse {
  answer: string;
  source?: string | null;
  excerpt?: string | null;
  information_type?: string | null;
  confidence_level?: 'high' | 'medium' | 'low' | 'unknown' | null;
  evidence_origin?: string | null;
}

export interface ResearchRequest {
  query: string;
  case_id?: string | null;
}
