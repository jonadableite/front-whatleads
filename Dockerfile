WORKDIR /app

COPY package*.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 4173

CMD ["npm", "start"]