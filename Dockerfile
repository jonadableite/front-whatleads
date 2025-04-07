FROM node:20-alpine

WORKDIR /app

# Limpa cache npm
RUN npm cache clean --force

# Copia package files
COPY package*.json ./

# Instala dependências com cache
RUN npm ci

# Copia código fonte
COPY . .

# Adiciona etapa de typecheck
RUN npm run typecheck

# Build do projeto
RUN npm run build

# Verifica conteúdo dist
RUN ls -la dist

# Instala serve
RUN npm install -g serve

# Porta
EXPOSE 4177

# Comando
CMD ["serve", "-s", "dist", "-l", "4177"]
