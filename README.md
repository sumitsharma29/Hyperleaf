# Hyperleaf

A lightweight, web-based LaTeX editor and real-time preview environment built with Node.js and the [Tectonic](https://tectonic-typesetting.github.io/) typesetting engine.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](Dockerfile)

---

## Features

- **Split-Pane Editor & Viewer**: Side-by-side editing with Ace Editor and live PDF rendering using PDF.js.
- **Fast Compilation**: Caching layer (in-memory LRU and disk-based SHA-256) speeds up repeated builds.
- **Sandboxed Execution**: Compiles via Tectonic with the `--untrusted` flag in isolated temporary directories.
- **Document Management**: Create, rename, duplicate, and organize multiple LaTeX documents saved in browser local storage.
- **Built-in Templates**: Pre-configured templates for resumes, research papers, presentation slides, TikZ diagrams, and mathematical notes.
- **Asset Support**: Upload and reference figures (`.png`, `.jpg`, `.pdf`) and bibliography files (`.bib`).
- **Export Options**: Download compiled PDF directly or export a full project ZIP archive containing source files and assets.

---

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Ace Editor, PDF.js
- **Backend**: Node.js, Express
- **Compiler**: Tectonic (XeTeX-compatible engine)
- **Containerization**: Docker, Docker Compose

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/)
- **Tectonic**:
  - **Windows**: A precompiled `tectonic.exe` is provided in the `bin/` directory.
  - **Linux / macOS**: Install Tectonic via your package manager or ensure it is available in your system `PATH`.
    ```bash
    # Ubuntu / Debian (via cargo or download from GitHub release)
    cargo install tectonic
    # macOS
    brew install tectonic
    ```

---

## Getting Started

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

Once started, open your browser and navigate to:
```
http://localhost:3000
```

---

## Docker Setup

To run Hyperleaf in an isolated container without installing local dependencies:

```bash
# Start with Docker Compose
docker compose up -d --build
```

Or build and run with the Docker CLI:

```bash
docker build -t hyperleaf .
docker run -d -p 3000:3000 -v hyperleaf_cache:/app/cache/pdf --name hyperleaf hyperleaf
```

The application will be accessible at `http://localhost:3000`.

---

## Project Structure

```text
Hyperleaf/
├── bin/                 # Local compiler binaries (e.g. tectonic.exe for Windows)
├── cache/               # Compiler PDF output and cache directory
├── public/              # Frontend client application
│   ├── app.js           # Client logic, editor handling, and PDF rendering
│   ├── index.html       # Application user interface
│   ├── style.css        # Application stylesheets
│   └── templates.js     # Starter templates catalog
├── server/              # Backend services
│   ├── compiler.js      # Tectonic execution, caching, and diagnostics parser
│   └── server.js        # Express API routes and server configuration
├── Dockerfile           # Production container definition
├── docker-compose.yml   # Multi-container orchestration config
├── package.json         # Node.js dependencies and run scripts
└── README.md            # Project documentation
```

---

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/compile` | Compiles LaTeX code. Accepts JSON payload `{ code, sessionId, force, assets }`. Returns base64-encoded PDF and compiler logs. |
| `POST` | `/api/cancel` | Cancels an ongoing compilation job for a given `sessionId`. |
| `GET` | `/api/templates` | Retrieves the list of available document templates. |
| `GET` | `/api/status` | Returns compiler engine readiness and cache capabilities. |
| `GET` | `/api/health` | Returns service health, uptime, and system memory metrics. |

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Compile document |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Search documents |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Insert bold formatting (`\textbf{}`) |
| <kbd>Ctrl</kbd> + <kbd>I</kbd> | Insert italic formatting (`\textit{}`) |
| <kbd>Ctrl</kbd> + <kbd>/</kbd> | Toggle comment |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Find and replace |
| <kbd>Alt</kbd> + <kbd>Z</kbd> | Toggle word wrap |

---

## Security Considerations

- **Untrusted Code Execution**: LaTeX compilation is executed with Tectonic's `--untrusted` mode, disabling shell escapes (`\write18`) and preventing arbitrary filesystem access.
- **Isolated Build Directories**: Every compilation occurs in a dedicated temporary workspace directory that is cleaned up after completion.
- **Rate Limiting**: Built-in sliding window rate limiter protects endpoints against request flooding.

---

## License

This project is licensed under the [MIT License](LICENSE).
