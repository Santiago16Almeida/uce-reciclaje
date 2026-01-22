FROM node:18-alpine

WORKDIR /app

# 1. Dependencias
COPY package*.json ./
RUN npm install --omit=dev

# 2. Copiamos el contenido de dist (donde está main.js y assets/)
COPY dist/apps/auth-service .

# 3. TODOS los puertos necesarios
EXPOSE 4001 50051 4003 5000

# 4. Configuración especial para el dashboard
ENV NODE_OPTIONS="--no-warnings"

# 5. Ejecución
CMD ["node", "main.js"]