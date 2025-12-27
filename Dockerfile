# Multi-stage Dockerfile for Vite + Express app
FROM node:20-alpine AS base

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install ALL dependencies (including devDependencies like tsx)
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set CI=true to prevent interactive prompts during build
ENV CI=true

# Build the application
RUN npm run build

# DEBUG: List the build output to verify structure in logs if it fails
RUN ls -la /app/dist || echo "Dist folder missing!"

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user for running the app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 express

# Copy built files from builder
# We assume the build script creates 'dist'
COPY --from=builder /app/dist ./dist
# If your server code is NOT bundled into dist, uncomment the next line:
# COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json
# We need production dependencies for the runner
COPY --from=builder /app/node_modules ./node_modules

# Set ownership
RUN chown -R express:nodejs /app

USER express

EXPOSE 5000

# Ensure we use the correct start command based on your package.json
CMD ["node", "dist/index.cjs"]