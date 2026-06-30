# ============================================================
# LexIA Frontend — Dockerfile de produção (multi-stage)
# ============================================================
# Estágio 1: build Angular
# Estágio 2: Nginx servindo o bundle estático
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ----
FROM nginx:1.25-alpine AS production

COPY --from=builder /app/dist/lexia-frontend/browser /usr/share/nginx/html

# Configuração para SPA Angular (redireciona 404 → index.html para roteamento client-side)
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
  gzip on;\n\
  gzip_types text/plain text/css application/json application/javascript text/xml;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
