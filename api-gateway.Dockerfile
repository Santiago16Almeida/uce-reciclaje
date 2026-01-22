FROM node:18-alpine
WORKDIR /app

# 1. Copiamos el package.json de la RAÍZ del proyecto
COPY package*.json ./

# 2. Instalamos las dependencias (omitimos las de desarrollo para que no pese tanto)
RUN npm install --omit=dev

# 3. Instalamos explícitamente las que Nest necesita para el bundle de Nx
RUN npm install reflect-metadata tslib @nestjs/platform-express

# 4. Copiamos el código compilado y los assets
COPY apps/api-gateway/dist/main.js ./main.js
COPY apps/api-gateway/dist/assets ./assets

EXPOSE 3000

# IMPORTANTE: Asegúrate de haber agregado bootstrap(); al final de tu main.ts antes de compilar
CMD ["node", "main.js"]