const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

// Cross-platform Tectonic executable discovery
let TECTONIC_BIN = process.env.TECTONIC_PATH || path.resolve(__dirname, '../bin/tectonic.exe');
if (!fs.existsSync(TECTONIC_BIN)) {
  const linuxBin = path.resolve(__dirname, '../bin/tectonic');
  if (fs.existsSync(linuxBin)) {
    TECTONIC_BIN = linuxBin;
  } else {
    // Fallback to system PATH (e.g. Linux package install or container /usr/local/bin)
    TECTONIC_BIN = 'tectonic';
  }
}
const CACHE_DIR = path.resolve(__dirname, '../cache/pdf');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Memory cache for ultrafast response (< 2ms)
const memoryCache = new Map();
const MAX_MEMORY_CACHE = 50;

// Track active compiler processes by sessionId to allow immediate cancellation
const activeCompilations = new Map();

/**
 * Compute stable SHA-256 hash of LaTeX code
 */
function computeHash(code) {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

/**
 * Parse compiler log into structured error and warning objects
 */
function parseLatexErrors(log) {
  const errors = [];
  const warnings = [];
  const lines = log.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern 1: "! LaTeX Error: ..." or "! Undefined control sequence"
    if (line.startsWith('!')) {
      const errorMsg = line.substring(1).trim();
      let lineNum = null;
      let context = '';

      // Look ahead for "l.<number>"
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const nextLine = lines[j];
        const match = nextLine.match(/^l\.(\d+)(.*)/);
        if (match) {
          lineNum = parseInt(match[1], 10);
          context = match[2] ? match[2].trim() : '';
          break;
        }
      }

      errors.push({
        message: errorMsg,
        line: lineNum,
        context: context,
        raw: line
      });
    } else if (line.toLowerCase().includes('error:') && !line.includes('0 error')) {
      // General error line
      const matchLine = line.match(/:(\d+):\s*(.*)/);
      errors.push({
        message: matchLine ? matchLine[2].trim() : line.trim(),
        line: matchLine ? parseInt(matchLine[1], 10) : null,
        context: '',
        raw: line
      });
    } else if (line.toLowerCase().includes('warning:')) {
      warnings.push(line.trim());
    }
  }

  return { errors, warnings };
}

/**
 * Cancel an active compilation for a given session
 */
