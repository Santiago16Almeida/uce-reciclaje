FROM node:18-alpine
WORKDIR /app

# 1. Instalamos las dependencias
COPY package*.json ./
RUN npm install --omit=dev && \
    npm install @nestjs/microservices @grpc/grpc-js @grpc/proto-loader

# 2. Copiamos los archivos de ejecución
COPY dist/main.js ./main.js

# COMENTA ESTA LÍNEA (Ponle el # al inicio):
# COPY dist/assets ./assets

# 3. Permisos y puerto
RUN chmod +x main.js
EXPOSE 3000

# Comando de arranque forzado
CMD ["node", "main.js"]