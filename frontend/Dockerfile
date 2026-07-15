FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar o resto do código
COPY . .

# Fazer o build
RUN npm run build

# Servir com nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]