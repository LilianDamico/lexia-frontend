/** Configuração de ambiente — desenvolvimento local.
 *
 * Para desenvolver contra o backend local, mantenha localhost:8000.
 * Para desenvolver contra a API de produção, use a URL abaixo comentada.
 */
/** Configuração de ambiente — desenvolvimento local.
 *
 * Para desenvolver contra o backend local, use: http://localhost:8000/api/v1
 * Para desenvolver contra a API de produção sem CORS, use o proxy (proxy.conf.json)
 * configurando apiBaseUrl como '/api/v1' e execute: ng serve (o proxy é aplicado automaticamente).
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api/v1',
  appUrl: 'http://localhost:4200',
};
