# Estágio de build
FROM node:20-alpine as builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Instala as dependências
RUN npm ci

# Copia o código fonte
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Gera o build
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copia o arquivo de configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 50