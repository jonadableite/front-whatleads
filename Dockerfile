# Use uma imagem Node.js oficial como base
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Gera o build da aplicação
RUN npm run build

# Instala serve para servir a aplicação
RUN npm install -g serve

# Expõe a porta (ajuste conforme necessário)
EXPOSE 4177

# Comando para iniciar o aplicativo
CMD ["serve", "-s", "dist", "-l", "4177"]