function cancelCompilation(sessionId) {
  if (!sessionId) return false;
  const active = activeCompilations.get(sessionId);
  if (active && active.process) {
    try {
      active.process.kill('SIGKILL');
      activeCompilations.delete(sessionId);
      if (active.tmpDir) {
        fs.promises.rm(active.tmpDir, { recursive: true, force: true }).catch(() => {});
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Check if a compiled PDF exists in disk or memory cache
 */
async function getFromCache(hash) {
  // Check memory
  if (memoryCache.has(hash)) {
    const item = memoryCache.get(hash);
    return {
      pdfBase64: item.pdfBase64,
      sizeBytes: item.sizeBytes,
      log: item.log || 'Retrieved from memory cache'
    };
  }

  // Check disk
  const pdfPath = path.join(CACHE_DIR, `${hash}.pdf`);
  const metaPath = path.join(CACHE_DIR, `${hash}.json`);

  if (fs.existsSync(pdfPath)) {
    try {
      const buffer = await fs.promises.readFile(pdfPath);
      let log = 'Retrieved from disk cache';
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf8'));
          log = meta.log || log;
        } catch (_) {}
      }

      const pdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
      const cachedItem = {
        pdfBase64,
        sizeBytes: buffer.length,
        log
      };

      // Populate memory cache
      if (memoryCache.size >= MAX_MEMORY_CACHE) {
        const oldestKey = memoryCache.keys().next().value;
        memoryCache.delete(oldestKey);
      }
      memoryCache.set(hash, cachedItem);

      return cachedItem;
    } catch (err) {
      console.warn('Cache read error:', err.message);
    }
  }

  return null;
}

/**
 * Save compiled PDF and metadata to disk and memory cache
 */
async function saveToCache(hash, buffer, log) {
  try {
    const pdfPath = path.join(CACHE_DIR, `${hash}.pdf`);
    const metaPath = path.join(CACHE_DIR, `${hash}.json`);

    await fs.promises.writeFile(pdfPath, buffer);
    await fs.promises.writeFile(metaPath, JSON.stringify({
      hash,
      timestamp: Date.now(),
      sizeBytes: buffer.length,
      log: log.slice(0, 5000)
    }));

    const pdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
    if (memoryCache.size >= MAX_MEMORY_CACHE) {
      const oldestKey = memoryCache.keys().next().value;
      memoryCache.delete(oldestKey);
    }
    memoryCache.set(hash, {
      pdfBase64,
      sizeBytes: buffer.length,
      log
    });
  } catch (err) {
    console.warn('Cache write error:', err.message);
  }
}

/**
 * Compile LaTeX code using sandboxed Tectonic engine with multi-asset support
 */
async function compileLatex(code, options = {}) {
  const { sessionId = 'default', force = false, assets = [] } = options;
  const startTime = Date.now();
  
  // Composite hash combining code and all project assets
  const assetSig = (assets || []).map(a => `${a.name}:${a.base64 ? a.base64.length : 0}`).sort().join('|');
  const hash = computeHash(code + '###' + assetSig);

  // Return cached result if available
  if (!force) {
    const cached = await getFromCache(hash);
    if (cached) {
      return {
        success: true,
        cached: true,
        hash,
        duration: Date.now() - startTime,
        pdfBase64: cached.pdfBase64,
        sizeBytes: cached.sizeBytes,
        log: cached.log,
        errors: [],
        warnings: []
      };
    }
  }

  // Cancel any ongoing compilation for this session
  cancelCompilation(sessionId);

  // Check compiler binary
  if (TECTONIC_BIN !== 'tectonic' && !fs.existsSync(TECTONIC_BIN)) {
    throw new Error(`Tectonic binary not found at: ${TECTONIC_BIN}`);
  }

  // Create isolated temp workspace
  const buildId = `tex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tmpDir = path.join(os.tmpdir(), buildId);
  await fs.promises.mkdir(tmpDir, { recursive: true });

  const texFile = path.join(tmpDir, 'document.tex');
  await fs.promises.writeFile(texFile, code, 'utf8');

  // Safely write project assets (images, .bib files, etc.)
  if (Array.isArray(assets) && assets.length > 0) {
    for (const asset of assets) {
      if (!asset || !asset.name || !asset.base64) continue;
      // Strict filename sanitization to prevent directory traversal
      const safeName = path.basename(asset.name).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      if (!safeName || safeName === 'document.tex') continue;
      
      const assetPath = path.join(tmpDir, safeName);
      const cleanBase64 = asset.base64.replace(/^data:[^;]+;base64,/, '');
      const assetBuffer = Buffer.from(cleanBase64, 'base64');
      await fs.promises.writeFile(assetPath, assetBuffer);
    }
  }

  return new Promise((resolve, reject) => {
    // Spawn Tectonic with --untrusted sandbox flag for strict security
    const child = spawn(TECTONIC_BIN, [
      'document.tex',
      '--outdir', tmpDir,
      '--untrusted',
      '-c', 'minimal'
    ], {
      cwd: tmpDir,
      windowsHide: true,
      timeout: 60000 // 60s hard timeout
    });

    activeCompilations.set(sessionId, { process: child, tmpDir });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', async (err) => {
      activeCompilations.delete(sessionId);
      await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
      reject(new Error(`Failed to execute LaTeX compiler: ${err.message}`));
    });

    child.on('close', async (exitCode) => {
      activeCompilations.delete(sessionId);
      const duration = Date.now() - startTime;
      const fullLog = (stdout + '\n' + stderr).trim();
      const pdfPath = path.join(tmpDir, 'document.pdf');

      try {
        if (fs.existsSync(pdfPath)) {
          const buffer = await fs.promises.readFile(pdfPath);
          const pdfBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;

          // Save to cache asynchronously
          saveToCache(hash, buffer, fullLog);

          const { warnings } = parseLatexErrors(fullLog);

          resolve({
            success: true,
            cached: false,
            hash,
            pdfBase64,
            duration,
            sizeBytes: buffer.length,
            log: fullLog,
            warnings,
            errors: []
          });
        } else {
          const { errors, warnings } = parseLatexErrors(fullLog);
          resolve({
            success: false,
            cached: false,
            hash,
            error: 'LaTeX compilation failed: PDF document was not created.',
            errors,
            warnings,
            log: fullLog,
            duration
          });
        }
      } catch (readErr) {
        resolve({
          success: false,
          cached: false,
          error: `Error reading generated PDF: ${readErr.message}`,
          log: fullLog,
          duration,
          errors: []
        });
      } finally {
        // Asynchronously clean up build directory
        setTimeout(() => {
          fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
        }, 2000);
      }
    });
  });
}

/**
 * Pre-warm cache with templates at server startup
 */
async function prewarmTemplates(templates) {
  console.log('⚡ Pre-warming template cache for instantaneous switching...');
  const templateList = Object.entries(templates);

  for (const [key, tmpl] of templateList) {
    if (!tmpl.code) continue;
    const hash = computeHash(tmpl.code);
    const cached = await getFromCache(hash);
    if (!cached) {
      console.log(`[Cache Warm] Compiling template: "${tmpl.title}" (${key})...`);
      try {
        const res = await compileLatex(tmpl.code, { sessionId: `prewarm_${key}` });
        if (res.success) {
          console.log(`✓ [Cache Warm] "${tmpl.title}" cached in ${res.duration}ms.`);
        } else {
          console.warn(`✗ [Cache Warm] Failed to compile "${tmpl.title}":`, res.errors[0]?.message || res.error);
        }
      } catch (err) {
        console.warn(`✗ [Cache Warm] Error for "${tmpl.title}":`, err.message);
      }
    } else {
      console.log(`✓ [Cache Warm] "${tmpl.title}" already cached.`);
    }
  }
  console.log('⚡ All templates ready with 0ms instant switching!');
}

/**
 * Cache metrics
 */
function getCacheStats() {
  const diskCount = fs.existsSync(CACHE_DIR) ? fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.pdf')).length : 0;
  return {
    memoryItems: memoryCache.size,
    diskItems: diskCount
  };
}

module.exports = {
  compileLatex,
  cancelCompilation,
  computeHash,
  getFromCache,
  prewarmTemplates,
  parseLatexErrors,
  getCacheStats,
  TECTONIC_BIN
};
