# Stage 1: Build TypeScript source code
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configurations and workspace definition
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install workspace dependencies
RUN npm ci

# Copy the backend source files
COPY backend ./backend

# Build the TypeScript project
WORKDIR /app/backend
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy root and backend packages, compiled JS and node_modules
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist

# Expose backend API port
EXPOSE 3001
ENV PORT=3001

WORKDIR /app/backend

CMD ["npm", "run", "start"]
