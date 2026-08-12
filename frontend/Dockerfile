# Stage 1: Build dependency graph and compile frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configurations and workspace definition
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install dependencies for the workspace
RUN npm ci

# Copy the frontend application files
COPY frontend ./frontend

# Build the Next.js production bundle
WORKDIR /app/frontend
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built package and node_modules
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/frontend/package.json ./frontend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public

# Run as non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

WORKDIR /app/frontend
EXPOSE 3000
ENV PORT=3000

CMD ["npm", "run", "start"]
