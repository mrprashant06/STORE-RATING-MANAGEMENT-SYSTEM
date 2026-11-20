# ==============================================================================
# Production Multi-Stage Dockerfile
# Builds optimized React frontend & serves via hardened Express backend
# ==============================================================================

# Stage 1: Build the React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Install Backend Dependencies
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy backend source & production dependencies
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

# Copy built frontend dist files for static serving
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose standard application port
EXPOSE 5000

# Start server
CMD ["node", "backend/server.js"]
