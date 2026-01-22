FROM node:18-alpine
WORKDIR /app

# 1. Instalamos las dependencias que le faltan a tu dist
COPY package*.json ./
RUN npm install --omit=dev && \
    npm install @nestjs/microservices @grpc/grpc-js @grpc/proto-loader

# 2. Copiamos TU carpeta dist (la que tiene el main.js de 18KB)
COPY dist/main.js ./main.js
COPY dist/assets ./assets

# 3. Permisos y puerto
RUN chmod +x main.js
EXPOSE 3000

# Comando de arranque forzado
CMD ["node", "main.js"]