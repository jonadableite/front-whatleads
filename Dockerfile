WORKDIR /app

COPY package*.json package-lock.json ./

RUN npm install

COPY . .

# Compilar TypeScript
RUN npm run build

EXPOSE 4173

CMD ["npm", "start"]