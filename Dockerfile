FROM node:20-alpine

WORKDIR /app

# 1. Dependencias
COPY package*.json ./
RUN npm install --omit=dev

# 2. Copiamos TODO el proyecto (incluyendo las carpetas apps/...)
COPY . .

# Esto unifica todos los microservicios en un solo lugar
RUN mkdir -p dist/apps && \
    for app in apps/*; do \
    if [ -d "$app/dist" ]; then \
    app_name=$(basename "$app"); \
    mkdir -p "dist/apps/$app_name"; \
    cp -r "$app/dist/." "dist/apps/$app_name/"; \
    fi \
    done

# 4. Verificación (esto saldrá en el log de GitHub para tu tranquilidad)
RUN ls -R dist/apps

ENV NODE_OPTIONS="--no-warnings"
CMD ["node", "dist/apps/auth-service/main.js"]