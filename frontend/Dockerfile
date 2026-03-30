FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false || npm install

COPY . .

RUN chmod -R 777 node_modules
RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]