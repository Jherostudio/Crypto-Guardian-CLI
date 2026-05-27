FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Imagen de producción final
FROM node:20-alpine

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el código compilado desde el builder
COPY --from=builder /app/dist ./dist

# Configurar el punto de entrada de la CLI
ENTRYPOINT ["node", "dist/index.js"]
