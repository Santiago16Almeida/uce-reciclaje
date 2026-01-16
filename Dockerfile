FROM node:18-alpine
RUN npm install -g nx
WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
RUN npm install
COPY . .

# AQUÍ ESTÁ TU COMANDO ESPECIAL INTEGRADO
ENV NODE_OPTIONS="--no-warnings"

# Nota: No ponemos el comando final aquí todavía para que sirva para los otros 10 servicios luego.
EXPOSE 4001
CMD ["npx", "nx", "serve", "auth-service", "--host", "0.0.0.0", "--no-watch"]