// Comprehensive LaTeX Templates for Resume, Flowchart, Graphs, Equations, Papers, etc.
const LATEX_TEMPLATES = {
  resume: {
    id: 'resume',
    title: 'Modern ATS Resume',
    category: 'Resumes & CVs',
    badge: 'Popular',
    icon: 'fa-id-card',
    description: 'Clean, professional single-page resume with ATS-friendly typography and structured sections.',
    code: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\definecolor{primary}{RGB}{37, 99, 235}
\\definecolor{darkgray}{RGB}{55, 65, 81}

\\hypersetup{colorlinks=true, urlcolor=primary}

\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*, noitemsep, topsep=2pt}

% Section styling
\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{10pt}{6pt}

\\begin{document}

% Header
\\begin{center}
    {\\Huge\\bfseries Alex Morgan} \\\\[4pt]
    \\small
    San Francisco, CA \\ \\textbar \\ \\href{mailto:alex.morgan@email.com}{alex.morgan@email.com} \\ \\textbar \\ +1 (555) 234-5678 \\ \\textbar \\ \\href{https://linkedin.com}{linkedin.com/in/alexmorgan} \\ \\textbar \\ \\href{https://github.com}{github.com/alexmorgan}
\\end{center}

\\vspace{-4pt}

% Summary
\\section{Professional Summary}
Senior Full-Stack Engineer with 6+ years of experience designing scalable distributed systems and high-performance web applications. Expert in TypeScript, React, Node.js, and cloud architectures. Proven track record of improving system uptime to 99.99\\% and leading agile engineering teams.

% Experience
\\section{Work Experience}

\\textbf{Senior Software Engineer} \\hfill \\textbf{TechCorp Solutions} \\\\
\\textit{San Francisco, CA} \\hfill \\textit{2022 -- Present}
\\begin{itemize}
    \\item Architected and launched a real-time analytics pipeline processing 50M+ daily events using Node.js, Kafka, and Redis.
    \\item Reduced API response latency by 42\\% through optimized database indexing and asynchronous caching layers.
    \\item Mentored 6 junior engineers and spearheaded automated CI/CD workflows, cutting deployment time from 40 to 8 minutes.
\\end{itemize}

\\vspace{4pt}

\\textbf{Software Engineer} \\hfill \\textbf{DataStream Inc.} \\\\
\\textit{Austin, TX} \\hfill \\textit{2019 -- 2022}
\\begin{itemize}
    \\item Engineered responsive web interfaces using React and Tailwind CSS, increasing user conversion rates by 28\\%.
    \\item Developed RESTful microservices in Python (FastAPI) integrated with PostgreSQL and AWS S3.
    \\item Collaborated with product and UX teams to deliver 14 high-impact product features ahead of quarterly milestones.
\\end{itemize}

% Education
\\section{Education}
\\textbf{B.S. in Computer Science} \\hfill \\textbf{University of California, Berkeley} \\\\
\\textit{GPA: 3.85 / 4.0} \\hfill \\textit{Graduated May 2019}

% Skills
\\section{Technical Skills}
\\begin{itemize}
    \\item \\textbf{Languages:} TypeScript, JavaScript, Python, Go, SQL, HTML5/CSS3, LaTeX
    \\item \\textbf{Frameworks \\& Tools:} React, Next.js, Node.js, Express, Docker, Kubernetes, GraphQL
    \\item \\textbf{Cloud \\& Databases:} AWS (EC2, S3, RDS), PostgreSQL, MongoDB, Redis, Git, CI/CD
\\end{itemize}

% Projects
\\section{Key Projects}
\\textbf{HyperQuery -- Open Source SQL Optimizer} \\hfill \\href{https://github.com}{github.com/alexmorgan/hyperquery} \\\\
Built an automated query plan analyzer that suggests index patterns; acquired over 1,500 GitHub stars.

\\end{document}
`
  },

  flowchart: {
    id: 'flowchart',
    title: 'Process Workflow & Flowchart',
    category: 'Diagrams & Flowcharts',
    badge: 'TikZ',
    icon: 'fa-diagram-project',
    description: 'Clean orthogonal workflow flowchart with zero overlapping lines or intersecting boxes.',
    code: `\\documentclass[tikz,border=20pt]{standalone}
\\usepackage{tikz}
\\usepackage{xcolor}
\\usetikzlibrary{shapes.geometric, arrows.meta, positioning, calc}

\\definecolor{indigo}{RGB}{79, 70, 229}
\\definecolor{cyan}{RGB}{6, 182, 212}
\\definecolor{amber}{RGB}{245, 158, 11}
\\definecolor{emerald}{RGB}{16, 185, 129}
\\definecolor{rose}{RGB}{244, 63, 94}
\\definecolor{slate}{RGB}{71, 85, 105}

\\begin{document}

\\tikzset{
    base/.style      = {draw, thick, text centered, font=\\sffamily\\small, minimum height=1.1cm},
    startstop/.style = {base, rectangle, rounded corners=14pt, minimum width=3.4cm, fill=indigo!15, draw=indigo!80},
    process/.style   = {base, rectangle, rounded corners=4pt, minimum width=3.4cm, fill=cyan!15, draw=cyan!80!black},
    decision/.style  = {base, diamond, aspect=2, minimum width=3.2cm, minimum height=1.3cm, fill=amber!15, draw=amber!80!black},
    success/.style   = {base, rectangle, rounded corners=6pt, minimum width=3.4cm, fill=emerald!15, draw=emerald!80!black},
    error/.style     = {base, rectangle, rounded corners=4pt, minimum width=3.2cm, fill=rose!15, draw=rose!80},
    arrow/.style     = {thick, ->, >=Stealth, draw=slate!80!black, rounded corners=4pt}
}

\\begin{tikzpicture}[node distance=1.4cm and 2.2cm]

    % Main vertical spine
    \\node (start)     [startstop]                                   {Start Session};
    \\node (login)     [process, below=1.2cm of start]               {User Enters Credentials};
    \\node (check)     [decision, below=1.2cm of login]              {Valid Credentials?};
    \\node (twofa)     [decision, below=1.4cm of check]              {2FA Enabled?};
    \\node (dashboard) [success, below=1.4cm of twofa]               {Access Granted (Dashboard)};

    % Branch nodes on the sides (generous clearance to prevent overlaps)
    \\node (prompt2fa) [process, right=2.4cm of twofa]               {Prompt OTP SMS/Code};
    \\node (verify2fa) [decision, below=1.4cm of prompt2fa]          {Valid OTP?};
    \\node (failNotice)[error, left=2.4cm of check]                  {Display Error Alert};

    % Clean orthogonal non-overlapping routing
    \\draw [arrow] (start) -- (login);
    \\draw [arrow] (login) -- (check);
    
    % Check decisions
    \\draw [arrow] (check) -- node[right, font=\\footnotesize\\bfseries] {Yes} (twofa);
    \\draw [arrow] (check) -- node[above, font=\\footnotesize\\bfseries] {No} (failNotice);
    
    % Fail loopback safely routed around outer margin
    \\draw [arrow] (failNotice.north) |- (login.west);

    % 2FA branch
    \\draw [arrow] (twofa) -- node[above, font=\\footnotesize\\bfseries] {Yes} (prompt2fa);
    \\draw [arrow] (twofa) -- node[right, font=\\footnotesize\\bfseries] {No} (dashboard);
    
    \\draw [arrow] (prompt2fa) -- (verify2fa);
    \\draw [arrow] (verify2fa) -| node[near start, above, font=\\footnotesize\\bfseries] {Yes} (dashboard);
    \\draw [arrow] (verify2fa.east) -- ++(0.8, 0) |- (prompt2fa.east) node[pos=0.25, right, font=\\footnotesize\\bfseries] {Retry (No)};

\\end{tikzpicture}

\\end{document}
`
  },

  graph2d: {
    id: 'graph2d',
    title: 'Scientific 2D & 3D Plots',
    category: 'Charts & Graphs',
    badge: 'PGFPlots',
    icon: 'fa-chart-line',
    description: 'High-precision coordinate axes, damped oscillations, and trigonometric curves using PGFPlots.',
    code: `\\documentclass[border=10pt]{standalone}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}

\\begin{document}

\\begin{tikzpicture}
\\begin{axis}[
    title={\\textbf{Damped Harmonic Oscillation: $f(x) = e^{-0.3x} \\cos(3x)$}},
    xlabel={Time $t$ (seconds)},
    ylabel={Amplitude $A(t)$},
    xmin=0, xmax=10,
    ymin=-1.25, ymax=1.25,
    xtick={0,2,4,6,8,10},
    ytick={-1,-0.5,0,0.5,1},
    legend pos=south east,
    ymajorgrids=true,
    xmajorgrids=true,
    grid style={dashed, gray!30},
    width=13cm,
    height=8cm,
    axis lines=left,
    line width=1pt
]

% Envelope +
\\addplot[
    domain=0:10,
    samples=100,
    color=gray,
    dashed,
    line width=0.8pt
]{exp(-0.3*x)};
\\addlegendentry{Upper Envelope $e^{-0.3t}$}

% Envelope -
\\addplot[
    domain=0:10,
    samples=100,
    color=gray,
    dashed,
    line width=0.8pt
]{-exp(-0.3*x)};
\\addlegendentry{Lower Envelope $-e^{-0.3t}$}

% Damped Curve
\\addplot[
    domain=0:10,
    samples=250,
    color=blue!80!black,
    line width=1.5pt
]{exp(-0.3*x)*cos(deg(3*x))};
\\addlegendentry{Signal Response}

% Equilibrium Reference
\\addplot[
    domain=0:10,
    color=red!70,
    dotted,
    line width=1pt
]{0};

\\end{axis}
\\end{tikzpicture}

\\end{document}
`
  },

  barchart: {
    id: 'barchart',
    title: 'Performance Bar Chart',
    category: 'Charts & Graphs',
    badge: 'PGFPlots',
    icon: 'fa-chart-column',
    description: 'Comparative grouped bar chart with legends positioned cleanly above plot to avoid label overlap.',
    code: `\\documentclass[border=12pt]{standalone}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}

\\begin{document}

\\begin{tikzpicture}
\\begin{axis}[
    ybar,
    enlarge x limits=0.25,
    legend style={at={(0.5,1.06)}, anchor=south, legend columns=-1, draw=none, fill=none},
    ylabel={Execution Latency (ms)},
    symbolic x coords={Q1 2024, Q2 2024, Q3 2024, Q4 2024},
    xtick=data,
    nodes near coords,
    nodes near coords align={vertical},
    width=12cm,
    height=7.5cm,
    bar width=16pt,
    ymin=0, ymax=220,
    grid=major,
    grid style={dashed, gray!30},
    title={\\textbf{Database Engine Latency Benchmark}\\\\[4pt]}
]

\\addplot[fill=blue!60, draw=blue!90] coordinates {
    (Q1 2024, 142)
    (Q2 2024, 118)
    (Q3 2024, 85)
    (Q4 2024, 62)
};
\\addlegendentry{Postgres Caching\\quad}

\\addplot[fill=teal!60, draw=teal!90] coordinates {
    (Q1 2024, 185)
    (Q2 2024, 140)
    (Q3 2024, 98)
    (Q4 2024, 45)
};
\\addlegendentry{Redis Distributed Cache}

\\end{axis}
\\end{tikzpicture}

\\end{document}
`
  },

  equations: {
    id: 'equations',
    title: 'Advanced Mathematics & Proofs',
    category: 'Math & Equations',
    badge: 'Formulas',
    icon: 'fa-square-root-variable',
    description: 'Comprehensive mathematical formulas, Maxwell equations, matrices, integrals, and aligned steps.',
    code: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{xcolor}

\\newtheorem{theorem}{Theorem}[section]
\\newtheorem{definition}{Definition}[section]

\\begin{document}

\\begin{center}
    {\\LARGE\\bfseries Fundamental Theorems \\& Field Equations} \\\\[6pt]
    \\textit{Mathematical Physics \\& Linear Algebra Reference}
\\end{center}

\\vspace{10pt}

\\section{Maxwell's Differential Equations}
In vacuum electrodynamics, the fundamental relations governing the electric field $\\mathbf{E}$ and magnetic field $\\mathbf{B}$ are expressed as:

\\begin{align}
    \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} && \\text{(Gauss's Law)} \\\\[6pt]
    \\nabla \\cdot \\mathbf{B} &= 0 && \\text{(Gauss's Law for Magnetism)} \\\\[6pt]
    \\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} && \\text{(Faraday's Law of Induction)} \\\\[6pt]
    \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} && \\text{(Ampere--Maxwell Law)}
\\end{align}

\\section{The Gaussian Integral Proof}
\\begin{theorem}[Euler-Poisson Integral]
For any positive parameter $a > 0$:
\\begin{equation}
    \\int_{-\\infty}^{\\infty} e^{-a x^2} \\, dx = \\sqrt{\\frac{\\pi}{a}}
\\end{equation}
\\end{theorem}

\\begin{proof}
Let $I = \\int_{-\\infty}^{\\infty} e^{-x^2} dx$. Squaring the integral and converting to polar coordinates $(r, \\theta)$:
\\begin{align*}
    I^2 &= \\left( \\int_{-\\infty}^{\\infty} e^{-x^2} dx \\right) \\left( \\int_{-\\infty}^{\\infty} e^{-y^2} dy \\right) = \\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} e^{-(x^2+y^2)} \\, dx \\, dy \\\\[4pt]
        &= \\int_{0}^{2\\pi} d\\theta \\int_{0}^{\\infty} e^{-r^2} r \\, dr = 2\\pi \\left[ -\\frac{1}{2} e^{-r^2} \\right]_{0}^{\\infty} = \\pi
\\end{align*}
Taking the positive square root yields $I = \\sqrt{\\pi}$. Substituting $x \\to \\sqrt{a}x$ proves the result.
\\end{proof}

\\section{Eigenvalue Decomposition of Matrices}
Consider the symmetric $3 \\times 3$ matrix $A \\in \\mathbb{R}^{3 \\times 3}$:
\\begin{equation}
    A = \\begin{pmatrix}
        5 & 2 & 0 \\\\
        2 & 6 & 2 \\\\
        0 & 2 & 7
    \\end{pmatrix}, \\quad
    \\det(A - \\lambda I) = \\begin{vmatrix}
        5-\\lambda & 2 & 0 \\\\
        2 & 6-\\lambda & 2 \\\\
        0 & 2 & 7-\\lambda
    \\end{vmatrix} = 0
\\end{equation}

\\end{document}
`
  },

  neuralnet: {
    id: 'neuralnet',
    title: 'Neural Network Architecture',
    category: 'Diagrams & Flowcharts',
    badge: 'TikZ',
    icon: 'fa-brain',
    description: 'Multi-layer perceptron (Input, Hidden, Output layers) with labeled weights and activations.',
    code: `\\documentclass[border=12pt]{standalone}
\\usepackage{tikz}
\\usepackage{amsmath,amssymb}
\\usetikzlibrary{positioning}

\\begin{document}

\\begin{tikzpicture}[x=1.8cm, y=1.2cm]

% Node styling
\\tikzset{
    neuron/.style={circle, fill=blue!20, draw=blue!80, line width=1pt, minimum size=26pt, inner sep=0pt},
    input/.style={neuron, fill=green!20, draw=green!80!black},
    hidden/.style={neuron, fill=blue!20, draw=blue!80},
    output/.style={neuron, fill=red!20, draw=red!80},
    annot/.style={text width=4cm, text centered, font=\\bfseries\\sffamily}
}

% Input Layer
\\foreach \\y / \\idx in {1/1, 2/2, 3/3, 4/4}
    \\node[input] (I-\\idx) at (0, -\\y) {$x_\\idx$};

% Hidden Layer 1
\\foreach \\y / \\idx in {0.5/1, 1.5/2, 2.5/3, 3.5/4, 4.5/5}
    \\node[hidden] (H1-\\idx) at (2, -\\y) {$h_\\idx$};

% Hidden Layer 2
\\foreach \\y / \\idx in {0.5/1, 1.5/2, 2.5/3, 3.5/4, 4.5/5}
    \\node[hidden] (H2-\\idx) at (4, -\\y) {$g_\\idx$};

% Output Layer
\\foreach \\y / \\idx in {2/1, 3/2}
    \\node[output] (O-\\idx) at (6, -\\y) {$\\hat{y}_\\idx$};

% Connect Input to Hidden 1
\\foreach \\i in {1,...,4}
    \\foreach \\j in {1,...,5}
        \\draw[->, >=latex, gray!40, thin] (I-\\i) -- (H1-\\j);

% Connect Hidden 1 to Hidden 2
\\foreach \\i in {1,...,5}
    \\foreach \\j in {1,...,5}
        \\draw[->, >=latex, gray!40, thin] (H1-\\i) -- (H2-\\j);

% Connect Hidden 2 to Output
\\foreach \\i in {1,...,5}
    \\foreach \\j in {1,...,2}
        \\draw[->, >=latex, gray!50, thin] (H2-\\i) -- (O-\\j);

% Layer Annotations
\\node[annot, above of=I-1, node distance=1.2cm] {Input Layer\\\\($\\mathbb{R}^4$)};
\\node[annot, above of=H1-1, node distance=1.6cm] {Hidden Layer 1\\\\(ReLU)};
\\node[annot, above of=H2-1, node distance=1.6cm] {Hidden Layer 2\\\\(ReLU)};
\\node[annot, above of=O-1, node distance=1.2cm] {Output Layer\\\\(Softmax)};

\\end{tikzpicture}

\\end{document}
`
  },

  academic: {
    id: 'academic',
    title: 'Academic Research Paper',
    category: 'Academic & Reports',
    badge: 'Two-Column',
    icon: 'fa-book-open',
    description: 'Two-column IEEE-style research template with abstract, section hierarchy, equations, and bibliography.',
    code: `\\documentclass[twocolumn,10pt]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{amsmath, amssymb}
\\usepackage{booktabs}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{lipsum}

\\title{\\textbf{Deep Latent Optimization for Real-Time Physics Simulation}}
\\author{
    \\textbf{Sumit Kumar}$^{1}$, \\textbf{Elena Vance}$^{2}$, \\textbf{Arthur Dent}$^{1}$ \\\\[4pt]
    $^{1}$Department of Computer Science, Institute of Advanced Technology \\\\
    $^{2}$Quantum Computing \\& Systems Laboratory \\\\
    \\texttt{\\{sumit, elena\\}@iat.edu}
}
\\date{}

\\begin{document}

\\maketitle

\\begin{abstract}
We present a novel neural operator framework capable of accelerating high-dimensional partial differential equation (PDE) solvers by up to three orders of magnitude while preserving boundary condition invariants. By formulating continuous Galerkin projections within a coordinate-aware latent space, our model attains zero-shot generalization across varying boundary geometries. Experimental benchmarks on Navier-Stokes fluid turbulence reveal an MSE reduction of 34.2\\% over baseline Fourier Neural Operators (FNO).
\\end{abstract}

\\section{Introduction}
Simulating complex turbulent flow and multi-phase fluid dynamics demands extraordinary supercomputing throughput. Conventional finite-element and spectral methods encounter polynomial scaling bottlenecks when resolving fine Kolmogorov turbulence micro-scales:

\\begin{equation}
    \\eta = \\left( \\frac{\\nu^3}{\\varepsilon} \\right)^{1/4}
\\end{equation}

Recent advances in neural surrogate modeling have unlocked promising speeds, yet standard architectures suffer from spatial error accumulation over long autoregressive prediction horizons.

\\section{Methodology}
Let $\\Omega \\subset \\mathbb{R}^d$ denote a compact domain. We model the velocity state vector $\\mathbf{u}(x, t)$ governed by:

\\begin{equation}
    \\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} = -\\frac{1}{\\rho}\\nabla p + \\nu \\nabla^2 \\mathbf{u} + \\mathbf{f}
\\end{equation}
subject to divergence-free condition $\\nabla \\cdot \\mathbf{u} = 0$.

\\subsection{Latent Embedding}
Our network maps discrete sensor states to continuous Hilbert spaces through an encoder $\\mathcal{E}_\\theta$:

\\begin{equation}
    \\mathbf{z}(t) = \\mathcal{E}_\\theta\\left( \\mathbf{u}(\\cdot, t) \\right) \\in \\mathbb{R}^{d_z}
\\end{equation}

\\begin{table}[h]
\\centering
\\caption{Benchmark Comparison on Navier-Stokes 2D}
\\vspace{4pt}
\\begin{tabular}{lccc}
\\toprule
\\textbf{Model} & \\textbf{MSE ($\\times 10^{-4}$)} & \\textbf{FPS} & \\textbf{Params} \\\\
\\midrule
Standard FEM    & Ground Truth & 0.8 & -- \\\\
U-Net           & 4.12 & 45.2 & 18.4M \\\\
FNO-2D          & 1.85 & 82.0 & 24.1M \\\\
\\textbf{Ours}   & \\textbf{1.21} & \\textbf{124.5} & \\textbf{12.6M} \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\section{Conclusion}
Our physics-constrained neural operator delivers real-time inference speeds while enforcing conservation laws, opening new horizons for interactive scientific simulations.

\\end{document}
`
  },

  mindmap: {
    id: 'mindmap',
    title: 'Mind Map & Concept Tree',
    category: 'Diagrams & Flowcharts',
    badge: 'TikZ',
    icon: 'fa-sitemap',
    description: 'Hierarchical concept graph with radial branches and color categories.',
    code: `\\documentclass[border=12pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{mindmap, shadows}

\\begin{document}

\\begin{tikzpicture}[
    mindmap,
    every node/.style={concept, execute at begin node=\\hskip0pt},
    root concept/.append style={
        concept color=blue!70!black,
        fill=blue!20,
        line width=1.5pt,
        font=\\large\\bfseries\\sffamily,
        text width=3.2cm
    },
    level 1 concept/.append style={
        font=\\bfseries\\sffamily,
        level distance=4.5cm,
        sibling angle=90
    },
    extra concept/.append style={
        font=\\small\\sffamily,
        text width=2cm
    }
]

\\node [root concept] {Artificial Intelligence}
    child[concept color=teal!70!black, fill=teal!15] {
        node {Machine Learning}
        child { node[extra concept] {Supervised} }
        child { node[extra concept] {Unsupervised} }
        child { node[extra concept] {Reinforcement} }
    }
    child[concept color=purple!70!black, fill=purple!15] {
        node {Deep Learning}
        child { node[extra concept] {Transformers} }
        child { node[extra concept] {Diffusion Models} }
        child { node[extra concept] {CNNs / Vision} }
    }
    child[concept color=orange!80!black, fill=orange!15] {
        node {Natural Language}
        child { node[extra concept] {LLMs} }
        child { node[extra concept] {Semantic Search} }
        child { node[extra concept] {Speech Audio} }
    }
    child[concept color=red!70!black, fill=red!15] {
        node {Robotics \\& Vision}
        child { node[extra concept] {SLAM \\& LiDAR} }
        child { node[extra concept] {Object Tracking} }
    };

\\end{tikzpicture}

\\end{document}
`
  }
};

if (typeof window !== 'undefined') {
  window.LATEX_TEMPLATES = LATEX_TEMPLATES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LATEX_TEMPLATES;
}
