#!/usr/bin/env node
/**
 * set-env.js — Injeta a URL da API em environment.prod.ts antes do build Angular.
 *
 * Uso local:  node scripts/set-env.js
 * Uso Render: defina LEXIA_API_URL no dashboard → o build executa este script automaticamente.
 *
 * Se LEXIA_API_URL não estiver definida, usa o fallback para o serviço padrão do Render.
 */
const fs   = require('fs');
const path = require('path');

const apiUrl = process.env.LEXIA_API_URL || 'https://api.lexiaadv.com/api/v1';
const appUrl = process.env.LEXIA_APP_URL || 'https://lexiaadv.com';

const content = `// Gerado automaticamente por scripts/set-env.js — não edite manualmente.
// Para alterar as URLs, defina LEXIA_API_URL e LEXIA_APP_URL no painel do Render.
export const environment = {
  production: true,
  apiBaseUrl: '${apiUrl}',
  appUrl: '${appUrl}',
};
`;

const target = path.resolve(__dirname, '../src/environments/environment.prod.ts');
fs.writeFileSync(target, content, 'utf-8');

console.log(`[set-env] environment.prod.ts atualizado`);
console.log(`[set-env] apiBaseUrl → ${apiUrl}`);
console.log(`[set-env] appUrl     → ${appUrl}`);
