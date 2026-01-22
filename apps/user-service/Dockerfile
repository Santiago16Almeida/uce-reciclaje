FROM node:18-alpine

WORKDIR /app

# 1. Copiamos los package.json de la raíz para instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# 2. Copiamos el archivo main.js desde la carpeta dist del microservicio
# Fíjate que la ruta empieza desde apps/
COPY apps/user-service/dist/main.js .

EXPOSE 3001
EXPOSE 4002

CMD ["node", "main.js"]