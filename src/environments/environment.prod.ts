/** Configuração de ambiente — produção.
 *
 * A variável apiBaseUrl deve apontar para o domínio real do backend.
 * Em deploy via Docker/Kubernetes, substitua pelo valor correto via CI/CD
 * ou use um reverse proxy (nginx) que encaminhe /api para o backend.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.lexia.com.br/api/v1',
};
