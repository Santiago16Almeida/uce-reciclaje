FROM node:18-alpine

WORKDIR /app

# Copiamos package.json y instalamos solo lo necesario para ejecutar
COPY package*.json ./
RUN npm install --omit=dev

# COPIAMOS TODO EL DIST (Aquí van los 11 servicios que GitHub ya compiló)
COPY dist ./dist

# OPCIONAL: Variable para evitar warnings molestos
ENV NODE_OPTIONS="--no-warnings"

# Por defecto iniciará el auth, pero el script de la EC2 lo sobreescribirá
CMD ["node", "dist/apps/auth-service/main.js"]