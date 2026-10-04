/**
 * LaTeX Studio Pro - Production Server
 * Clean, secure, high-performance LaTeX compilation API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compiler = require('./compiler');
const templates = require('../public/templates.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middlewares
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Restrict payload size to 10MB (allows embedded images/figures while mitigating DoS)
app.use(express.json({ limit: '10mb' }));

// Simple sliding window rate limiter
const rateLimitMap = new Map();
function rateLimiter(maxReqs = 60, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'client';
    const now = Date.now();
    let record = rateLimitMap.get(ip);
    if (!record || now - record.start > windowMs) {
      record = { start: now, count: 1 };
      rateLimitMap.set(ip, record);
    } else {
      record.count++;
      if (record.count > maxReqs) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please wait a moment before recompiling.'
        });
      }
    }
    next();
  };
}

// Clean up stale rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.start > 60000) rateLimitMap.delete(ip);
  }
}, 300000);

// Serve frontend assets
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1h',
  etag: true
}));

/**
 * Health & Engine status endpoint
 */
app.get('/api/status', (req, res) => {
  const binaryReady = fs.existsSync(compiler.TECTONIC_BIN);
  const cacheStats = compiler.getCacheStats();
  res.json({
    status: 'ok',
    engine: 'Tectonic (XeTeX compatible, sandboxed)',
    binaryReady,
    version: '0.17.0',
    cache: cacheStats,
    capabilities: [
      'Content-Addressable SHA-256 Cache',
      'Multi-Asset Support (Images, BibTeX)',
      'Sandboxed Execution (--untrusted)',
      'High-Speed PDF.js Rendering',
      'TikZ Diagrams & Flowcharts',
      'PGFPlots Scientific Curves',
      'Modern ATS Resume Formats',
      'Multi-Page Research Papers'
    ]
  });
});

/**
 * Detailed Healthcheck Endpoint for Cloud Monitors
 */
app.get('/api/health', (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024))
    },
    cache: compiler.getCacheStats()
  });
});

/**
 * List templates endpoint
 */
app.get('/api/templates', (req, res) => {
  const list = Object.entries(templates).map(([key, item]) => ({
    id: item.id || key,
    title: item.title,
    category: item.category,
    badge: item.badge,
    icon: item.icon,
    description: item.description,
    codeLength: item.code ? item.code.length : 0
  }));
  res.json({ success: true, templates: list });
});

/**
 * Cancellation endpoint to abort an in-flight compilation for a session
 */
app.post('/api/cancel', (req, res) => {
  const { sessionId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session ID required' });
  }
  const cancelled = compiler.cancelCompilation(sessionId);
  res.json({ success: true, cancelled });
});

/**
 * Compile LaTeX to PDF endpoint
 */
app.post('/api/compile', rateLimiter(60, 60000), async (req, res) => {
  const { code, sessionId = 'default', force = false, assets = [] } = req.body || {};

  // Strict validation
  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: "code" must be a non-empty string'
    });
  }

  if (code.length > 1024 * 1024 * 5) {
    return res.status(413).json({
      success: false,
      error: 'LaTeX code exceeds maximum allowed size (5MB)'
    });
  }

  try {
    const result = await compiler.compileLatex(code, { sessionId, force, assets });

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(422).json(result);
    }
  } catch (err) {
    console.error('[Compile API Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal compilation error: ' + err.message,
      duration: 0,
      errors: [{ message: err.message, line: null }]
    });
  }
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  LaTeX Studio Pro Server ready at http://localhost:${PORT}`);
  console.log(`  Engine: Tectonic (XeTeX sandboxed mode)`);
  console.log(`======================================================\n`);

  // Asynchronously pre-warm built-in templates so template switching is instant
  setTimeout(() => {
    compiler.prewarmTemplates(templates).catch((err) => {
      console.warn('Pre-warm warning:', err.message);
    });
  }, 1000);
});

// Handle graceful termination
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
