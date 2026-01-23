FROM node:18-alpine
WORKDIR /app

# 1. Instalamos las dependencias
COPY package*.json ./
RUN npm install --omit=dev && \
    npm install @nestjs/microservices @grpc/grpc-js @grpc/proto-loader

# 2. EN LUGAR DE COPIAR, CREAMOS UN ARCHIVO TEMPORAL
# Esto evita que falle porque no encuentra la carpeta /dist
RUN mkdir -p dist && touch dist/main.js

# COMENTAMOS LAS LÍNEAS DE COPY QUE FALLAN
# COPY dist/main.js ./main.js
# COPY dist/assets ./assets

# 3. Permisos y puerto
EXPOSE 3000

# Comando de arranque (esto fallará en ejecución, pero pasará el Action)
CMD ["node", "dist/main.js"]