/**
 * CareerPilot — Application UI Controller
 * Connects to FastAPI backend when available, falls back to client-side engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new window.CareerPilotEngine();

  // Backend API URL (configurable)
  const API_BASE = 'http://localhost:8000';

  // UI Elements
  const resumeTextInput = document.getElementById('resumeText');
  const jobDescInput = document.getElementById('jobDescription');
  const targetRoleInput = document.getElementById('targetRole');
  const fileUploadInput = document.getElementById('resumeFileInput');
  const dropzone = document.getElementById('dropzone');
  const fileBadge = document.getElementById('fileBadge');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const runButton = document.getElementById('runSwarmBtn');
  const toast = document.getElementById('toast');

  // HUD Elements
  const agentHud = document.getElementById('agentHud');
  const hudTimer = document.getElementById('hudTimer');
  const progressBar = document.getElementById('analysisProgressBar');
  const statusText = document.getElementById('analysisStatusText');
  const percentText = document.getElementById('analysisPercentText');
  const stepItems = document.querySelectorAll('.agent-step-item');

  // Results Elements
  const resultsSection = document.getElementById('resultsSection');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  // Timer
  let timerInterval = null;
  let startTime = 0;

  // Track uploaded file for backend upload
  let uploadedFile = null;

  // ─── Sample Presets ────────────────────────────────────────────────
  const PRESETS = {
    cs_grad: {
      role: "Junior Backend Engineer",
      resume: `Muhammad Hamza
Email: hamza.cs@gmail.com | Phone: +92 300 9876543 | Lahore, Pakistan
LinkedIn: linkedin.com/in/hamza-dev | GitHub: github.com/hamza-codes

EDUCATION
Bachelor of Science in Computer Science (BSCS)
FAST-NUCES, Lahore (2020 – 2024) | CGPA: 3.42 / 4.0

TECHNICAL SKILLS
- Languages: Python, JavaScript, TypeScript, C++, SQL
- Frameworks & Libs: FastAPI, Django, React, Node.js, Express, TailwindCSS
- Databases: PostgreSQL, MongoDB, Redis, MySQL
- DevOps & Tools: Git, Docker, Postman, Linux, GitHub Actions, AWS (EC2/S3 basics)

PROJECTS & EXPERIENCE
1. High-Performance E-Commerce Microservices
- Designed and implemented RESTful microservices for user auth, product catalog, and orders using FastAPI and PostgreSQL.
- Implemented Redis in-memory caching for product listings, cutting query response time from 180ms to 42ms.
- Containerized services using Docker Compose for reliable local and test deployment.

2. Smart Resume & Candidate Matcher (Final Year Project)
- Developed an automated NLP pipeline using Python, Scikit-Learn, and FastAPI to parse resume PDFs and calculate cosine similarity scores against job requirements.
- Handled text extraction, tokenization, and TF-IDF vectorization across 500+ test resumes.

3. Software Engineering Intern — TechHub Solutions (Summer 2023)
- Built internal admin dashboard modules using React and Express.js, resolving 18+ backlog issues.`,
      job: `We are looking for a motivated Junior Backend Engineer to join our core engineering team. 
Requirements:
- Strong proficiency in Python and modern backend frameworks (FastAPI or Django).
- Experience designing relational databases (PostgreSQL/MySQL) and writing optimized SQL queries.
- Understanding of caching strategies (Redis), REST API principles, and microservices architecture.
- Familiarity with Docker containerization and Git version control.
- Solid understanding of Data Structures, Algorithms, and clean code practices.`
    },
    data_sci: {
      role: "Associate Data Scientist",
      resume: `Ayesha Khan
Email: ayesha.data@gmail.com | Phone: +92 321 4567890 | Islamabad, Pakistan

EDUCATION
BS in Computer Science — NUST, Islamabad (2020 – 2024)

TECHNICAL SKILLS
- Languages: Python, R, SQL, C++
- Data Science & ML: Pandas, NumPy, Scikit-Learn, PyTorch, TensorFlow, Matplotlib, Seaborn
- Databases & Cloud: PostgreSQL, SQLite, AWS S3, Google BigQuery
- Tools: Jupyter, Git, Docker, Tableau, PowerBI

PROJECTS
1. Customer Churn Prediction Engine (Python, XGBoost, Scikit-Learn)
- Engineered feature extraction pipelines across 75,000 telco records, achieving an 88.5% ROC-AUC score.
- Deployed model prediction API using Flask and Docker container.

2. Healthcare Sentiment & Diagnostic NLP Classifier (PyTorch, Transformers)
- Fine-tuned RoBERTa on medical consult records, improving intent classification accuracy by 14%.`,
      job: `Seeking an Associate Data Scientist passionate about Machine Learning and predictive analytics.
Requirements:
- Strong foundation in Python, Pandas, NumPy, Scikit-Learn, and SQL.
- Hands-on experience developing and evaluating machine learning classification/regression models.
- Familiarity with PyTorch or TensorFlow for deep learning.
- Ability to communicate data-driven insights through clean visualizations.`
    },
    frontend_dev: {
      role: "Frontend React Developer",
      resume: `Bilal Tariq
Email: bilal.ui@gmail.com | Phone: +92 333 1122334 | Karachi, Pakistan

EDUCATION
BS in Software Engineering — NED University, Karachi (2020 – 2024)

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3/SCSS
- Frameworks: React.js, Next.js, Redux Toolkit, TailwindCSS, Vite
- Testing & Tools: Jest, React Testing Library, Git, Figma, Webpack, Postman

PROJECTS
1. SaaS Analytics Dashboard (Next.js, TypeScript, TailwindCSS)
- Developed responsive analytical web app featuring interactive Chart.js graphs and dark mode theming.
- Optimized bundle size and asset loading to achieve 98+ Google Lighthouse performance score.

2. Real-Time Collaborative Workspace (React, WebSockets, Node.js)
- Implemented real-time shared canvas and chat using Socket.io and React hooks.`,
      job: `Looking for a talented Frontend React Developer to build delightful, high-performance web applications.
Requirements:
- Advanced proficiency in React, TypeScript, Next.js, and modern CSS/TailwindCSS.
- Strong knowledge of state management (Redux / Context API) and RESTful API consumption.
- Obsession with UI/UX polish, responsive design, and web performance optimization.`
    }
  };

  // ─── Preset Click Handlers ─────────────────────────────────────────
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-preset');
      const data = PRESETS[key];
      if (data) {
        targetRoleInput.value = data.role;
        resumeTextInput.value = data.resume;
        jobDescInput.value = data.job;
        uploadedFile = null;
        showToast(`Loaded "${data.role}" sample profile`);
      }
    });
  });

  // ─── Dropzone Handlers ─────────────────────────────────────────────
  dropzone.addEventListener('click', () => fileUploadInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });
  fileUploadInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  async function handleFileUpload(file) {
    fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileBadge.style.display = 'inline-flex';
    uploadedFile = file;

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        resumeTextInput.value = ev.target.result;
        showToast("Resume text loaded from file");
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      // Try client-side PDF extraction using pdf.js
      try {
        const text = await extractPdfText(file);
        if (text && text.trim().length > 30) {
          resumeTextInput.value = text;
          showToast("Resume text extracted from PDF");
        } else {
          resumeTextInput.value = `[PDF attached: ${file.name}]\nPDF text extraction returned limited content. The backend server will process this PDF directly when available.`;
          showToast("PDF attached — will be processed by backend");
        }
      } catch (err) {
        resumeTextInput.value = `[PDF attached: ${file.name}]\nUnable to extract text in browser. The backend server will process this PDF directly.`;
        showToast("PDF attached — backend will process it");
      }
    } else {
      showToast(`Attached ${file.name}`);
    }
  }

  /**
   * Extract text from a PDF file using Mozilla's pdf.js library.
   * Falls back gracefully if pdf.js is not loaded.
   */
  async function extractPdfText(file) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('pdf.js not loaded');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    return fullText.trim();
  }

  // ─── Page Switching & Navigation System ──────────────────────────────
  const PAGE_NAMES = [
    "Page 1 of 6: Overview & ATS Score",
    "Page 2 of 6: Skill Gap Analysis",
    "Page 3 of 6: Resume Bullet Rewrites",
    "Page 4 of 6: Tailored Cover Letter",
    "Page 5 of 6: Interview Preparation",
    "Page 6 of 6: Salary & Career Roadmap"
  ];
  window.currentPageIndex = 0;

  window.switchPage = function(targetIndex, customDirection = null) {
    if (targetIndex < 0 || targetIndex >= tabPanels.length) return;
    
    const currentIndex = window.currentPageIndex;
    const direction = customDirection || (targetIndex >= currentIndex ? 'right' : 'left');

    // Remove active and animation classes
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => {
      p.classList.remove('active', 'page-slide-right', 'page-slide-left');
    });
    
    // Update progress dots
    const dots = document.querySelectorAll('.page-dot');
    dots.forEach((dot, idx) => {
      if (idx === targetIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    // Update page label
    const label = document.getElementById('currentPageLabel');
    if (label && PAGE_NAMES[targetIndex]) {
      label.textContent = PAGE_NAMES[targetIndex];
    }

    // Set target tab button active
    if (tabButtons[targetIndex]) {
      tabButtons[targetIndex].classList.add('active');
    }

    // Activate target panel with animation
    const targetPanel = tabPanels[targetIndex];
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.classList.add(direction === 'right' ? 'page-slide-right' : 'page-slide-left');
    }

    window.currentPageIndex = targetIndex;

    // Smooth scroll to top of results if needed
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      const rect = resultsSection.getBoundingClientRect();
      if (rect.top < -50 || rect.top > 400) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  window.changePage = function(delta) {
    const target = window.currentPageIndex + delta;
    window.switchPage(target, delta > 0 ? 'right' : 'left');
  };

  // Bind click events on tab navigation buttons
  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      window.switchPage(index);
    });
  });

  // ─── Check if Backend is Online ────────────────────────────────────
  async function isBackendAvailable() {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ─── Call Backend API ──────────────────────────────────────────────
  async function callBackendAPI(resumeText, targetRole, jobDescription) {
    // If we have an uploaded PDF file, use the upload endpoint
    if (uploadedFile && uploadedFile.name.endsWith('.pdf')) {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('target_role', targetRole);
      formData.append('company_name', 'Target Company');

      const res = await fetch(`${API_BASE}/api/analyze-upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      return await res.json();
    }

    // Otherwise use text endpoint
    const res = await fetch(`${API_BASE}/api/analyze-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_text: resumeText,
        target_role: targetRole,
        company_name: 'Target Company'
      })
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  }

  /**
   * Transform backend API response into the format our renderResults expects.
   */
  function transformBackendResponse(apiData) {
    const ra = apiData.resume_analysis || {};
    const sg = apiData.skill_gap_analysis || {};
    const ats = apiData.ats_optimization || {};
    const cl = apiData.cover_letter || {};
    const ip = apiData.interview_prep || {};
    const cr = apiData.career_roadmap || {};

    return {
      profile: {
        name: ra.name || 'Candidate',
        email: 'N/A',
        phone: 'N/A',
        experienceYears: typeof ra.experience_years === 'number' ? ra.experience_years : 1,
        education: Array.isArray(ra.education) ? ra.education[0] : (ra.education || 'Computer Science'),
        technicalSkills: ra.parsed_skills || ['Python', 'JavaScript']
      },
      skillGap: {
        matchingSkills: sg.matching_skills || [],
        missingSkills: sg.missing_critical_skills || [],
        gapPercentage: 100 - (sg.match_score || 75),
        certifications: (cr.recommended_certifications || []).map(c => typeof c === 'string' ? c : c.name),
        roadmap30: (cr.milestones && cr.milestones[0]) ? cr.milestones[0].action_items : ['Build core skills'],
        roadmap60: (cr.milestones && cr.milestones[1]) ? cr.milestones[1].action_items : ['Build portfolio projects'],
        roadmap90: (cr.milestones && cr.milestones[2]) ? cr.milestones[2].action_items : ['Apply and network']
      },
      ats: {
        atsScore: ats.ats_compatibility_score || 78,
        readabilityScore: Math.min(95, (ats.ats_compatibility_score || 78) + 5),
        keywordMatchRate: sg.match_score || 75,
        formattingIssues: ats.ats_pro_tips || ['Optimize resume formatting for ATS parsers'],
        optimizedBullets: (ats.rewritten_bullet_points || []).map(b => ({
          original: b.original,
          improved: b.optimized || b.improved
        }))
      },
      coverLetter: cl.cover_letter_body || 'Cover letter will be generated when backend is connected.',
      interview: {
        questions: (ip.interview_preparation_package || []).map(q => ({
          category: q.category || 'General',
          question: q.question,
          difficulty: 'Medium',
          star: {
            situation: (q.sample_star_answer || '').split('Task:')[0].replace('Situation:', '').trim(),
            task: ((q.sample_star_answer || '').split('Task:')[1] || '').split('Action:')[0].trim(),
            action: ((q.sample_star_answer || '').split('Action:')[1] || '').split('Result:')[0].trim(),
            result: ((q.sample_star_answer || '').split('Result:')[1] || '').trim()
          },
          sampleAnswer: q.sample_star_answer || ''
        })),
        proTips: ip.interview_pro_tips || []
      },
      career: {
        salaryPkr: 'PKR 120,000 – 180,000 / mo',
        salaryUsd: '$18,000 – $28,000 / yr',
        shortTerm: (cr.milestones && cr.milestones[0]) ? cr.milestones[0].focus : 'Build foundational skills',
        midTerm: (cr.milestones && cr.milestones[1]) ? cr.milestones[1].focus : 'Build portfolio and deploy projects',
        longTerm: (cr.milestones && cr.milestones[2]) ? cr.milestones[2].focus : 'Obtain certifications and network',
        topCompanies: ['Systems Limited', 'Arbisoft', 'Devsinc', '10Pearls', 'Motive', 'Educative', 'S&P Global']
      }
    };
  }

  // ─── Main Execution ────────────────────────────────────────────────
  runButton.addEventListener('click', async () => {
    const resumeText = resumeTextInput.value.trim();
    const jobDesc = jobDescInput.value.trim();
    const role = targetRoleInput.value.trim() || "Software Engineer";

    if (!resumeText) {
      showToast("Please paste your resume or select a sample profile");
      return;
    }

    runButton.disabled = true;
    agentHud.classList.add('visible');
    resultsSection.classList.remove('visible');

    // Start timer
    startTime = Date.now();
    if (progressBar) progressBar.style.width = '0%';
    if (percentText) percentText.textContent = '0%';
    if (statusText) statusText.textContent = 'Checking backend server...';
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      hudTimer.textContent = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    }, 100);

    // Reset steps
    stepItems.forEach(item => item.classList.remove('running', 'completed'));

    try {
      let results;
      const backendOnline = await isBackendAvailable();

      if (backendOnline) {
        // ─── Backend Mode ──────────────────────────────────────
        if (statusText) statusText.textContent = 'Connected to backend — running AI agent pipeline...';

        // Animate steps sequentially to show progress
        for (let i = 0; i < 6; i++) {
          stepItems[i].classList.add('running');
          const pct = Math.round(((i + 1) / 6) * 80);
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (percentText) percentText.textContent = `${pct}%`;
          const stageNames = ['Resume Audit', 'Skill Gap Analysis', 'ATS Optimization', 'Cover Letter', 'Interview Prep', 'Career Roadmap'];
          if (statusText) statusText.textContent = `Stage ${i + 1} of 6: ${stageNames[i]}...`;
          await new Promise(r => setTimeout(r, 200));
          if (i > 0) {
            stepItems[i - 1].classList.remove('running');
            stepItems[i - 1].classList.add('completed');
          }
        }

        const apiResult = await callBackendAPI(resumeText, role, jobDesc);
        results = transformBackendResponse(apiResult);

        // Mark last step complete
        stepItems[5].classList.remove('running');
        stepItems[5].classList.add('completed');
      } else {
        // ─── Client-Side Engine Fallback ────────────────────────
        if (statusText) statusText.textContent = 'Running local analysis engine...';

        results = await engine.runFullSwarm(resumeText, jobDesc, role, (stepIdx, agentName, logMsg) => {
          stepItems.forEach((item, idx) => {
            if (idx < stepIdx) {
              item.classList.remove('running');
              item.classList.add('completed');
            } else if (idx === stepIdx) {
              item.classList.add('running');
              item.classList.remove('completed');
            }
          });
          const percent = Math.min(100, Math.round(((stepIdx + 1) / 6) * 100));
          if (progressBar) progressBar.style.width = `${percent}%`;
          if (percentText) percentText.textContent = `${percent}%`;
          if (statusText) statusText.textContent = `Stage ${stepIdx + 1} of 6: ${logMsg}`;
        });
      }

      // Finalize
      stepItems.forEach(item => { item.classList.remove('running'); item.classList.add('completed'); });
      if (progressBar) progressBar.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      if (statusText) statusText.textContent = 'Analysis complete — results ready below.';
      clearInterval(timerInterval);

      renderResults(results, role);
      resultsSection.classList.add('visible');
      resultsSection.scrollIntoView({ behavior: 'smooth' });
      showToast("Profile analysis completed");
    } catch (err) {
      console.error(err);
      clearInterval(timerInterval);
      if (statusText) statusText.textContent = 'Error occurred. Please try again.';
      showToast("Analysis failed — check console for details");
    } finally {
      runButton.disabled = false;
    }
  });

  // ─── Render Results ────────────────────────────────────────────────
  function renderResults(data, role) {
    const { profile, skillGap, ats, coverLetter, interview, career } = data;

    // Overview & ATS
    document.getElementById('displayAtsScore').textContent = ats.atsScore;
    document.getElementById('displayCandidateName').textContent = profile.name;
    document.getElementById('displayEducation').textContent = profile.education;
    document.getElementById('displayExpYears').textContent = `${profile.experienceYears} Years`;

    // Circular dial (circumference = 2 * PI * 60 ≈ 377)
    const circle = document.getElementById('atsDialCircle');
    const circumference = 377;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference - (ats.atsScore / 100) * circumference}`;

    // Metric bars
    document.getElementById('barReadability').style.width = `${ats.readabilityScore}%`;
    document.getElementById('valReadability').textContent = `${ats.readabilityScore}%`;
    document.getElementById('barKeywordMatch').style.width = `${ats.keywordMatchRate}%`;
    document.getElementById('valKeywordMatch').textContent = `${ats.keywordMatchRate}%`;
    document.getElementById('barSkillsMatch').style.width = `${100 - skillGap.gapPercentage}%`;
    document.getElementById('valSkillsMatch').textContent = `${100 - skillGap.gapPercentage}%`;

    // Strengths & Weaknesses
    document.getElementById('strengthsList').innerHTML = `
      <li class="bullet-item positive">Strong core foundation in ${profile.technicalSkills.slice(0, 3).join(', ')}.</li>
      <li class="bullet-item positive">Demonstrated project experience building software applications.</li>
      <li class="bullet-item positive">Accredited educational background and structured project portfolio.</li>
    `;
    document.getElementById('weaknessesList').innerHTML = ats.formattingIssues.map(issue =>
      `<li class="bullet-item negative">${issue}</li>`
    ).join('');

    // Skill Gaps
    document.getElementById('matchingSkillsPills').innerHTML =
      skillGap.matchingSkills.map(s => `<span class="tag-pill match">✓ ${s}</span>`).join('') || '<span style="color:var(--text-muted)">No exact matches found</span>';
    document.getElementById('missingSkillsPills').innerHTML =
      skillGap.missingSkills.map(s => `<span class="tag-pill missing">✕ ${s}</span>`).join('');
    document.getElementById('certPills').innerHTML =
      skillGap.certifications.map(c => `<span class="tag-pill cert">★ ${c}</span>`).join('');
    document.getElementById('roadmap30List').innerHTML = skillGap.roadmap30.map(m => `<li class="bullet-item">${m}</li>`).join('');
    document.getElementById('roadmap60List').innerHTML = skillGap.roadmap60.map(m => `<li class="bullet-item">${m}</li>`).join('');
    document.getElementById('roadmap90List').innerHTML = skillGap.roadmap90.map(m => `<li class="bullet-item">${m}</li>`).join('');

    // Store globally for tone switching and filtering
    window._lastAnalysisData = data;
    window._lastRole = role;

    // Bullet Optimizer
    document.getElementById('bulletDiffContainer').innerHTML = ats.optimizedBullets.map(b => `
      <div class="diff-card">
        <div class="diff-original"><strong>Original:</strong> ${b.original}</div>
        <div class="diff-improved"><strong>Optimized:</strong> ${b.improved}</div>
      </div>
    `).join('');

    // Cover Letter
    document.getElementById('coverLetterContent').textContent = coverLetter;
    if (document.getElementById('clCandidateName')) document.getElementById('clCandidateName').textContent = profile.name || 'Candidate Name';
    if (document.getElementById('clTargetRole')) document.getElementById('clTargetRole').textContent = `Target Position: ${role}`;
    if (document.getElementById('clDateStr')) document.getElementById('clDateStr').textContent = `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;

    // Render Interview Questions & Reverse Interview Prep
    renderInterviewSection(interview);

    // Career & Salary
    document.getElementById('salaryPkr').textContent = career.salaryPkr;
    document.getElementById('salaryUsd').textContent = career.salaryUsd;
    document.getElementById('trajectoryShort').textContent = career.shortTerm;
    document.getElementById('trajectoryMid').textContent = career.midTerm;
    document.getElementById('trajectoryLong').textContent = career.longTerm;
    document.getElementById('hiringCompaniesList').innerHTML = career.topCompanies.map(c =>
      `<span class="tag-pill match" style="font-size: 0.85rem; padding: 8px 14px;">🏢 ${c}</span>`
    ).join('');
  }

  // ─── Render Interview Section ──────────────────────────────────────
  function renderInterviewSection(interview) {
    const listEl = document.getElementById('interviewQuestionsList');
    const reverseListEl = document.getElementById('reverseQuestionsList');
    if (!listEl) return;

    window._interviewQuestions = interview.questions || [];
    window._reverseQuestions = interview.reverseInterviewQuestions || [
      {
        question: "How does the engineering team balance shipping new features with technical debt?",
        whyItWorks: "Demonstrates long-term thinking and commitment to high code quality and maintainability."
      },
      {
        question: "What does the deployment and testing pipeline look like on this team?",
        whyItWorks: "Shows that you care about development velocity, automated testing, and CI/CD best practices."
      },
      {
        question: "What is the biggest technical bottleneck the team is working to solve right now?",
        whyItWorks: "Positions you as a collaborative problem-solver eager to tackle core challenges."
      }
    ];

    listEl.innerHTML = window._interviewQuestions.map((q, idx) => {
      const qId = q.id || idx + 1;
      const catClass = q.category.includes('Tech') ? 'tech' : q.category.includes('Beh') ? 'behavioral' : 'system';
      const diffClass = q.difficulty === 'Hard' ? 'diff-hard' : 'diff-med';

      return `
        <div class="mock-interview-card" id="mockCard_${qId}" data-category="${q.category}">
          <div class="mock-card-header" onclick="toggleMockCard(${qId})">
            <div class="mock-card-title-group">
              <div class="mock-tags">
                <span class="mock-tag ${catClass}">${q.category}</span>
                <span class="mock-tag ${diffClass}">${q.difficulty || 'Medium'}</span>
              </div>
              <div class="mock-question-text">Q${idx + 1}: ${q.question}</div>
            </div>
            <div style="font-size: 0.82rem; color: var(--secondary-teal); font-weight: 600; white-space: nowrap;">
              Practice 🎙️ ▼
            </div>
          </div>

          <div class="mock-card-body" id="mockBody_${qId}">
            <!-- Practice Sandbox -->
            <div class="practice-sandbox">
              <div class="sandbox-header">
                <span style="font-size: 0.82rem; font-weight: 700; color: var(--primary-navy);">
                  ✍️ Your Practice Answer (STAR Format):
                </span>
                <div class="timer-box">
                  <span id="timerDisplay_${qId}">02:00</span>
                  <button class="timer-btn" onclick="toggleTimer(${qId})">▶ Start</button>
                  <button class="timer-btn" onclick="resetTimer(${qId})">↺ Reset</button>
                </div>
              </div>

              <textarea 
                class="practice-textarea" 
                id="answerInput_${qId}" 
                placeholder="Type your answer here using Situation, Task, Action, Result..."
                oninput="updateWordCount(${qId})"
              ></textarea>

              <div class="sandbox-actions">
                <span style="font-size: 0.78rem; color: var(--text-muted);" id="wordCount_${qId}">0 words</span>
                <button class="eval-btn" onclick="evaluateAnswer(${qId})">
                  <span>⚡ Evaluate My Answer</span>
                </button>
              </div>

              <!-- AI Real-Time Feedback Result -->
              <div id="aiFeedback_${qId}" style="display: none;"></div>
            </div>

            <!-- Ideal STAR Breakdown -->
            <div style="border-top: 1px dashed var(--border-light); padding-top: 14px; margin-top: 14px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--secondary-teal); margin-bottom: 10px;">
                💡 Recommended STAR Framework:
              </div>
              <div class="star-grid">
                <div class="star-cell"><div class="star-title">Situation</div><div class="star-text">${q.star?.situation || ''}</div></div>
                <div class="star-cell"><div class="star-title">Task</div><div class="star-text">${q.star?.task || ''}</div></div>
                <div class="star-cell"><div class="star-title">Action</div><div class="star-text">${q.star?.action || ''}</div></div>
                <div class="star-cell"><div class="star-title">Result</div><div class="star-text">${q.star?.result || ''}</div></div>
              </div>
              <div style="margin-top: 12px; background: #F1F5F9; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.84rem; color: var(--text-primary);">
                <strong>Sample Verbatim Answer:</strong> "${q.sampleAnswer}"
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Reverse Interview List
    if (reverseListEl) {
      reverseListEl.innerHTML = window._reverseQuestions.map((rq, idx) => `
        <div class="reverse-card">
          <div class="reverse-q">💡 Q${idx + 1}: "${rq.question}"</div>
          <div class="reverse-why"><strong>Why this impresses interviewers:</strong> ${rq.whyItWorks}</div>
        </div>
      `).join('');
    }
  }

  // ─── Mock Card Toggle ──────────────────────────────────────────────
  window.toggleMockCard = function(qId) {
    const body = document.getElementById(`mockBody_${qId}`);
    if (body) {
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    }
  };

  // ─── Word Counter ──────────────────────────────────────────────────
  window.updateWordCount = function(qId) {
    const input = document.getElementById(`answerInput_${qId}`);
    const countEl = document.getElementById(`wordCount_${qId}`);
    if (input && countEl) {
      const words = input.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      countEl.textContent = `${words} words`;
    }
  };

  // ─── 2-Minute Practice Timer ───────────────────────────────────────
  const mockTimers = {};
  window.toggleTimer = function(qId) {
    const display = document.getElementById(`timerDisplay_${qId}`);
    if (!display) return;

    if (mockTimers[qId] && mockTimers[qId].interval) {
      // Pause
      clearInterval(mockTimers[qId].interval);
      mockTimers[qId].interval = null;
      event.target.textContent = '▶ Resume';
      return;
    }

    if (!mockTimers[qId]) {
      mockTimers[qId] = { seconds: 120, interval: null };
    }

    event.target.textContent = '⏸ Pause';
    mockTimers[qId].interval = setInterval(() => {
      mockTimers[qId].seconds--;
      if (mockTimers[qId].seconds <= 0) {
        clearInterval(mockTimers[qId].interval);
        mockTimers[qId].interval = null;
        display.textContent = '00:00 - Time Up!';
        display.style.color = '#DC2626';
        showToast("Time's up! Wrap up your answer.");
        return;
      }
      const mins = String(Math.floor(mockTimers[qId].seconds / 60)).padStart(2, '0');
      const secs = String(mockTimers[qId].seconds % 60).padStart(2, '0');
      display.textContent = `${mins}:${secs}`;
    }, 1000);
  };

  window.resetTimer = function(qId) {
    const display = document.getElementById(`timerDisplay_${qId}`);
    if (mockTimers[qId]) {
      clearInterval(mockTimers[qId].interval);
      mockTimers[qId] = null;
    }
    if (display) {
      display.textContent = '02:00';
      display.style.color = 'var(--primary-navy)';
    }
  };

  // ─── AI Answer Evaluator ───────────────────────────────────────────
  window.evaluateAnswer = function(qId) {
    const input = document.getElementById(`answerInput_${qId}`);
    const feedbackBox = document.getElementById(`aiFeedback_${qId}`);
    if (!input || !feedbackBox) return;

    const answer = input.value.trim();
    if (answer.length < 25) {
      showToast("Please type a longer answer to evaluate (at least 20 words)");
      return;
    }

    // Evaluation Logic
    let score = 55;
    const hasSituation = /\b(when|while|during|project|context|faced|scenario|at my)\b/i.test(answer);
    const hasTask = /\b(needed to|had to|goal|task|objective|responsible|required)\b/i.test(answer);
    const hasAction = /\b(built|implemented|designed|created|engineered|refactored|used|developed|optimized|spearheaded)\b/i.test(answer);
    const hasResult = /\b(result|achieved|reduced|improved|increased|saved|delivered|success|outcome)\b/i.test(answer);
    const hasMetrics = /\d+%|\b\d+\s*(users|ms|seconds|hours|times|x)\b/i.test(answer);

    if (hasSituation) score += 10;
    if (hasTask) score += 8;
    if (hasAction) score += 12;
    if (hasResult) score += 10;
    if (hasMetrics) score += 5;
    score = Math.min(98, score);

    let coachingAdvice = "";
    if (!hasMetrics) {
      coachingAdvice = "💡 Pro Tip: Quantify your Result! Include a metric (e.g., 'reduced latency by 35%' or 'served 1,000+ users') to make your outcome undeniable.";
    } else if (!hasTask) {
      coachingAdvice = "💡 Pro Tip: Clarify your specific Task before jumping to actions so the interviewer understands your individual responsibility.";
    } else {
      coachingAdvice = "⭐ Excellent response! Strong STAR structure and high-impact action verbs. Keep your delivery under 90 seconds in the live interview.";
    }

    feedbackBox.style.display = 'block';
    feedbackBox.innerHTML = `
      <div class="ai-feedback-card">
        <div class="feedback-score-bar">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary-navy);">AI Interview Scorecard</span>
          <span class="feedback-badge">${score}/100</span>
        </div>
        <div class="star-checklist">
          <span class="star-check ${hasSituation ? 'passed' : 'missing'}">${hasSituation ? '✓' : '✕'} Situation</span>
          <span class="star-check ${hasTask ? 'passed' : 'missing'}">${hasTask ? '✓' : '✕'} Task</span>
          <span class="star-check ${hasAction ? 'passed' : 'missing'}">${hasAction ? '✓' : '✕'} Action</span>
          <span class="star-check ${hasResult ? 'passed' : 'missing'}">${hasResult ? '✓' : '✕'} Result</span>
          <span class="star-check ${hasMetrics ? 'passed' : 'missing'}">${hasMetrics ? '✓' : '✕'} Metrics (${hasMetrics ? 'Detected' : 'None'})</span>
        </div>
        <p class="feedback-advice">${coachingAdvice}</p>
      </div>
    `;
    showToast(`Answer Evaluated: ${score}/100`);
  };

  // ─── Filter Interview Questions ────────────────────────────────────
  window.filterInterviewQuestions = function(category) {
    const filterBtns = document.querySelectorAll('.int-filter-btn');
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });

    const cards = document.querySelectorAll('.mock-interview-card');
    const reverseSection = document.getElementById('reverseInterviewSection');

    if (category === 'reverse') {
      cards.forEach(c => c.style.display = 'none');
      if (reverseSection) reverseSection.style.display = 'block';
      return;
    }

    if (reverseSection) reverseSection.style.display = 'none';

    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat.includes(category)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  };

  // ─── Cover Letter Tone Switcher ────────────────────────────────────
  window.switchCoverLetterTone = function(tone) {
    const toneBtns = document.querySelectorAll('.tone-btn');
    toneBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tone') === tone);
    });

    if (window._lastAnalysisData) {
      const name = window._lastAnalysisData.profile?.name || "Applicant";
      const role = window._lastRole || "Software Engineer";
      const skills = window._lastAnalysisData.skillGap?.matchingSkills || [];
      const newLetter = engine.generateCoverLetter(name, role, skills, tone);
      const letterEl = document.getElementById('coverLetterContent');
      if (letterEl) {
        letterEl.textContent = newLetter;
        showToast(`Cover letter updated: ${tone.toUpperCase()} tone`);
      }
    }
  };

  // ─── Copy Cover Letter ─────────────────────────────────────────────
  window.copyCoverLetter = function() {
    const text = document.getElementById('coverLetterContent').textContent;
    navigator.clipboard.writeText(text).then(() => showToast("Cover letter copied to clipboard"));
  };

  // ─── Standalone Cover Letter PDF Export ─────────────────────────────
  window.exportCoverLetterPDF = function() {
    const contentEl = document.getElementById('coverLetterContent');
    if (!contentEl || !contentEl.textContent.trim()) {
      showToast("Please run an analysis first to generate your cover letter");
      return;
    }

    showToast("Opening Cover Letter PDF view...");

    const data = window._lastAnalysisData;
    const name = data?.profile?.name || "Candidate Name";
    const role = window._lastRole || "Target Position";
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const win = window.open('', '_blank', 'width=850,height=1100');
    if (!win) {
      showToast("Pop-up blocked! Please allow pop-ups to export PDF.");
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Cover_Letter_${name.replace(/\s+/g, '_')}</title>
        <style>
          @page { size: letter; margin: 0.5in; }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0F172A;
            background: #FFFFFF;
            margin: 0;
            padding: 24px;
            line-height: 1.6;
          }
          .header {
            border-bottom: 3px solid #0F766E;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .applicant-name { font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0; }
          .applicant-role { font-size: 0.88rem; color: #0F766E; font-weight: 700; margin-top: 3px; }
          .date-badge { text-align: right; font-size: 0.8rem; color: #64748B; }
          .recipient { font-size: 0.86rem; color: #334155; margin-bottom: 20px; line-height: 1.5; }
          .letter-content {
            font-size: 0.88rem;
            color: #1E293B;
            line-height: 1.75;
            white-space: pre-wrap;
            margin-bottom: 30px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            padding: 24px;
            border-radius: 6px;
          }
          .signature { margin-top: 28px; font-size: 0.88rem; color: #334155; }
          @media print {
            body { padding: 0; }
            .letter-content { border: none; background: transparent; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="applicant-name">${name}</h1>
            <div class="applicant-role">Applicant for ${role}</div>
          </div>
          <div class="date-badge">
            Date: ${dateStr}<br>
            CareerPilot Verified Application
          </div>
        </div>

        <div class="recipient">
          <strong>To:</strong> Hiring Committee & Talent Acquisition Team<br>
          <strong>Subject:</strong> Application for ${role} Position
        </div>

        <div class="letter-content">${contentEl.textContent.trim()}</div>

        <div class="signature">
          Sincerely,<br>
          <strong style="color: #0F172A; font-size: 0.95rem; display: inline-block; margin-top: 6px;">${name}</strong>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ─── ATS-Winning Resume Modal & PDF Generator ────────────────────────
  window.openAtsResumeModal = function() {
    const modal = document.getElementById('atsResumeModal');
    if (!modal) return;

    const data = window._lastAnalysisData;
    const role = window._lastRole || "Software Engineer";

    const profile = data ? data.profile : { name: "Candidate Name", experienceYears: 2, education: "BS Computer Science", technicalSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"] };
    const ats = data ? data.ats : { formattedBullets: [] };

    const skillsList = profile.technicalSkills && profile.technicalSkills.length > 0 
      ? profile.technicalSkills.join(" • ")
      : "Python • JavaScript • SQL • REST APIs • Docker • Git";

    const bullets = (ats.formattedBullets && ats.formattedBullets.length > 0)
      ? ats.formattedBullets.map(b => b.optimized)
      : [
          `Designed and deployed RESTful microservices for ${role} workflows using FastAPI and PostgreSQL, cutting API latency by 45%.`,
          `Implemented automated CI/CD deployment pipelines using Docker Compose, reducing manual deployment errors to zero.`,
          `Optimized SQL database query performance across core endpoints, improving throughput by 3.2x under high load.`
        ];

    const sheet = document.getElementById('atsResumeSheet');
    if (sheet) {
      sheet.innerHTML = `
        <div class="ats-cv-name">${profile.name || 'Candidate Name'}</div>
        <div class="ats-cv-contact">
          Email: candidate@email.com &nbsp;|&nbsp; Phone: +92 300 1234567 &nbsp;|&nbsp; Location: Pakistan &nbsp;|&nbsp; Target: ${role}
        </div>

        <div class="ats-cv-section-heading">PROFESSIONAL SUMMARY</div>
        <div class="ats-cv-summary-text">
          Results-oriented ${role} with ${profile.experienceYears || 1}+ years of experience building scalable applications and data workflows. Strong foundation in ${profile.education || 'Computer Science'}. Proficient in ${skillsList}. Proven track record of delivering clean, high-performance software systems aligned with engineering best practices.
        </div>

        <div class="ats-cv-section-heading">CORE TECHNICAL COMPETENCIES</div>
        <div class="ats-cv-skills-grid">
          <strong>Languages & Frameworks:</strong> ${skillsList}<br>
          <strong>Databases & Cloud:</strong> PostgreSQL, SQLite, Redis, AWS Basics, Docker<br>
          <strong>Methodologies & Tools:</strong> Git, REST APIs, Microservices, CI/CD, Agile/Scrum
        </div>

        <div class="ats-cv-section-heading">PROFESSIONAL EXPERIENCE & ACHIEVEMENTS</div>
        <div style="font-weight: bold; font-size: 0.88rem; color: #0F172A; margin-top: 4px;">${role} / Software Developer</div>
        <div style="font-size: 0.8rem; color: #475569; font-style: italic; margin-bottom: 8px;">Tech Operations — 2022 to Present</div>
        ${bullets.map(b => `<div class="ats-cv-bullet">${b}</div>`).join('')}

        <div class="ats-cv-section-heading">KEY PROJECTS</div>
        <div style="font-weight: bold; font-size: 0.85rem; color: #0F172A;">1. ${role} Automation Pipeline</div>
        <div class="ats-cv-bullet">Architected modular data pipeline handling 10,000+ daily requests with 99.9% uptime.</div>
        <div style="font-weight: bold; font-size: 0.85rem; color: #0F172A; margin-top: 6px;">2. Cloud Infrastructure Containerization</div>
        <div class="ats-cv-bullet">Containerized application microservices using Docker, streamlining developer onboarding.</div>

        <div class="ats-cv-section-heading">EDUCATION & CERTIFICATIONS</div>
        <div style="font-weight: bold; font-size: 0.85rem; color: #0F172A;">${profile.education || 'BS in Computer Science'}</div>
        <div style="font-size: 0.8rem; color: #475569;">Graduated with Honors</div>
      `;
    }

    modal.classList.add('open');
  };

  window.closeAtsResumeModal = function() {
    const modal = document.getElementById('atsResumeModal');
    if (modal) modal.classList.remove('open');
  };

  window.copyAtsResumeText = function() {
    const sheet = document.getElementById('atsResumeSheet');
    if (!sheet) return;
    navigator.clipboard.writeText(sheet.innerText).then(() => {
      showToast("ATS Resume text copied to clipboard!");
    });
  };

  window.exportATSWinningCV = function() {
    showToast("Opening ATS Resume PDF view...");

    const data = window._lastAnalysisData;
    const role = window._lastRole || "Software Engineer";

    const profile = data ? data.profile : { name: "Candidate Name", experienceYears: 2, education: "BS Computer Science", technicalSkills: ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"] };
    const ats = data ? data.ats : { formattedBullets: [] };

    const skillsList = profile.technicalSkills && profile.technicalSkills.length > 0 
      ? profile.technicalSkills.join(" • ")
      : "Python • JavaScript • SQL • REST APIs • Docker • Git";

    const bullets = (ats.formattedBullets && ats.formattedBullets.length > 0)
      ? ats.formattedBullets.map(b => b.optimized)
      : [
          `Designed and deployed RESTful microservices for ${role} workflows using FastAPI and PostgreSQL, cutting API latency by 45%.`,
          `Implemented automated CI/CD deployment pipelines using Docker Compose, reducing manual deployment errors to zero.`,
          `Optimized SQL database query performance across core endpoints, improving throughput by 3.2x under high load.`
        ];

    const win = window.open('', '_blank', 'width=850,height=1100');
    if (!win) {
      showToast("Pop-up blocked! Please allow pop-ups to export PDF.");
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>ATS_Winning_Resume_${(profile.name || "Candidate").replace(/\s+/g, '_')}</title>
        <style>
          @page { size: letter; margin: 0.4in; }
          * { box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0F172A;
            background: #FFFFFF;
            margin: 0;
            padding: 20px;
            line-height: 1.5;
          }
          .cv-name {
            font-size: 1.7rem;
            font-weight: 800;
            text-align: center;
            color: #0F172A;
            margin-bottom: 4px;
            letter-spacing: -0.01em;
          }
          .cv-contact {
            text-align: center;
            font-size: 0.82rem;
            color: #475569;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 1.5px solid #0F172A;
          }
          .cv-section {
            font-size: 0.92rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #0F172A;
            border-bottom: 1px solid #94A3B8;
            padding-bottom: 3px;
            margin-top: 14px;
            margin-bottom: 8px;
            letter-spacing: 0.05em;
          }
          .cv-text { font-size: 0.83rem; color: #334155; margin-bottom: 10px; text-align: justify; }
          .cv-skills { font-size: 0.82rem; color: #334155; margin-bottom: 10px; line-height: 1.6; }
          .cv-bullet { font-size: 0.83rem; color: #334155; margin-bottom: 5px; padding-left: 14px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="cv-name">${profile.name || 'Candidate Name'}</div>
        <div class="cv-contact">
          Email: candidate@email.com &nbsp;|&nbsp; Phone: +92 300 1234567 &nbsp;|&nbsp; Location: Pakistan &nbsp;|&nbsp; Target: ${role}
        </div>

        <div class="cv-section">PROFESSIONAL SUMMARY</div>
        <div class="cv-text">
          Results-oriented ${role} with ${profile.experienceYears || 1}+ years of experience building scalable applications and data workflows. Strong foundation in ${profile.education || 'Computer Science'}. Proficient in ${skillsList}. Proven track record of delivering clean, high-performance software systems aligned with engineering best practices.
        </div>

        <div class="cv-section">CORE TECHNICAL COMPETENCIES</div>
        <div class="cv-skills">
          <strong>Languages & Frameworks:</strong> ${skillsList}<br>
          <strong>Databases & Cloud:</strong> PostgreSQL, SQLite, Redis, AWS Basics, Docker<br>
          <strong>Methodologies & Tools:</strong> Git, REST APIs, Microservices, CI/CD, Agile/Scrum
        </div>

        <div class="cv-section">PROFESSIONAL EXPERIENCE & ACHIEVEMENTS</div>
        <div style="font-weight: bold; font-size: 0.88rem; color: #0F172A; margin-top: 4px;">${role} / Software Developer</div>
        <div style="font-size: 0.8rem; color: #475569; font-style: italic; margin-bottom: 8px;">Tech Operations — 2022 to Present</div>
        ${bullets.map(b => `<div class="cv-bullet">• ${b}</div>`).join('')}

        <div class="cv-section">KEY PROJECTS</div>
        <div style="font-weight: bold; font-size: 0.85rem; color: #0F172A;">1. ${role} Automation Pipeline</div>
        <div class="cv-bullet">• Architected modular data pipeline handling 10,000+ daily requests with 99.9% uptime.</div>
        <div style="font-weight: bold; font-size: 0.85rem; color: #0F172A; margin-top: 6px;">2. Cloud Infrastructure Containerization</div>
        <div class="cv-bullet">• Containerized application microservices using Docker, streamlining developer onboarding.</div>

        <div class="cv-section">EDUCATION & CERTIFICATIONS</div>
        <div style="font-weight: bold; font-size: 0.85rem; color: #0F172A;">${profile.education || 'BS in Computer Science'}</div>
        <div style="font-size: 0.8rem; color: #475569;">Graduated with Honors</div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ─── Toast Helper ──────────────────────────────────────────────────
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});

