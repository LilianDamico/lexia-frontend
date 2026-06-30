# Frontend

Aplicacao Angular da plataforma LexIA.

Organizada por features, `core` para servicos globais e `shared` para componentes reutilizaveis.

## Execucao local

```bash
npm install
npm start
```

A aplicacao usa a API em `http://localhost:8000/api/v1` e inicia em `http://localhost:4200`.

## Build de producao

A URL da API de producao é definida pela variavel de ambiente `LEXIA_API_URL` no painel do Render
e injetada automaticamente em `src/environments/environment.prod.ts` via `scripts/set-env.js`
durante o processo de build. O dominio de aplicacao de producao e `https://lexiaadv.com`.

## Funcionalidades iniciais

- Login com JWT.
- Dashboard com contadores carregados da API.
- Listagem de clientes.
- Listagem de casos.
- Listagem de prazos.
- Listagem de audiencias.
- Listagem de peticoes.
- Listagem de calculos.
- Pesquisa juridica interna.
