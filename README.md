# 🌿 Hyperleaf v3.5 — Next-Generation LaTeX Workspace & Editor

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg?style=for-the-badge)](LICENSE)
[![Engine: Tectonic XeTeX](https://img.shields.io/badge/Engine-Tectonic%20XeTeX-3b82f6.svg?style=for-the-badge)](https://tectonic-typesetting.github.io/)
[![Cache: 0ms Instant](https://img.shields.io/badge/Cache-0ms%20Instant-06b6d4.svg?style=for-the-badge)]()
[![Security: Sandboxed](https://img.shields.io/badge/Security-Untrusted%20Sandbox-6366f1.svg?style=for-the-badge)]()
[![Docker: Production Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge)](Dockerfile)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

<p align="center">
  <b>Write, compile, and publish LaTeX documents at lightspeed.</b><br>
  Instant 0ms SHA-256 caching, native PDF.js continuous 4K canvas rendering, verified non-overlapping TikZ geometry, and a world-class SaaS workspace.
</p>

[**Explore Live Demo**](#-quick-start) • [**Why Hyperleaf?**](#-why-hyperleaf-feature-comparison) • [**Architecture**](#-architecture--data-flow) • [**Deployment Guide**](#-deployment-guide) • [**Documentation**](#-api-endpoints)

</div>

---

## ⚡ Highlights

- **Full-Width SaaS Product Website & IDE**: A sleek, dark-mode landing experience that smoothly transitions into a pro-grade split-screen LaTeX IDE.
- **Instant 0ms Caching**: Two-tier caching system (Memory LRU + Persistent Disk SHA-256) returns repeated builds in sub-millisecond time.
- **Native PDF.js Canvas 4K Preview**: No clunky browser PDF plugins, no broken scrollbars, continuous multi-page rendering with dark paper mode support.
- **Certified Non-Overlapping TikZ Graphics**: Pre-configured templates with guaranteed clearance for flowcharts, neural networks, and scientific bar charts.
- **Multi-Document Workspace**: Manage multiple projects in local browser storage, with rename, duplicate, search (`Ctrl+K`), and 1-click ZIP export.
- **Interactive Formula Lab & Cheatsheet**: Copy math, TikZ, and formatting snippets into your editor with a single click.
- **Sandboxed Security**: Executes via Tectonic with `--untrusted` flag, preventing malicious `\write18` shell escapes and directory traversals.

---

## 🚀 Why Hyperleaf? (Feature Comparison)

| Feature | Hyperleaf v3.5 | Traditional TeX / Overleaf Free |
| :--- | :---: | :---: |
| **Recompile Speed (Cached)** | **⚡ 0ms Instant** (SHA-256 RAM + Disk LRU) | ⏱️ 4s – 15s (Cloud queue delays) |
| **Diagram Clearance & Geometry** | **✓ Verified non-overlapping TikZ/PGFPlots** | ❌ Manual coordinate guesswork |
| **PDF Rendering Engine** | **✓ Native PDF.js Canvas 4K with drop shadows** | ⚠️ Clunky iframe plugin / external viewer |
| **Local Offline & Privacy** | **✓ 100% Local & Self-Hosted** | ❌ Requires constant cloud connection |
| **Sandboxed Security** | **✓ `--untrusted` flag prevents `\write18` exploits** | ⚠️ Complex chroot setups |
| **Multi-Asset Uploads** | **✓ PNG, JPG, `.bib` with 1-click TeX snippet** | ⚠️ Manual upload and file linking |
| **1-Click ZIP Packaging** | **✓ Bundles source + figures + compiled PDF** | ⚠️ Multi-step export |
| **Interactive Cheatsheet** | **✓ Built-in click-to-copy LaTeX reference** | ❌ Separate browser tabs |

---

## 📐 Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client ["Client Browser (Modern Web Interface)"]
        UI["Hyperleaf Website Landing / Dashboard"] -->|Launch Studio| Editor["Ace Code Editor (LaTeX Mode)"]
        Editor -->|Auto-compile / Ctrl+Enter| ClientCache["Client Hash Cache"]
        ClientCache -->|Cache Miss| APIReq["POST /api/compile (JSON + Assets)"]
        PDFRenderer["Native PDF.js Multi-Page Canvas"] <--|Base64 PDF Stream| APIReq
    end

    subgraph Server ["Node.js Express Compiler Backend"]
        APIReq --> Security["Rate Limiter (60 req/min) & Security Headers"]
        Security --> HashCalc["SHA-256 Composite Hasher (Code + Assets)"]
        HashCalc --> MemCache{"In-Memory LRU Cache?"}
        MemCache -->|Hit 0ms| FastReturn["Return Cached PDF (<1ms)"]
        MemCache -->|Miss| DiskCache{"Disk Cache /cache/pdf?"}
        DiskCache -->|Hit 1ms| FastReturn
        DiskCache -->|Miss| Sandbox["Spawn Isolated Workspace (/tmp)"]
        Sandbox --> Tectonic["Tectonic Engine (--untrusted, XeTeX)"]
        Tectonic --> Parser["Error & Warning Diagnostics Parser"]
        Parser --> Storage["Save PDF to Cache & Disk"]
        Storage --> FastReturn
    end

    FastReturn --> PDFRenderer
```

---

## 🎨 Starter Template Suite

Hyperleaf comes with 8 pre-compiled, verified templates optimized for sub-millisecond switching:

1. **Modern ATS Resume**: Clean, professional single-page resume with ATS-friendly typography and compact margins.
2. **Process Workflow & Flowchart**: Orthogonal workflow routing with generous coordinate clearances (`below=1.2cm`, `right=2.4cm`) — guaranteed no overlapping boxes or lines.
3. **Performance Bar Chart**: Comparative grouped bar chart with legends positioned cleanly above plots without label collision.
4. **Scientific 2D & 3D Plots**: High-precision coordinate axes with damped oscillations and clean mathematical functions.
5. **Neural Network Architecture**: Multilayer perceptron (Input, Hidden, Output layers) with labeled weights and smooth visual nodes.
6. **Academic Research Paper**: Two-column IEEE/ACM-style research paper with abstract, section hierarchy, and BibTeX citation formatting.
7. **Beamer Slide Deck**: Modern conference presentation slides with progressive bullet reveals.
8. **Advanced Mathematics & Proofs**: Comprehensive mathematical formulas including Maxwell equations, Cauchy-Schwarz, and matrix algebra.

---

## 🛠️ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Tectonic](https://tectonic-typesetting.github.io/en-US/install.html) (pre-installed in `bin/` for Windows, or available via system PATH)

### 1. Clone the repository
```bash
git clone https://github.com/sumitsharma29/Hyperleaf.git
cd Hyperleaf
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the application
```bash
npm start
```

Visit `http://localhost:3000` in your browser.

---

## 🐳 Docker Deployment

The fastest way to deploy Hyperleaf in a production-ready, sandboxed container:

```bash
# Using Docker Compose (Recommended)
docker compose up -d --build
```

Or using Docker CLI:
```bash
docker build -t hyperleaf:latest .
docker run -d -p 3000:3000 -v hyperleaf_cache:/app/cache/pdf --name hyperleaf_app hyperleaf:latest
```

The container automatically:
- Installs the Linux x86_64 Tectonic binary with font dependencies (`fontconfig`, `harfbuzz`, `icu`).
- Runs as a non-privileged `node` user for security.
- Mounts a persistent volume for the SHA-256 PDF cache.

---

## 🌐 Deployment Guide

### Can I deploy directly to Netlify?

> [!IMPORTANT]
> **Summary on Netlify**: Netlify is a **static site / Jamstack** platform. Because compiling LaTeX requires executing the `tectonic` binary and spawning system subprocesses, **you cannot run the full compiler on Netlify's standard hosting alone**.
> 
> However, you have two great options:

### Option 1 (Recommended): 1-Click Deploy on Render / Railway / Fly.io
Deploy the containerized full-stack application (Website + Compiler API) for free or low-cost:

#### Deploy to Render:
1. Create a free account on [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/sumitsharma29/Hyperleaf.git`.
4. Render will automatically detect the `Dockerfile`.
5. Select **Docker** environment and click **Create Web Service**.
6. Render will build the container, install Tectonic, and provide a live URL (e.g., `https://hyperleaf.onrender.com`).

#### Deploy to Railway:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

### Option 2: Split Architecture (Netlify Frontend + Render Backend)
If you prefer hosting the frontend on Netlify:

1. **Deploy Backend**: Deploy the Docker container on Render or Railway (as shown in Option 1) to get an API URL like `https://hyperleaf-api.onrender.com`.
2. **Deploy Frontend on Netlify**:
   - In Netlify, link your GitHub repository.
   - Set **Publish directory** to `public`.
   - In `public/app.js`, set the compile API endpoint to point to your backend:
     ```javascript
     const API_BASE = window.location.hostname === 'localhost' ? '' : 'https://hyperleaf-api.onrender.com';
     // Fetch to `${API_BASE}/api/compile`
     ```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/compile` | `POST` | Compiles LaTeX code. Accepts `{ code, sessionId, force, assets }`. Returns base64 PDF and compiler diagnostics. |
| `/api/cancel` | `POST` | Cancels an ongoing compilation for an active `sessionId`. |
| `/api/health` | `GET` | Health check endpoint returning engine status and cache directory status. |
| `/api/cache/stats`| `GET` | Returns cache statistics (total files, size in MB, memory count). |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> / <kbd>Shift</kbd> + <kbd>Enter</kbd> | **Recompile PDF** |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | **Global Search Documents** |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Bold Text (`\textbf{...}`) |
| <kbd>Ctrl</kbd> + <kbd>I</kbd> | Italic Text (`\textit{...}`) |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Find & Replace in Editor |
| <kbd>Ctrl</kbd> + <kbd>/</kbd> | Toggle LaTeX Comment (`%`) |
| <kbd>Alt</kbd> + <kbd>Z</kbd> | Toggle Word Wrap |
| <kbd>?</kbd> | Show Keyboard Shortcuts Help |

---

## 🔒 Security Architecture

Hyperleaf implements defense-in-depth for untrusted LaTeX compilation:
1. **Isolated Execution**: Every compilation runs in a unique, ephemeral temporary directory in `/tmp` that is destroyed immediately upon completion.
2. **Untrusted Sandboxing**: Tectonic is invoked with `--untrusted` and `-c minimal`, forbidding shell escapes (`\write18`) and file-system traversal.
3. **Payload & Asset Sanitization**: Uploaded filenames are sanitized with strict alphanumeric regexes to prevent path traversal (`../`).
4. **Rate Limiting**: Sliding window rate limiting prevents abuse (60 requests/minute per client IP).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for researchers, academics, and developers worldwide.</sub>
</div>
