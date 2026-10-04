/**
 * LaTeX Studio Pro - Enterprise Production Client
 * High-performance, multi-project LaTeX IDE with multi-tier caching,
 * continuous PDF.js canvas rendering, asset uploads, outline navigation, and ZIP export.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Session & Global State
  const sessionId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  let currentTheme = localStorage.getItem('latex_theme') || 'dark';
  let isCompiling = false;
  let activeAbortController = null;
  let autoCompileTimer = null;
  let currentPdfDoc = null;
  let currentPdfBytes = null;
  let currentPdfBlobUrl = null;
  let currentZoom = 1.0;
  let isDarkPaper = false;
  let activeDiagTab = 'all';
  let lastCompileData = null;

  // In-memory client PDF cache: Map<codeHash, { pdfBytes, pdfBase64, log, duration, sizeBytes }>
  const clientPdfCache = new Map();

  // Configure PDF.js Worker
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const codeEditorEl = document.getElementById('codeEditor');
  const studioContainer = document.getElementById('studioContainer');
  const editorPane = document.getElementById('editorPane');
  const previewPane = document.getElementById('previewPane');
  const paneSplitter = document.getElementById('paneSplitter');
  const splitterShield = document.getElementById('splitterShield');

  // Navigation & View Mode
  let currentView = 'dashboard'; // 'dashboard' | 'studio'
  const dashboardView = document.getElementById('dashboardView');
  const tabNavDashboard = document.getElementById('tabNavDashboard');
  const tabNavStudio = document.getElementById('tabNavStudio');
  const btnBrandHome = document.getElementById('btnBrandHome');
  const websiteNavLinks = document.getElementById('websiteNavLinks');
  const btnHeaderLaunchStudio = document.getElementById('btnHeaderLaunchStudio');
  const btnBackToDashboard = document.getElementById('btnBackToDashboard');
  const btnBottomLaunchStudio = document.getElementById('btnBottomLaunchStudio');
  const projectSwitcherNav = document.getElementById('projectSwitcherNav');
  const studioHeaderActions = document.getElementById('studioHeaderActions');

  // Website Navigation Anchor Links
  const linkNavProjects = document.getElementById('linkNavProjects');
  const linkNavTemplates = document.getElementById('linkNavTemplates');
  const linkNavCheatsheet = document.getElementById('linkNavCheatsheet');
  const linkNavFeatures = document.getElementById('linkNavFeatures');

  // Dashboard / Website Specific Elements
  const btnHeroNewProject = document.getElementById('btnHeroNewProject');
  const btnHeroBrowseTemplates = document.getElementById('btnHeroBrowseTemplates');
  const btnHeroOpenStudio = document.getElementById('btnHeroOpenStudio');
  const metricTotalProjects = document.getElementById('metricTotalProjects');
  const sideBadgeTotalProjects = document.getElementById('sideBadgeTotalProjects');
  const dashboardProjectsGrid = document.getElementById('dashboardProjectsGrid');
  const dashboardTemplatesRow = document.getElementById('dashboardTemplatesRow');
  const btnDashNewProject = document.getElementById('btnDashNewProject');
  const btnDashViewAllTemplates = document.getElementById('btnDashViewAllTemplates');
  const dashSearchInput = document.getElementById('dashSearchInput');
  const btnDashSidebarNew = document.getElementById('btnDashSidebarNew');
  const sideNavAllProjects = document.getElementById('sideNavAllProjects');
  const sideNavTemplates = document.getElementById('sideNavTemplates');
  const sideNavCheatsheet = document.getElementById('sideNavCheatsheet');
  const sideNavTelemetry = document.getElementById('sideNavTelemetry');

  // Top Nav Elements
  const btnProjectMenu = document.getElementById('btnProjectMenu');
  const projectDropdownMenu = document.getElementById('projectDropdownMenu');
  const currentProjectTitle = document.getElementById('currentProjectTitle');
  const projectItemsList = document.getElementById('projectItemsList');
  const btnQuickNewProject = document.getElementById('btnQuickNewProject');
  const btnOpenProjectsModal = document.getElementById('btnOpenProjectsModal');
  const btnCompile = document.getElementById('btnCompile');
  const btnDownloadDropdown = document.getElementById('btnDownloadDropdown');
  const downloadDropdownMenu = document.getElementById('downloadDropdownMenu');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const btnExportTex = document.getElementById('btnExportTex');
  const btnExportZip = document.getElementById('btnExportZip');
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnShortcuts = document.getElementById('btnShortcuts');
  const btnOpenTemplates = document.getElementById('btnOpenTemplates');
  const btnOpenAssets = document.getElementById('btnOpenAssets');
  const assetCountBadge = document.getElementById('assetCountBadge');
  const btnOpenAi = document.getElementById('btnOpenAi');
  const chkAutoCompile = document.getElementById('chkAutoCompile');
  const enginePulse = document.getElementById('enginePulse');
  const engineStatusText = document.getElementById('engineStatusText');
  const speedBadge = document.getElementById('speedBadge');
  const speedBadgeText = document.getElementById('speedBadgeText');

  // Sidebars
  const outlineSidebar = document.getElementById('outlineSidebar');
  const btnToggleOutline = document.getElementById('btnToggleOutline');
  const btnCloseOutline = document.getElementById('btnCloseOutline');
  const outlineList = document.getElementById('outlineList');

  const assetsSidebar = document.getElementById('assetsSidebar');
  const btnCloseAssets = document.getElementById('btnCloseAssets');
  const assetDropzone = document.getElementById('assetDropzone');
  const assetFileInput = document.getElementById('assetFileInput');
  const assetsListContainer = document.getElementById('assetsListContainer');

  // Preview Elements
  const previewViewport = document.getElementById('previewViewport');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const pdfPagesContainer = document.getElementById('pdfPagesContainer');
  const compilingOverlay = document.getElementById('compilingOverlay');
  const compilingOverlayText = document.getElementById('compilingOverlayText');
  const btnCancelCompilation = document.getElementById('btnCancelCompilation');
  const previewStatusPill = document.getElementById('previewStatusPill');
  const previewStatusText = document.getElementById('previewStatusText');
  const docInfoText = document.getElementById('docInfoText');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnFitWidth = document.getElementById('btnFitWidth');
  const btnFitPage = document.getElementById('btnFitPage');
  const btnPaperTheme = document.getElementById('btnPaperTheme');
  const btnOpenNewTab = document.getElementById('btnOpenNewTab');
  const zoomLevelDisplay = document.getElementById('zoomLevelDisplay');
  const pageNavControls = document.getElementById('pageNavControls');
  const pageIndicator = document.getElementById('pageIndicator');
  const btnPrevPage = document.getElementById('btnPrevPage');
  const btnNextPage = document.getElementById('btnNextPage');

  // Editor Toolbar & Status
  const statusCursorPos = document.getElementById('statusCursorPos');
  const statusDocMetrics = document.getElementById('statusDocMetrics');
  const btnFormatBold = document.getElementById('btnFormatBold');
  const btnFormatItalic = document.getElementById('btnFormatItalic');
  const btnFormatMath = document.getElementById('btnFormatMath');
  const btnFormatComment = document.getElementById('btnFormatComment');
  const btnFontIncrease = document.getElementById('btnFontIncrease');
  const btnFontDecrease = document.getElementById('btnFontDecrease');
  const btnToggleWrap = document.getElementById('btnToggleWrap');
  const wrapStateText = document.getElementById('wrapStateText');
  const btnFindReplace = document.getElementById('btnFindReplace');
  const btnCopyCode = document.getElementById('btnCopyCode');
  const btnClearEditor = document.getElementById('btnClearEditor');

  // Diagnostics Drawer
  const diagnosticsDrawer = document.getElementById('diagnosticsDrawer');
  const diagnosticsHeader = document.getElementById('diagnosticsHeader');
  const diagnosticsContent = document.getElementById('diagnosticsContent');
  const diagnosticsChevron = document.getElementById('diagnosticsChevron');
  const errorCountBadge = document.getElementById('errorCountBadge');
  const warningCountBadge = document.getElementById('warningCountBadge');
  const compilerTimeLabel = document.getElementById('compilerTimeLabel');
  const diagnosticsTabs = document.getElementById('diagnosticsTabs');

  // Modals
  const projectsModal = document.getElementById('projectsModal');
  const btnCloseProjectsModal = document.getElementById('btnCloseProjectsModal');
  const btnCreateNewProjectModal = document.getElementById('btnCreateNewProjectModal');
  const projectsFullGrid = document.getElementById('projectsFullGrid');

  const templatesModal = document.getElementById('templatesModal');
  const btnCloseTemplates = document.getElementById('btnCloseTemplates');
  const templateSearchInput = document.getElementById('templateSearchInput');
  const templateCategoryFilters = document.getElementById('templateCategoryFilters');
  const templatesGrid = document.getElementById('templatesGridContainer');

  const aiModal = document.getElementById('aiModal');
  const btnCloseAi = document.getElementById('btnCloseAi');
  const btnCancelAi = document.getElementById('btnCancelAi');
  const btnGenerateAi = document.getElementById('btnGenerateAi');
  const aiPromptInput = document.getElementById('aiPromptInput');

  const shortcutsModal = document.getElementById('shortcutsModal');
  const btnCloseShortcuts = document.getElementById('btnCloseShortcuts');
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================================================
  // Multi-Project Management Engine
  // ==========================================================================
  let projects = [];
  let currentProjectId = null;

  function initProjects() {
    try {
      const stored = localStorage.getItem('latex_projects_v2');
      if (stored) {
        projects = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored projects, creating new registry:', e);
    }

    if (!Array.isArray(projects) || projects.length === 0) {
      // Create initial starter project with default Resume
      const initialCode = (window.LATEX_TEMPLATES && window.LATEX_TEMPLATES.resume)
        ? window.LATEX_TEMPLATES.resume.code
        : '\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}';

      const defaultProject = {
        id: 'proj_' + Date.now(),
        title: 'Modern ATS Resume',
        code: initialCode,
        assets: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      projects = [defaultProject];
      saveProjects();
    }

    // Set active project
    const lastActiveId = localStorage.getItem('latex_active_project_id');
    const existing = projects.find(p => p.id === lastActiveId);
    currentProjectId = existing ? existing.id : projects[0].id;
  }

  function saveProjects() {
    localStorage.setItem('latex_projects_v2', JSON.stringify(projects));
    localStorage.setItem('latex_active_project_id', currentProjectId);
    renderProjectList();
  }

  function getActiveProject() {
    return projects.find(p => p.id === currentProjectId) || projects[0];
  }

  function switchProject(id) {
    // Save current editor state to current project first
    const current = getActiveProject();
    if (current) {
      current.code = editor.getValue();
      current.updatedAt = Date.now();
    }

    currentProjectId = id;
    saveProjects();

    const nextProj = getActiveProject();
    if (nextProj) {
      currentProjectTitle.textContent = nextProj.title;
      editor.setValue(nextProj.code || '', -1);
      renderAssetsList();
      updateOutline();
      showToast(`Switched to "${nextProj.title}"`, 'info');
      compileLatex({ force: false });
    }
  }

  function createNewProject(title = 'Untitled Document', code = null) {
    const newCode = code !== null
      ? code
      : '\\documentclass{article}\n\\usepackage{amsmath}\n\n\\begin{document}\n\\section{Introduction}\nWrite your content here...\n\\end{document}';

    const newProj = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: title.trim() || 'Untitled Document',
      code: newCode,
      assets: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    projects.unshift(newProj);
    saveProjects();
    switchProject(newProj.id);
  }

  function duplicateProject(id) {
    const orig = projects.find(p => p.id === id);
    if (!orig) return;

    const copy = {
      id: 'proj_' + Date.now(),
      title: `${orig.title} (Copy)`,
      code: orig.code,
      assets: JSON.parse(JSON.stringify(orig.assets || [])),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    projects.unshift(copy);
    saveProjects();
    showToast(`Duplicated "${orig.title}"`, 'success');
    renderProjectsModalGrid();
  }

  function renameProject(id) {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const newTitle = prompt('Enter new project title:', proj.title);
    if (newTitle && newTitle.trim()) {
      proj.title = newTitle.trim();
      proj.updatedAt = Date.now();
      saveProjects();
      if (proj.id === currentProjectId) {
        currentProjectTitle.textContent = proj.title;
      }
      showToast('Project renamed', 'success');
      renderProjectsModalGrid();
    }
  }

  function deleteProject(id) {
    if (projects.length <= 1) {
      showToast('Cannot delete the only project in your workspace', 'error');
      return;
    }
    const proj = projects.find(p => p.id === id);
    if (!proj) return;

    if (confirm(`Are you sure you want to delete "${proj.title}"?`)) {
      projects = projects.filter(p => p.id !== id);
      if (currentProjectId === id) {
        currentProjectId = projects[0].id;
      }
      saveProjects();
      switchProject(currentProjectId);
      showToast('Project deleted', 'info');
      renderProjectsModalGrid();
    }
  }

  function renderProjectList() {
    projectItemsList.innerHTML = '';
    const active = getActiveProject();
    if (active) currentProjectTitle.textContent = active.title;

    projects.forEach(p => {
      const item = document.createElement('div');
      item.className = `project-item ${p.id === currentProjectId ? 'active' : ''}`;
      item.innerHTML = `
        <span class="project-item-title">
          <i class="fa-solid fa-file-lines" style="color: ${p.id === currentProjectId ? 'var(--accent-primary)' : 'var(--text-dim)'};"></i>
          <span>${escapeHtml(p.title)}</span>
        </span>
        <span style="font-size: 0.68rem; color: var(--text-dim);">${formatRelativeTime(p.updatedAt)}</span>
      `;
      item.addEventListener('click', () => {
        projectDropdownMenu.classList.remove('active');
        if (p.id !== currentProjectId) {
          switchProject(p.id);
        }
      });
      projectItemsList.appendChild(item);
    });
  }

  function renderProjectsModalGrid() {
    projectsFullGrid.innerHTML = '';
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = `project-card ${p.id === currentProjectId ? 'active' : ''}`;
      const assetCount = (p.assets || []).length;
      const lineCount = (p.code || '').split('\n').length;

      card.innerHTML = `
        <div class="project-card-header">
          <div class="project-card-title">${escapeHtml(p.title)}</div>
          ${p.id === currentProjectId ? '<span class="card-badge" style="background: rgba(99,102,241,0.2); color: #818cf8;">Active</span>' : ''}
        </div>
        <div class="project-card-meta">
          <span>${lineCount} lines • ${assetCount} asset(s)</span><br>
          <span>Updated ${formatRelativeTime(p.updatedAt)}</span>
        </div>
        <div class="project-card-actions">
          <button class="btn btn-sm btn-primary btn-open-p" style="flex: 1;">Open</button>
          <button class="btn btn-sm btn-secondary btn-rename-p" title="Rename"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-secondary btn-dup-p" title="Duplicate"><i class="fa-solid fa-copy"></i></button>
          <button class="btn btn-sm btn-secondary btn-del-p" title="Delete"><i class="fa-solid fa-trash-can" style="color: var(--accent-danger);"></i></button>
        </div>
      `;

      card.querySelector('.btn-open-p').addEventListener('click', () => {
        projectsModal.classList.remove('active');
        switchProject(p.id);
      });
      card.querySelector('.btn-rename-p').addEventListener('click', () => renameProject(p.id));
      card.querySelector('.btn-dup-p').addEventListener('click', () => duplicateProject(p.id));
      card.querySelector('.btn-del-p').addEventListener('click', () => deleteProject(p.id));

      projectsFullGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // View Switcher (Dashboard / Website vs Studio IDE)
  // ==========================================================================
  function switchView(view) {
    currentView = view;
    if (view === 'dashboard') {
      if (dashboardView) dashboardView.style.display = 'block';
      if (studioContainer) studioContainer.style.display = 'none';
      if (studioHeaderActions) studioHeaderActions.style.display = 'none';
      if (projectSwitcherNav) projectSwitcherNav.style.display = 'none';
      if (websiteNavLinks) websiteNavLinks.style.display = 'flex';
      if (btnHeaderLaunchStudio) btnHeaderLaunchStudio.style.display = 'inline-flex';
      if (tabNavDashboard) tabNavDashboard.classList.add('active');
      if (tabNavStudio) tabNavStudio.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderDashboard(dashSearchInput ? dashSearchInput.value : '');
    } else {
      if (dashboardView) dashboardView.style.display = 'none';
      if (studioContainer) studioContainer.style.display = 'flex';
      if (studioHeaderActions) studioHeaderActions.style.display = 'flex';
      if (projectSwitcherNav) projectSwitcherNav.style.display = 'block';
      if (websiteNavLinks) websiteNavLinks.style.display = 'none';
      if (btnHeaderLaunchStudio) btnHeaderLaunchStudio.style.display = 'none';
      if (tabNavStudio) tabNavStudio.classList.add('active');
      if (tabNavDashboard) tabNavDashboard.classList.remove('active');
      if (typeof editor !== 'undefined' && editor) {
        editor.resize();
        editor.focus();
      }
      renderCurrentPdfPages();
    }
  }

  // Active cheatsheet category & data
  let activeCheatsheetCategory = 'math';
  const CHEATSHEET_DATA = {
    math: [
      { title: 'Fraction', code: '\\frac{a}{b}' },
      { title: 'Square Root', code: '\\sqrt{x}' },
      { title: 'Definite Integral', code: '\\int_{a}^{b} f(x)\\,dx' },
      { title: 'Summation', code: '\\sum_{i=1}^{n} x_i' },
      { title: 'Limit', code: '\\lim_{x \\to \\infty} f(x)' },
      { title: '2x2 Matrix', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
      { title: 'Partial Derivative', code: '\\frac{\\partial f}{\\partial x}' },
      { title: 'Greek Symbols', code: '\\alpha, \\beta, \\gamma, \\theta, \\lambda, \\sigma' }
    ],
    tikz: [
      { title: 'Directed Arrow', code: '\\draw[thick, ->] (0,0) -- (3,0);' },
      { title: 'Rounded Box Node', code: '\\node[draw, rounded corners] (a) {Block};' },
      { title: 'PGFPlots 2D Curve', code: '\\begin{axis} \\addplot {x^2}; \\end{axis}' },
      { title: 'Colored Circle', code: '\\fill[blue!20] (0,0) circle (1cm);' },
      { title: 'Orthogonal Route', code: '\\draw[->] (a) -| (b);' },
      { title: 'Grid Canvas', code: '\\draw[step=1cm,gray!30] (-2,-2) grid (2,2);' }
    ],
    tables: [
      { title: 'Bordered Table', code: '\\begin{tabular}{|c|c|}\\hline A & B \\\\\\hline\\end{tabular}' },
      { title: 'Multi-line Align', code: '\\begin{align} f(x) &= 2x + 1 \\\\ g(x) &= x^2 \\end{align}' },
      { title: 'Bullet Itemize', code: '\\begin{itemize}\\item First\\item Second\\end{itemize}' },
      { title: 'Numbered Enumerate', code: '\\begin{enumerate}\\item Step 1\\item Step 2\\end{enumerate}' },
      { title: 'Equation Block', code: '\\begin{equation} E = mc^2 \\end{equation}' }
    ],
    format: [
      { title: 'Bold Text', code: '\\textbf{bold text}' },
      { title: 'Italic Text', code: '\\textit{italic text}' },
      { title: 'Section Header', code: '\\section{Section Title}' },
      { title: 'Subsection Header', code: '\\subsection{Subsection Title}' },
      { title: 'Citation Reference', code: '\\cite{reference_key}' },
      { title: 'Hyperlink', code: '\\href{https://example.com}{Link Text}' }
    ]
  };

  async function exportProjectZip(project) {
    if (typeof JSZip === 'undefined') {
      showToast('ZIP library not loaded', 'error');
      return;
    }
    const proj = project || getActiveProject();
    if (!proj) return;
    const baseName = (proj.title || 'latex_project').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const zip = new JSZip();
    zip.file('main.tex', proj.code || '');

    if (proj.id === currentProjectId && currentPdfBytes) {
      zip.file('document.pdf', currentPdfBytes);
    }

    const assets = proj.assets || [];
    assets.forEach(a => {
      const cleanBase64 = a.base64.replace(/^data:[^;]+;base64,/, '');
      zip.file(a.name, cleanBase64, { base64: true });
    });

    try {
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${baseName}_bundle.zip`, 'success');
    } catch (e) {
      showToast('Error generating ZIP: ' + e.message, 'error');
    }
  }

  function renderDashboard(searchQuery = '') {
    const totalProjects = projects.length;
    metricTotalProjects.textContent = totalProjects;
    if (sideBadgeTotalProjects) sideBadgeTotalProjects.textContent = totalProjects;

    // Filter projects by search query
    const q = (searchQuery || '').trim().toLowerCase();
    const filteredProjects = q
      ? projects.filter(p => p.title.toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q))
      : projects;

    // Render Recent Projects Grid
    dashboardProjectsGrid.innerHTML = '';
    if (filteredProjects.length === 0) {
      dashboardProjectsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: var(--radius-md); color: var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 12px; color: var(--text-dim);"></i>
          <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">No matching documents found</p>
          <p style="font-size: 0.78rem; margin-top: 4px;">Try searching for another keyword or create a new document.</p>
        </div>
      `;
    } else {
      filteredProjects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'dash-project-card';
        const assetCount = (p.assets || []).length;
        const lineCount = (p.code || '').split('\n').length;
        const wordCount = (p.code || '').trim().split(/\s+/).filter(Boolean).length;

        // Auto-detect project category badge
        let badgeType = 'Document';
        let badgeColor = 'rgba(99, 102, 241, 0.15)';
        let badgeTextColor = '#818cf8';
        const codeLower = (p.code || '').toLowerCase();
        if (codeLower.includes('tikzpicture') || codeLower.includes('flowchart')) {
          badgeType = 'TikZ Diagram';
          badgeColor = 'rgba(6, 182, 212, 0.15)';
          badgeTextColor = '#06b6d4';
        } else if (codeLower.includes('resume') || codeLower.includes('experience')) {
          badgeType = 'Resume / CV';
          badgeColor = 'rgba(16, 185, 129, 0.15)';
          badgeTextColor = '#10b981';
        } else if (codeLower.includes('pgfplots') || codeLower.includes('barchart') || codeLower.includes('axis')) {
          badgeType = 'Plots & Charts';
          badgeColor = 'rgba(245, 158, 11, 0.15)';
          badgeTextColor = '#f59e0b';
        } else if (codeLower.includes('abstract') || codeLower.includes('ieee') || codeLower.includes('acmart')) {
          badgeType = 'Academic Paper';
          badgeColor = 'rgba(168, 85, 247, 0.15)';
          badgeTextColor = '#a855f7';
        }

        card.innerHTML = `
          <div class="dash-project-top">
            <div class="dash-project-icon"><i class="fa-solid fa-file-lines"></i></div>
            <span class="card-badge" style="background: ${badgeColor}; color: ${badgeTextColor}; font-weight: 700;">${badgeType}</span>
          </div>
          <div>
            <div class="dash-project-title" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</div>
            <div class="dash-project-meta">${lineCount} lines • ${wordCount.toLocaleString()} words • ${assetCount} asset(s) • ${formatRelativeTime(p.updatedAt)}</div>
          </div>
          <div class="dash-project-actions">
            <button class="btn btn-sm btn-primary btn-dash-open" style="flex: 1;" title="Open in Studio">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Open Studio
            </button>
            <button class="btn btn-sm btn-secondary btn-dash-rename" title="Rename Document">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-secondary btn-dash-dup" title="Duplicate Document">
              <i class="fa-solid fa-copy"></i>
            </button>
            <button class="btn btn-sm btn-secondary btn-dash-zip" title="Export Project ZIP">
              <i class="fa-solid fa-file-zipper" style="color: var(--accent-success);"></i>
            </button>
            <button class="btn btn-sm btn-secondary btn-dash-del" title="Delete Document">
              <i class="fa-solid fa-trash-can" style="color: var(--accent-danger);"></i>
            </button>
          </div>
        `;

        card.querySelector('.btn-dash-open').addEventListener('click', (e) => {
          e.stopPropagation();
          switchProject(p.id);
          switchView('studio');
        });

        card.querySelector('.btn-dash-rename').addEventListener('click', (e) => {
          e.stopPropagation();
          renameProject(p.id);
          renderDashboard(dashSearchInput ? dashSearchInput.value : '');
        });

        card.querySelector('.btn-dash-dup').addEventListener('click', (e) => {
          e.stopPropagation();
          duplicateProject(p.id);
          renderDashboard(dashSearchInput ? dashSearchInput.value : '');
        });

        card.querySelector('.btn-dash-zip').addEventListener('click', (e) => {
          e.stopPropagation();
          exportProjectZip(p);
        });

        card.querySelector('.btn-dash-del').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteProject(p.id);
          renderDashboard(dashSearchInput ? dashSearchInput.value : '');
        });

        card.addEventListener('click', () => {
          switchProject(p.id);
          switchView('studio');
        });

        dashboardProjectsGrid.appendChild(card);
      });
    }

    // Render Featured Templates Row
    dashboardTemplatesRow.innerHTML = '';
    const templateKeys = ['resume', 'flowchart', 'barchart', 'graph2d', 'neuralnet', 'academic', 'beamer', 'equations'];
    templateKeys.forEach(key => {
      const tmpl = window.LATEX_TEMPLATES && window.LATEX_TEMPLATES[key];
      if (!tmpl) return;

      const card = document.createElement('div');
      card.className = 'dash-template-card';
      card.innerHTML = `
        <div class="card-top">
          <div class="card-icon"><i class="fa-solid ${tmpl.icon}"></i></div>
          <span class="card-badge">${tmpl.badge}</span>
        </div>
        <h4>${tmpl.title}</h4>
        <p>${tmpl.description}</p>
        <div class="card-action">
          <span>Launch Template</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      `;

      card.addEventListener('click', () => {
        createNewProject(tmpl.title, tmpl.code);
        switchView('studio');
        showToast(`Created project from "${tmpl.title}"`, 'success');
      });

      dashboardTemplatesRow.appendChild(card);
    });

    // Render LaTeX Cheatsheet Snippets
    renderCheatsheetGrid();
  }

  function renderCheatsheetGrid() {
    const container = document.getElementById('cheatsheetSnippetsGrid');
    if (!container) return;
    container.innerHTML = '';

    const snippets = CHEATSHEET_DATA[activeCheatsheetCategory] || CHEATSHEET_DATA.math;
    snippets.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'cs-chip';
      chip.title = 'Click to copy snippet';
      chip.innerHTML = `
        <div class="cs-chip-info">
          <span class="cs-chip-title">${item.title}</span>
          <code class="cs-chip-code">${escapeHtml(item.code)}</code>
        </div>
        <i class="fa-regular fa-copy cs-chip-copy"></i>
      `;

      chip.addEventListener('click', () => {
        navigator.clipboard.writeText(item.code).then(() => {
          showToast(`Copied snippet: ${item.code}`, 'success');
        }).catch(() => {
          showToast(`Snippet: ${item.code}`, 'info');
        });
      });

      container.appendChild(chip);
    });
  }

  // Cheatsheet category tab events
  const cheatsheetCategoryTabs = document.getElementById('cheatsheetCategoryTabs');
  if (cheatsheetCategoryTabs) {
    cheatsheetCategoryTabs.querySelectorAll('.cs-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        cheatsheetCategoryTabs.querySelectorAll('.cs-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCheatsheetCategory = tab.getAttribute('data-cat') || 'math';
        renderCheatsheetGrid();
      });
    });
  }

  // Dashboard Search & Sidebar Navigation Listeners
  if (dashSearchInput) {
    dashSearchInput.addEventListener('input', () => {
      renderDashboard(dashSearchInput.value);
    });
  }

  if (btnDashSidebarNew) {
    btnDashSidebarNew.addEventListener('click', () => {
      const title = prompt('Enter document title:', 'Untitled Document');
      if (title && title.trim()) {
        createNewProject(title);
        switchView('studio');
      }
    });
  }

  if (sideNavAllProjects) {
    sideNavAllProjects.addEventListener('click', () => {
      const sec = document.getElementById('sectionProjects');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (sideNavTemplates) {
    sideNavTemplates.addEventListener('click', () => {
      const sec = document.getElementById('sectionTemplates');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (sideNavCheatsheet) {
    sideNavCheatsheet.addEventListener('click', () => {
      const sec = document.getElementById('sectionCheatsheet');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (sideNavTelemetry) {
    sideNavTelemetry.addEventListener('click', () => {
      showToast('Tectonic XeTeX Sandbox: Healthy • 0ms Cache Active', 'info');
    });
  }

  // Global Ctrl+K / Cmd+K shortcut
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (currentView !== 'dashboard') {
        switchView('dashboard');
      }
      if (dashSearchInput) {
        dashSearchInput.focus();
        dashSearchInput.select();
      }
    }
  });

  // Dashboard / Website Navigation & CTA Listeners
  if (tabNavDashboard) tabNavDashboard.addEventListener('click', () => switchView('dashboard'));
  if (tabNavStudio) tabNavStudio.addEventListener('click', () => switchView('studio'));
  if (btnBrandHome) btnBrandHome.addEventListener('click', () => switchView('dashboard'));

  // Studio launch buttons from Website
  if (btnHeaderLaunchStudio) btnHeaderLaunchStudio.addEventListener('click', () => switchView('studio'));
  if (btnHeroOpenStudio) btnHeroOpenStudio.addEventListener('click', () => switchView('studio'));
  if (btnBottomLaunchStudio) btnBottomLaunchStudio.addEventListener('click', () => switchView('studio'));
  if (btnBackToDashboard) btnBackToDashboard.addEventListener('click', () => switchView('dashboard'));

  // Smooth scroll navigation links
  if (linkNavProjects) {
    linkNavProjects.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentView !== 'dashboard') switchView('dashboard');
      const sec = document.getElementById('sectionProjects');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (linkNavTemplates) {
    linkNavTemplates.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentView !== 'dashboard') switchView('dashboard');
      const sec = document.getElementById('sectionTemplates');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (linkNavCheatsheet) {
    linkNavCheatsheet.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentView !== 'dashboard') switchView('dashboard');
      const sec = document.getElementById('sectionCheatsheet');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (linkNavFeatures) {
    linkNavFeatures.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentView !== 'dashboard') switchView('dashboard');
      const sec = document.getElementById('sectionFeatures');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnHeroNewProject) {
    btnHeroNewProject.addEventListener('click', () => {
      const title = prompt('Enter document title:', 'New Research Document');
      if (title && title.trim()) {
        createNewProject(title);
        switchView('studio');
      }
    });
  }

  if (btnHeroBrowseTemplates) {
    btnHeroBrowseTemplates.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = document.getElementById('sectionTemplates');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnDashNewProject) {
    btnDashNewProject.addEventListener('click', () => {
      const title = prompt('Enter document title:', 'New Project');
      if (title && title.trim()) {
        createNewProject(title);
        switchView('studio');
      }
    });
  }

  if (btnDashViewAllTemplates) {
    btnDashViewAllTemplates.addEventListener('click', () => {
      templateSearchInput.value = '';
      renderTemplates('all');
      templatesModal.classList.add('active');
    });
  }

  // Project Dropdown Events
  btnProjectMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = projectDropdownMenu.classList.contains('active');
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    if (!isActive) projectDropdownMenu.classList.add('active');
  });

  btnQuickNewProject.addEventListener('click', () => {
    projectDropdownMenu.classList.remove('active');
    const title = prompt('Enter new project title:', 'Untitled Document');
    if (title && title.trim()) createNewProject(title);
  });

  btnOpenProjectsModal.addEventListener('click', () => {
    projectDropdownMenu.classList.remove('active');
    renderProjectsModalGrid();
    projectsModal.classList.add('active');
  });

  btnCreateNewProjectModal.addEventListener('click', () => {
    const title = prompt('Enter new project title:', 'New Research Document');
    if (title && title.trim()) {
      createNewProject(title);
      renderProjectsModalGrid();
    }
  });

  btnCloseProjectsModal.addEventListener('click', () => {
    projectsModal.classList.remove('active');
  });

  // Export Dropdown
  btnDownloadDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = downloadDropdownMenu.classList.contains('active');
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
    if (!isActive) downloadDropdownMenu.classList.add('active');
  });

  // Studio View Controls: Layout Splitter
  const btnViewEditorOnly = document.getElementById('btnViewEditorOnly');
  const btnViewSplit = document.getElementById('btnViewSplit');
  const btnViewPdfOnly = document.getElementById('btnViewPdfOnly');

  function setStudioLayout(mode) {
    // mode: 'editor' | 'split' | 'pdf'
    [btnViewEditorOnly, btnViewSplit, btnViewPdfOnly].forEach(b => { if (b) b.classList.remove('active'); });
    if (mode === 'editor') {
      if (btnViewEditorOnly) btnViewEditorOnly.classList.add('active');
      editorPane.style.display = 'flex';
      editorPane.style.width = '100%';
      previewPane.style.display = 'none';
      paneSplitter.style.display = 'none';
    } else if (mode === 'pdf') {
      if (btnViewPdfOnly) btnViewPdfOnly.classList.add('active');
      editorPane.style.display = 'none';
      previewPane.style.display = 'flex';
      previewPane.style.width = '100%';
      paneSplitter.style.display = 'none';
    } else {
      if (btnViewSplit) btnViewSplit.classList.add('active');
      editorPane.style.display = 'flex';
      editorPane.style.width = '50%';
      previewPane.style.display = 'flex';
      previewPane.style.width = '50%';
      paneSplitter.style.display = 'flex';
    }
    if (typeof editor !== 'undefined' && editor) editor.resize();
    renderCurrentPdfPages();
  }

  if (btnViewEditorOnly) btnViewEditorOnly.addEventListener('click', () => setStudioLayout('editor'));
  if (btnViewSplit) btnViewSplit.addEventListener('click', () => setStudioLayout('split'));
  if (btnViewPdfOnly) btnViewPdfOnly.addEventListener('click', () => setStudioLayout('pdf'));

  // ==========================================================================
  // Initialize Ace Code Editor
  // ==========================================================================
  let editorFontSize = 13.5;
  const editor = ace.edit(codeEditorEl, {
    mode: 'ace/mode/latex',
    theme: currentTheme === 'dark' ? 'ace/theme/dracula' : 'ace/theme/chrome',
    fontSize: `${editorFontSize}px`,
    wrap: true,
    showPrintMargin: false,
    scrollPastEnd: 0.8,
    tabSize: 2,
    useSoftTabs: true,
    behavioursEnabled: true,
    autoScrollEditorIntoView: true
  });

  // Apply Theme
  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('latex_theme', theme);
    editor.setTheme(theme === 'dark' ? 'ace/theme/dracula' : 'ace/theme/chrome');
    const icon = btnThemeToggle.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-moon';
    } else {
      icon.className = 'fa-solid fa-sun';
    }
  }
  applyTheme(currentTheme);

  btnThemeToggle.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Boot Projects Engine and Load Active Project
  initProjects();
  const initialProject = getActiveProject();
  currentProjectTitle.textContent = initialProject.title;
  editor.setValue(initialProject.code || '', -1);

  // Status Bar Metrics
  function updateEditorMetrics() {
    const pos = editor.getCursorPosition();
    statusCursorPos.innerHTML = `<i class="fa-regular fa-compass"></i> Ln ${pos.row + 1}, Col ${pos.column + 1}`;

    const code = editor.getValue();
    const chars = code.length;
    const lines = editor.session.getLength();
    const words = code.trim().length === 0 ? 0 : code.trim().split(/\s+/).length;
    statusDocMetrics.textContent = `${chars.toLocaleString()} chars • ${lines} lines • ${words.toLocaleString()} words`;
  }

  editor.selection.on('changeCursor', updateEditorMetrics);
  updateEditorMetrics();

  // Code change listener
  editor.session.on('change', () => {
    const active = getActiveProject();
    if (active) {
      active.code = editor.getValue();
      active.updatedAt = Date.now();
      saveProjects();
    }
    updateEditorMetrics();
    updateOutline();

    if (chkAutoCompile.checked) {
      clearTimeout(autoCompileTimer);
      autoCompileTimer = setTimeout(() => {
        compileLatex({ isAuto: true });
      }, 1500);
    }
  });

  // Editor Toolbar Formatting Helpers
  function wrapSelection(before, after) {
    const selected = editor.getSelectedText();
    if (selected) {
      editor.insert(`${before}${selected}${after}`);
    } else {
      const pos = editor.getCursorPosition();
      editor.insert(`${before}${after}`);
      editor.moveCursorTo(pos.row, pos.column + before.length);
    }
    editor.focus();
  }

  btnFormatBold.addEventListener('click', () => wrapSelection('\\textbf{', '}'));
  btnFormatItalic.addEventListener('click', () => wrapSelection('\\textit{', '}'));
  btnFormatMath.addEventListener('click', () => wrapSelection('$', '$'));
  btnFormatComment.addEventListener('click', () => {
    editor.toggleCommentLines();
    editor.focus();
  });

  btnFontIncrease.addEventListener('click', () => {
    editorFontSize = Math.min(24, editorFontSize + 1);
    editor.setFontSize(`${editorFontSize}px`);
  });

  btnFontDecrease.addEventListener('click', () => {
    editorFontSize = Math.max(10, editorFontSize - 1);
    editor.setFontSize(`${editorFontSize}px`);
  });

  let isWrapEnabled = true;
  btnToggleWrap.addEventListener('click', () => {
    isWrapEnabled = !isWrapEnabled;
    editor.session.setUseWrapMode(isWrapEnabled);
    wrapStateText.textContent = isWrapEnabled ? 'Wrap' : 'No Wrap';
    showToast(isWrapEnabled ? 'Word wrap enabled' : 'Word wrap disabled', 'info');
  });

  btnFindReplace.addEventListener('click', () => {
    editor.execCommand('find');
  });

  btnCopyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
      showToast('LaTeX source copied to clipboard', 'info');
    });
  });

  btnClearEditor.addEventListener('click', () => {
    if (confirm('Clear entire LaTeX document?')) {
      editor.setValue('', -1);
      editor.focus();
      showToast('Editor cleared', 'info');
    }
  });

  // Math & Env Dropdowns
  function setupDropdown(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = menu.classList.contains('active');
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
      if (!isActive) menu.classList.add('active');
    });

    menu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const snippet = item.getAttribute('data-insert');
        if (snippet) {
          editor.insert(snippet);
          editor.focus();
        }
        menu.classList.remove('active');
      });
    });
  }

  setupDropdown('btnMathDropdown', 'mathDropdownMenu');
  setupDropdown('btnEnvDropdown', 'envDropdownMenu');

  window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('active'));
  });

  // ==========================================================================
  // Splitter Resizer (With Drag Shield)
  // ==========================================================================
  let isResizing = false;

  paneSplitter.addEventListener('mousedown', (e) => {
    isResizing = true;
    paneSplitter.classList.add('resizing');
    splitterShield.classList.add('active');
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = studioContainer.getBoundingClientRect();
    const minWidth = 280;
    const newLeftWidth = e.clientX - containerRect.left;
    const newRightWidth = containerRect.width - newLeftWidth - paneSplitter.offsetWidth;

    if (newLeftWidth >= minWidth && newRightWidth >= minWidth) {
      const leftPercent = (newLeftWidth / containerRect.width) * 100;
      editorPane.style.width = `${leftPercent}%`;
      previewPane.style.width = `${100 - leftPercent}%`;
      editor.resize();
    }
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      paneSplitter.classList.remove('resizing');
      splitterShield.classList.remove('active');
      document.body.style.userSelect = '';
      editor.resize();
      renderCurrentPdfPages();
    }
  });

  paneSplitter.addEventListener('dblclick', () => {
    editorPane.style.width = '50%';
    previewPane.style.width = '50%';
    editor.resize();
    renderCurrentPdfPages();
    showToast('Layout reset to 50/50', 'info');
  });

  // ==========================================================================
  // Document Outline / Table of Contents Tree
  // ==========================================================================
  function updateOutline() {
    const code = editor.getValue();
    const lines = code.split('\n');
    const sections = [];

    const sectionRegex = /\\(part|chapter|section|subsection|subsubsection)\*?\{([^}]+)\}/;

    lines.forEach((line, index) => {
      const match = line.match(sectionRegex);
      if (match) {
        sections.push({
          type: match[1],
          title: match[2].trim(),
          line: index + 1
        });
      }
    });

    if (sections.length === 0) {
      outlineList.innerHTML = '<div class="empty-outline-hint">No \\section or \\chapter headings found.</div>';
      return;
    }

    outlineList.innerHTML = sections.map(s => {
      let depthClass = 'depth-1';
      let icon = 'fa-heading';
      if (s.type === 'subsection') { depthClass = 'depth-2'; icon = 'fa-angle-right'; }
      if (s.type === 'subsubsection') { depthClass = 'depth-3'; icon = 'fa-ellipsis'; }

      return `
        <div class="outline-item ${depthClass}" data-line="${s.line}">
          <i class="fa-solid ${icon}"></i>
          <span>${escapeHtml(s.title)}</span>
        </div>
      `;
    }).join('');

    outlineList.querySelectorAll('.outline-item').forEach(item => {
      item.addEventListener('click', () => {
        const line = parseInt(item.getAttribute('data-line'), 10);
        if (line) {
          editor.gotoLine(line, 0, true);
          editor.focus();
        }
      });
    });
  }

  btnToggleOutline.addEventListener('click', () => {
    outlineSidebar.classList.toggle('active');
    assetsSidebar.classList.remove('active');
    updateOutline();
  });

  btnCloseOutline.addEventListener('click', () => {
    outlineSidebar.classList.remove('active');
  });

  // ==========================================================================
  // Project Assets & Image Upload Engine
  // ==========================================================================
  function renderAssetsList() {
    const project = getActiveProject();
    const assets = project.assets || [];

    if (assets.length > 0) {
      assetCountBadge.style.display = 'inline-block';
      assetCountBadge.textContent = assets.length;
    } else {
      assetCountBadge.style.display = 'none';
    }

    if (assets.length === 0) {
      assetsListContainer.innerHTML = '<div style="text-align: center; color: var(--text-dim); font-size: 0.74rem; padding: 12px;">No assets in project yet. Drop files above.</div>';
      return;
    }

    assetsListContainer.innerHTML = assets.map((a, idx) => {
      const isImg = a.type.startsWith('image/');
      const icon = isImg ? 'fa-file-image' : 'fa-file-lines';

      return `
        <div class="asset-card" data-idx="${idx}">
          ${isImg ? `<img src="${a.base64}" class="asset-preview-thumb" alt="${escapeHtml(a.name)}">` : `<i class="fa-solid ${icon}" style="font-size: 1.5rem; color: var(--accent-primary);"></i>`}
          <div class="asset-info">
            <div class="asset-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</div>
            <div class="asset-meta">${(a.size / 1024).toFixed(1)} KB</div>
          </div>
          <div class="asset-actions">
            <button class="btn-asset-action btn-insert-asset" title="Insert \\includegraphics{...} into editor">
              <i class="fa-solid fa-arrow-turn-down" style="transform: rotate(90deg);"></i>
            </button>
            <button class="btn-asset-action delete btn-delete-asset" title="Remove asset">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    assetsListContainer.querySelectorAll('.btn-insert-asset').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const asset = assets[idx];
        if (asset.type.startsWith('image/')) {
          editor.insert(`\\includegraphics[width=0.75\\textwidth]{${asset.name}}\n`);
        } else {
          editor.insert(`\\input{${asset.name}}\n`);
        }
        editor.focus();
        showToast(`Inserted reference for ${asset.name}`, 'info');
      });
    });

    assetsListContainer.querySelectorAll('.btn-delete-asset').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const asset = assets[idx];
        if (confirm(`Remove asset "${asset.name}" from project?`)) {
          project.assets.splice(idx, 1);
          saveProjects();
          renderAssetsList();
          showToast(`Removed ${asset.name}`, 'info');
        }
      });
    });
  }

  function handleFilesUpload(files) {
    if (!files || files.length === 0) return;
    const project = getActiveProject();
    if (!project.assets) project.assets = [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const cleanName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        // Replace if exists or push
        const existingIdx = project.assets.findIndex(a => a.name === cleanName);
        const newAsset = {
          name: cleanName,
          size: file.size,
          type: file.type || 'application/octet-stream',
          base64: e.target.result
        };

        if (existingIdx >= 0) {
          project.assets[existingIdx] = newAsset;
        } else {
          project.assets.push(newAsset);
        }

        saveProjects();
        renderAssetsList();
        showToast(`Uploaded asset "${cleanName}"`, 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  btnOpenAssets.addEventListener('click', () => {
    assetsSidebar.classList.toggle('active');
    outlineSidebar.classList.remove('active');
    renderAssetsList();
  });

  btnCloseAssets.addEventListener('click', () => {
    assetsSidebar.classList.remove('active');
  });

  assetFileInput.addEventListener('change', (e) => {
    handleFilesUpload(e.target.files);
    assetFileInput.value = '';
  });

  assetDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    assetDropzone.classList.add('dragover');
  });

  assetDropzone.addEventListener('dragleave', () => {
    assetDropzone.classList.remove('dragover');
  });

  assetDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    assetDropzone.classList.remove('dragover');
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  });

  // ==========================================================================
  // Diagnostics Drawer
  // ==========================================================================
  diagnosticsHeader.addEventListener('click', (e) => {
    if (e.target.closest('.diagnostics-tabs')) return;
    diagnosticsDrawer.classList.toggle('expanded');
    const isExpanded = diagnosticsDrawer.classList.contains('expanded');
    diagnosticsChevron.className = isExpanded ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
  });

  diagnosticsTabs.querySelectorAll('.diag-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      diagnosticsTabs.querySelectorAll('.diag-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeDiagTab = tab.getAttribute('data-tab');
      renderDiagnosticsContent();
    });
  });

  function renderDiagnosticsContent() {
    if (!lastCompileData) {
      diagnosticsContent.innerHTML = '<div class="empty-diag-hint">Compiler ready. Press "Compile" to build document.</div>';
      return;
    }

    const { errors = [], warnings = [], log = '', success } = lastCompileData;

    if (activeDiagTab === 'errors') {
      if (errors.length === 0) {
        diagnosticsContent.innerHTML = '<div style="color: var(--accent-success);"><i class="fa-solid fa-check"></i> No errors found in document.</div>';
      } else {
        diagnosticsContent.innerHTML = errors.map(err => `
          <div class="log-line-error" data-line="${err.line || ''}">
            <i class="fa-solid fa-circle-exclamation"></i>
            <div>
              ${err.line ? `<strong>Line ${err.line}:</strong> ` : ''}${escapeHtml(err.message)}
              ${err.context ? `<div style="opacity: 0.8; font-size: 0.7rem;">${escapeHtml(err.context)}</div>` : ''}
            </div>
          </div>
        `).join('');
      }
    } else if (activeDiagTab === 'log') {
      diagnosticsContent.innerHTML = `<pre style="font-family: var(--font-code); font-size: 0.72rem;">${escapeHtml(log)}</pre>`;
    } else {
      let html = '';
      if (success) {
        html += `<div style="color: var(--accent-success); font-weight: 600; margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> Compilation successful!</div>`;
      } else {
        html += `<div style="color: #f87171; font-weight: 600; margin-bottom: 8px;"><i class="fa-solid fa-triangle-exclamation"></i> Compilation failed: PDF was not generated.</div>`;
      }

      if (errors.length > 0) {
        html += errors.map(err => `
          <div class="log-line-error" data-line="${err.line || ''}">
            <i class="fa-solid fa-circle-exclamation"></i>
            <div>
              ${err.line ? `<strong>Line ${err.line}:</strong> ` : ''}${escapeHtml(err.message)}
            </div>
          </div>
        `).join('');
      }

      if (warnings.length > 0) {
        html += warnings.slice(0, 10).map(w => `
          <div class="log-line-warning">
            <i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(w)}
          </div>
        `).join('');
      }

      if (errors.length === 0 && warnings.length === 0) {
        html += `<div style="color: var(--text-dim); font-size: 0.75rem;">Clean build with zero warnings or errors.</div>`;
      }

      diagnosticsContent.innerHTML = html;
    }

    diagnosticsContent.querySelectorAll('.log-line-error').forEach(item => {
      item.addEventListener('click', () => {
        const line = parseInt(item.getAttribute('data-line'), 10);
        if (line) {
          editor.gotoLine(line, 0, true);
          editor.focus();
        }
      });
    });
  }

  // ==========================================================================
  // PDF.js Canvas Continuous Rendering
  // ==========================================================================
  async function loadPdfIntoViewer(pdfBytes) {
    currentPdfBytes = pdfBytes;
    try {
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      currentPdfDoc = await loadingTask.promise;
      renderCurrentPdfPages();

      previewPlaceholder.style.display = 'none';
      pdfPagesContainer.style.display = 'flex';
      btnDownloadPdf.disabled = false;
      btnPrintPdf.disabled = false;
      btnOpenNewTab.disabled = false;
      pageNavControls.style.display = currentPdfDoc.numPages > 1 ? 'flex' : 'none';
      updatePageIndicator(1, currentPdfDoc.numPages);
    } catch (err) {
      console.error('PDF.js render error:', err);
      showToast('Error rendering PDF: ' + err.message, 'error');
    }
  }

  async function renderCurrentPdfPages() {
    if (!currentPdfDoc) return;
    pdfPagesContainer.innerHTML = '';

    const numPages = currentPdfDoc.numPages;
    const dpr = window.devicePixelRatio || 1;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await currentPdfDoc.getPage(pageNum);
      const initialViewport = page.getViewport({ scale: 1.0 });

      let scale = currentZoom;
      if (currentZoom === 'width') {
        const availableWidth = previewViewport.clientWidth - 48;
        scale = availableWidth / initialViewport.width;
      } else if (currentZoom === 'page') {
        const availableHeight = previewViewport.clientHeight - 64;
        scale = availableHeight / initialViewport.height;
      }

      const viewport = page.getViewport({ scale });

      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-wrapper';
      pageWrapper.setAttribute('data-page-num', pageNum);
      pageWrapper.style.width = `${viewport.width}px`;
      pageWrapper.style.height = `${viewport.height}px`;

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      pageWrapper.appendChild(canvas);
      pdfPagesContainer.appendChild(pageWrapper);

      page.render({
        canvasContext: ctx,
        viewport: viewport
      });
    }

    zoomLevelDisplay.textContent = typeof currentZoom === 'number'
      ? `${Math.round(currentZoom * 100)}%`
      : (currentZoom === 'width' ? 'Fit W' : 'Fit P');
  }

  function updatePageIndicator(cur, total) {
    pageIndicator.textContent = `Page ${cur} / ${total}`;
  }

  previewViewport.addEventListener('scroll', () => {
    if (!currentPdfDoc) return;
    const wrappers = pdfPagesContainer.querySelectorAll('.pdf-page-wrapper');
    const containerTop = previewViewport.scrollTop;

    for (let i = 0; i < wrappers.length; i++) {
      const el = wrappers[i];
      if (el.offsetTop + el.offsetHeight / 2 >= containerTop) {
        updatePageIndicator(i + 1, currentPdfDoc.numPages);
        break;
      }
    }
  });

  btnZoomIn.addEventListener('click', () => {
    let nextZoom = typeof currentZoom === 'number' ? currentZoom + 0.15 : 1.15;
    currentZoom = Math.min(3.0, Math.round(nextZoom * 100) / 100);
    renderCurrentPdfPages();
  });

  btnZoomOut.addEventListener('click', () => {
    let nextZoom = typeof currentZoom === 'number' ? currentZoom - 0.15 : 0.85;
    currentZoom = Math.max(0.4, Math.round(nextZoom * 100) / 100);
    renderCurrentPdfPages();
  });

  btnFitWidth.addEventListener('click', () => {
    currentZoom = 'width';
    renderCurrentPdfPages();
  });

  btnFitPage.addEventListener('click', () => {
    currentZoom = 'page';
    renderCurrentPdfPages();
  });

  btnPaperTheme.addEventListener('click', () => {
    isDarkPaper = !isDarkPaper;
    pdfPagesContainer.classList.toggle('dark-paper', isDarkPaper);
    showToast(isDarkPaper ? 'Dark paper mode enabled' : 'Clean white paper mode', 'info');
  });

  btnPrevPage.addEventListener('click', () => {
    const curText = pageIndicator.textContent.match(/\d+/);
    const cur = curText ? parseInt(curText[0], 10) : 1;
    if (cur > 1) {
      const target = pdfPagesContainer.querySelector(`[data-page-num="${cur - 1}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  btnNextPage.addEventListener('click', () => {
    if (!currentPdfDoc) return;
    const curText = pageIndicator.textContent.match(/\d+/);
    const cur = curText ? parseInt(curText[0], 10) : 1;
    if (cur < currentPdfDoc.numPages) {
      const target = pdfPagesContainer.querySelector(`[data-page-num="${cur + 1}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // ==========================================================================
  // SHA-256 Client Helper
  // ==========================================================================
  async function computeClientHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ==========================================================================
  // Compile LaTeX Core Logic
  // ==========================================================================
  async function compileLatex(options = {}) {
    const { force = false, isAuto = false } = options;
    const code = editor.getValue();

    if (!code || code.trim().length === 0) {
      if (!isAuto) showToast('LaTeX document is empty', 'error');
      return;
    }

    const activeProject = getActiveProject();
    const projectAssets = (activeProject && activeProject.assets) ? activeProject.assets : [];

    // Signature includes code + all assets
    const assetSignature = projectAssets.map(a => `${a.name}:${a.base64.length}`).sort().join('|');
    const compositeHash = await computeClientHash(`${code}###${assetSignature}`);

    // Check instant client memory cache (0ms)
    if (!force && clientPdfCache.has(compositeHash)) {
      const cached = clientPdfCache.get(compositeHash);
      lastCompileData = cached;
      await loadPdfIntoViewer(cached.pdfBytes);

      previewStatusPill.className = 'status-pill ready';
      previewStatusPill.innerHTML = '<i class="fa-solid fa-check"></i><span>Ready</span>';

      docInfoText.style.display = 'inline';
      docInfoText.textContent = `${(cached.sizeBytes / 1024).toFixed(1)} KB • Instant`;

      compilerTimeLabel.textContent = `Cached (0ms)`;
      speedBadge.style.display = 'inline-flex';
      speedBadgeText.textContent = 'Instant 0ms';

      errorCountBadge.style.display = 'none';
      editor.session.clearAnnotations();
      renderDiagnosticsContent();
      return;
    }

    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();

    isCompiling = true;
    btnCompile.disabled = true;
    compilingOverlay.classList.add('active');
    enginePulse.classList.add('compiling');
    engineStatusText.textContent = 'Compiling...';

    previewStatusPill.className = 'status-pill compiling';
    previewStatusPill.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Building PDF...</span>';
    compilerTimeLabel.textContent = 'Processing...';

    const tStart = performance.now();

    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          sessionId,
          force,
          assets: projectAssets
        }),
        signal: activeAbortController.signal
      });

      const data = await response.json();
      lastCompileData = data;

      if (data.success && data.pdfBase64) {
        const base64Data = data.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Cache result in client
        clientPdfCache.set(compositeHash, {
          pdfBytes: bytes,
          pdfBase64: data.pdfBase64,
          log: data.log,
          sizeBytes: bytes.length,
          duration: data.duration,
          success: true,
          errors: [],
          warnings: data.warnings || []
        });

        if (currentPdfBlobUrl) URL.revokeObjectURL(currentPdfBlobUrl);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        currentPdfBlobUrl = URL.createObjectURL(blob);

        await loadPdfIntoViewer(bytes);

        previewStatusPill.className = 'status-pill ready';
        previewStatusPill.innerHTML = '<i class="fa-solid fa-check"></i><span>Ready</span>';

        const sizeKb = (bytes.length / 1024).toFixed(1);
        docInfoText.style.display = 'inline';
        docInfoText.textContent = `${sizeKb} KB • ${data.duration}ms`;

        compilerTimeLabel.textContent = data.cached ? `Cached in ${data.duration}ms` : `Built in ${data.duration}ms`;
        errorCountBadge.style.display = 'none';

        if (data.cached) {
          speedBadge.style.display = 'inline-flex';
          speedBadgeText.textContent = `Cached ${data.duration}ms`;
        } else {
          speedBadge.style.display = 'none';
        }

        editor.session.clearAnnotations();
        renderDiagnosticsContent();

        if (!isAuto) {
          showToast(data.cached ? 'Loaded from instant cache!' : 'Document compiled successfully!', 'success');
        }
      } else {
        handleCompileFailure(data);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      handleCompileFailure({
        error: 'Network or server error: ' + err.message,
        errors: [{ message: err.message, line: null }],
        log: err.message,
        duration: Math.round(performance.now() - tStart)
      });
    } finally {
      isCompiling = false;
      btnCompile.disabled = false;
      compilingOverlay.classList.remove('active');
      enginePulse.classList.remove('compiling');
      engineStatusText.textContent = 'Compiler Ready';
    }
  }

  function handleCompileFailure(data) {
    lastCompileData = data;
    previewStatusPill.className = 'status-pill error';
    previewStatusPill.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Failed</span>';

    const errors = data.errors || [];
    errorCountBadge.style.display = 'inline-block';
    errorCountBadge.textContent = `${errors.length || 1} error(s)`;
    compilerTimeLabel.textContent = 'Build Failed';
    speedBadge.style.display = 'none';

    const annotations = [];
    errors.forEach(err => {
      if (err.line) {
        annotations.push({
          row: err.line - 1,
          column: 0,
          text: err.message,
          type: 'error'
        });
      }
    });
    editor.session.setAnnotations(annotations);

    diagnosticsDrawer.classList.add('expanded');
    diagnosticsChevron.className = 'fa-solid fa-chevron-down';
    renderDiagnosticsContent();

    showToast('LaTeX compilation failed. Check diagnostics.', 'error');
  }

  // Cancel Compilation Button in Overlay
  btnCancelCompilation.addEventListener('click', () => {
    if (activeAbortController) activeAbortController.abort();
    fetch('/api/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    }).catch(() => {});

    isCompiling = false;
    btnCompile.disabled = false;
    compilingOverlay.classList.remove('active');
    enginePulse.classList.remove('compiling');
    previewStatusPill.className = 'status-pill ready';
    previewStatusPill.innerHTML = '<i class="fa-solid fa-check"></i><span>Cancelled</span>';
    showToast('Compilation cancelled', 'info');
  });

  btnCompile.addEventListener('click', () => compileLatex({ force: false }));

  // ==========================================================================
  // Export & Packaging (TeX, PDF, Full ZIP, Print)
  // ==========================================================================
  function exportTexFile() {
    const code = editor.getValue();
    const active = getActiveProject();
    const fileName = `${(active ? active.title : 'document').replace(/[^a-zA-Z0-9_\-]/g, '_')}.tex`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${fileName}`, 'info');
  }
  btnExportTex.addEventListener('click', exportTexFile);

  btnDownloadPdf.addEventListener('click', () => {
    if (!currentPdfBytes) return;
    const active = getActiveProject();
    const fileName = `${(active ? active.title : 'document').replace(/[^a-zA-Z0-9_\-]/g, '_')}.pdf`;

    const blob = new Blob([currentPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${fileName}`, 'success');
  });

  // Export full project as ZIP archive
  btnExportZip.addEventListener('click', async () => {
    if (typeof JSZip === 'undefined') {
      showToast('ZIP library not loaded', 'error');
      return;
    }

    const zip = new JSZip();
    const active = getActiveProject();
    const baseName = (active ? active.title : 'latex_project').replace(/[^a-zA-Z0-9_\-]/g, '_');

    // Add main.tex
    zip.file('main.tex', editor.getValue());

    // Add compiled PDF if ready
    if (currentPdfBytes) {
      zip.file('document.pdf', currentPdfBytes);
    }

    // Add all project assets
    const assets = (active && active.assets) ? active.assets : [];
    assets.forEach(a => {
      const cleanBase64 = a.base64.replace(/^data:[^;]+;base64,/, '');
      zip.file(a.name, cleanBase64, { base64: true });
    });

    try {
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${baseName}_bundle.zip`, 'success');
    } catch (e) {
      showToast('Error generating ZIP: ' + e.message, 'error');
    }
  });

  // Print Document
  btnPrintPdf.addEventListener('click', () => {
    if (currentPdfBlobUrl) {
      const printWin = window.open(currentPdfBlobUrl, '_blank');
      if (printWin) {
        printWin.focus();
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  });

  // Open PDF in new tab
  btnOpenNewTab.addEventListener('click', () => {
    if (currentPdfBlobUrl) {
      window.open(currentPdfBlobUrl, '_blank');
    }
  });

  // ==========================================================================
  // Keyboard Shortcuts Bindings
  // ==========================================================================
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      compileLatex({ force: false });
    } else if (e.shiftKey && e.key === 'Enter' && !e.target.matches('textarea, input')) {
      e.preventDefault();
      compileLatex({ force: false });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      exportTexFile();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'b' && document.activeElement === codeEditorEl) {
      e.preventDefault();
      wrapSelection('\\textbf{', '}');
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i' && document.activeElement === codeEditorEl) {
      e.preventDefault();
      wrapSelection('\\textit{', '}');
    } else if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      btnToggleWrap.click();
    } else if (e.key === '?' && !e.target.matches('textarea, input')) {
      e.preventDefault();
      shortcutsModal.classList.add('active');
    }
  });

  // ==========================================================================
  // Templates Gallery Modal
  // ==========================================================================
  function renderTemplates(category = 'all', searchQuery = '') {
    templatesGrid.innerHTML = '';
    const templates = Object.values(window.LATEX_TEMPLATES || {});
    const query = searchQuery.trim().toLowerCase();

    const filtered = templates.filter(tmpl => {
      const matchCat = category === 'all' || tmpl.category === category;
      const matchSearch = query.length === 0 ||
        tmpl.title.toLowerCase().includes(query) ||
        tmpl.description.toLowerCase().includes(query) ||
        tmpl.badge.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      templatesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-dim);">
          <i class="fa-solid fa-shapes" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
          No templates match your search criteria.
        </div>
      `;
      return;
    }

    filtered.forEach(tmpl => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `
        <div class="card-top">
          <div class="card-icon"><i class="fa-solid ${tmpl.icon}"></i></div>
          <span class="card-badge">${tmpl.badge}</span>
        </div>
        <h4>${tmpl.title}</h4>
        <p>${tmpl.description}</p>
        <div class="card-action">
          <span>Load into New Project</span>
          <i class="fa-solid fa-arrow-right"></i>
        </div>
      `;

      card.addEventListener('click', () => {
        templatesModal.classList.remove('active');
        createNewProject(tmpl.title, tmpl.code);
        showToast(`Created new project with "${tmpl.title}"`, 'success');
      });

      templatesGrid.appendChild(card);
    });
  }

  btnOpenTemplates.addEventListener('click', () => {
    templateSearchInput.value = '';
    renderTemplates('all');
    templatesModal.classList.add('active');
    templateSearchInput.focus();
  });

  btnCloseTemplates.addEventListener('click', () => {
    templatesModal.classList.remove('active');
  });

  templateSearchInput.addEventListener('input', () => {
    const activeTab = templateCategoryFilters.querySelector('.category-tab.active');
    const category = activeTab ? activeTab.getAttribute('data-category') : 'all';
    renderTemplates(category, templateSearchInput.value);
  });

  templateCategoryFilters.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      templateCategoryFilters.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTemplates(tab.getAttribute('data-category'), templateSearchInput.value);
    });
  });

  document.querySelectorAll('.starter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tmplKey = chip.getAttribute('data-template');
      if (window.LATEX_TEMPLATES && window.LATEX_TEMPLATES[tmplKey]) {
        const tmpl = window.LATEX_TEMPLATES[tmplKey];
        createNewProject(tmpl.title, tmpl.code);
      }
    });
  });

  // ==========================================================================
  // AI LaTeX Assistant Modal
  // ==========================================================================
  btnOpenAi.addEventListener('click', () => {
    aiModal.classList.add('active');
    aiPromptInput.focus();
  });

  function closeAiModal() {
    aiModal.classList.remove('active');
  }

  btnCloseAi.addEventListener('click', closeAiModal);
  btnCancelAi.addEventListener('click', closeAiModal);

  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      aiPromptInput.value = chip.getAttribute('data-prompt');
    });
  });

  btnGenerateAi.addEventListener('click', () => {
    const prompt = aiPromptInput.value.trim().toLowerCase();
    if (!prompt) {
      showToast('Please type a prompt first', 'error');
      return;
    }

    let selectedTmpl = null;
    let projTitle = 'AI Generated Document';

    if (prompt.includes('flowchart') || prompt.includes('workflow') || prompt.includes('2fa') || prompt.includes('login')) {
      selectedTmpl = window.LATEX_TEMPLATES.flowchart;
      projTitle = 'Authentication Flowchart';
    } else if (prompt.includes('sine') || prompt.includes('oscillation') || prompt.includes('plot') || prompt.includes('graph')) {
      selectedTmpl = window.LATEX_TEMPLATES.graph2d;
      projTitle = 'Harmonic Oscillation Plot';
    } else if (prompt.includes('bar') || prompt.includes('latency') || prompt.includes('benchmark')) {
      selectedTmpl = window.LATEX_TEMPLATES.barchart;
      projTitle = 'Latency Benchmark Bar Chart';
    } else if (prompt.includes('neural') || prompt.includes('deep learning') || prompt.includes('mlp')) {
      selectedTmpl = window.LATEX_TEMPLATES.neuralnet;
      projTitle = 'Neural Network Architecture';
    } else if (prompt.includes('math') || prompt.includes('equation') || prompt.includes('maxwell') || prompt.includes('integral')) {
      selectedTmpl = window.LATEX_TEMPLATES.equations;
      projTitle = 'Maxwell Field Equations';
    } else if (prompt.includes('mindmap') || prompt.includes('concept') || prompt.includes('tree')) {
      selectedTmpl = window.LATEX_TEMPLATES.mindmap;
      projTitle = 'Artificial Intelligence Mindmap';
    } else if (prompt.includes('paper') || prompt.includes('academic') || prompt.includes('ieee') || prompt.includes('research')) {
      selectedTmpl = window.LATEX_TEMPLATES.academic;
      projTitle = 'Academic Research Paper';
    } else {
      selectedTmpl = window.LATEX_TEMPLATES.resume;
      projTitle = 'Software Engineer Resume';
    }

    if (selectedTmpl) {
      closeAiModal();
      createNewProject(projTitle, selectedTmpl.code);
      showToast(`Generated project: "${projTitle}"`, 'success');
    }
  });

  btnShortcuts.addEventListener('click', () => shortcutsModal.classList.add('active'));
  btnCloseShortcuts.addEventListener('click', () => shortcutsModal.classList.remove('active'));

  window.addEventListener('click', (e) => {
    if (e.target === templatesModal) templatesModal.classList.remove('active');
    if (e.target === aiModal) aiModal.classList.remove('active');
    if (e.target === shortcutsModal) shortcutsModal.classList.remove('active');
    if (e.target === projectsModal) projectsModal.classList.remove('active');
  });

  // ==========================================================================
  // Helper Utilities
  // ==========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error')   icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function formatRelativeTime(ts) {
    if (!ts) return 'Just now';
    const diffSecs = Math.floor((Date.now() - ts) / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  // Initial boot: start on Dashboard
  switchView('dashboard');

  // Pre-compile active project in background
  setTimeout(() => {
    compileLatex({ force: false });
  }, 350);
});
