FROM node:18-alpine

# Instalamos NX global
RUN npm install -g nx

WORKDIR /app

# Copiamos archivos de configuración del monorepo
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm install

# Copiamos todo el código
COPY . .

# Variable que guardaste en tus notas
ENV NODE_OPTIONS="--no-warnings"

# Exponemos los puertos que vimos en el main.ts
EXPOSE 4001
EXPOSE 4003
EXPOSE 50051

# Comando final (con --host 0.0.0.0 por seguridad extra)
CMD ["npx", "nx", "serve", "auth-service", "--host", "0.0.0.0", "--no-watch"]