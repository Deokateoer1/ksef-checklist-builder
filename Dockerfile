# ============================================================
# KSeF Checklist Builder | Dockerfile | PRODUKCJA
# Stage 1: build (Node 20) → Stage 2: serve (Nginx alpine)
# ============================================================

# ---- BUILD STAGE ----
FROM node:20-alpine AS build
WORKDIR /app

# Instaluj zależności (cache-friendly: najpierw tylko package*.json)
COPY package*.json ./
RUN npm ci --prefer-offline

# Kopiuj kod źródłowy
COPY . .

# URL backendu przekazywany jako build argument
ARG VITE_ROBOT_API_URL=http://localhost:8000
ENV VITE_ROBOT_API_URL=$VITE_ROBOT_API_URL

# Klucz Gemini API (wymagany przez geminiService.ts)
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Build produkcyjny — bundle trafia do /app/dist
RUN npm run build

# ---- RUNTIME STAGE (Nginx) ----
FROM nginx:stable-alpine

# Usuń domyślną konfigurację Nginx
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Kopiuj zbudowany frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiuj konfigurację Nginx (SPA routing + proxy API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
