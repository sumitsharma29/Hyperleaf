# ==============================================================================
# LaTeX Studio Pro - Production Dockerfile
# Multi-stage, secure container with Tectonic XeTeX engine & Node.js 20
# ==============================================================================

FROM node:20-slim AS runner

# Install essential dependencies: fontconfig, curl, ca-certificates, libssl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    libssl3 \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu72 \
    && rm -rf /var/lib/apt/lists/*

# Download and install precompiled Linux x86_64 Tectonic binary
WORKDIR /tmp
RUN curl -fsSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz \
    | tar -xz \
    && mv tectonic /usr/local/bin/tectonic \
    && chmod +x /usr/local/bin/tectonic

# Set up application directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY server/ ./server/
COPY public/ ./public/

# Ensure directory structure and permissions
RUN mkdir -p bin cache/pdf && \
    ln -sf /usr/local/bin/tectonic bin/tectonic.exe && \
    ln -sf /usr/local/bin/tectonic bin/tectonic && \
    chown -R node:node /app

# Switch to non-root user for strict security
USER node

# Expose HTTP port
EXPOSE 3000

# Environment settings
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "server/server.js"]
