FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos TODAS las dependencias (incluyendo tslib que NestJS/Nx necesitan)
RUN npm install

# Copiamos la carpeta dist que GitHub Actions ya generó
COPY dist ./dist

# Variable de entorno para evitar warnings
ENV NODE_OPTIONS="--no-warnings"

# No ponemos un CMD fijo tan rígido para que la EC2 pueda elegir cuál arrancar
CMD ["node", "dist/apps/auth-service/main.js"]