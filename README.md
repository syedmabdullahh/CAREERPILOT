# 🚀 CareerPilot — Multi-Agent Career Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Architecture](https://img.shields.io/badge/Architecture-6--Agent%20Pipeline-0F766E.svg)](#architecture)
[![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-success.svg)](#)

> **CareerPilot** is an autonomous multi-agent AI career analysis platform designed for students, fresh graduates, and software engineers. Instead of a basic chatbot, CareerPilot deploys **6 specialized AI agents** that analyze your resume in parallel across 6 core career dimensions to generate ATS-winning resumes, executive cover letters, interview coaching, and career roadmaps.

---

## ✨ Standout Key Features

### 📄 1. ATS-Winning Resume PDF Export
- **1-Column ATS-Parsable Layout**: Generates clean, high-impact vector PDFs designed specifically to score 90%+ on Applicant Tracking Systems (Workday, Greenhouse, Taleo).
- **AI Bullet Rewriter (Google X-Y-Z Formula)**: Automatically transforms weak resume points into quantified achievements (*"Accomplished X, as measured by Y, by doing Z"*).
- **1-Click PDF Save**: Vector text export guarantees 100% searchable text with zero blank page render issues.

### ✉️ 2. Tailored Executive Cover Letter Generator & PDF
- **Multi-Tone AI Customization**: Switch between **Professional**, **Energetic**, and **Direct** tones instantly.
- **Role-Matched Content**: Integrates applicant target role and matching technical skills into a sleek letterhead document.
- **Export to PDF & Copy**: Instant 1-click standalone PDF export and clipboard copy.

### 📑 3. Smooth Dossier Page Navigation
- **6 Dossier Section Pages**: Clean slide-animated page navigation between *Overview & ATS Score*, *Skill Gap Analysis*, *Bullet Rewrites*, *Cover Letter*, *Interview Prep*, and *Salary Roadmap*.
- **Page Controls**: Top page indicator bar (`Page X of 6`), interactive progress dots, and bottom `← Previous Page` / `Next Page →` navigation bars.

### 🤖 4. Autonomous 6-Agent Swarm Pipeline
1. 🔍 **Resume Audit Agent**: Extracts credentials, total experience, core tech stack, and profile summary.
2. 🎯 **Skill Gap Agent**: Cross-references applicant skills with target market demands and identifies missing high-priority skills.
3. ⚡ **ATS Bullet Rewriter**: Calculates ATS readiness score (0-100) and rewrites bullet points with metrics.
4. 📝 **Cover Letter Agent**: Crafts custom cover letters matched to company acquisition teams.
5. 🎤 **STAR Interview Coach**: Generates role-specific behavioral and technical interview questions with STAR method evaluation & timers.
6. 📈 **Career Roadmap Agent**: Benchmark salaries (Local PKR & Remote USD) with 30-60-90 day skill acquisition plans.

### 💾 5. Zero-Config Local SQLite Database
- Built-in SQLite persistence (`storage/careerpilot.db`) to record candidate profiles, analysis runs, and session logs automatically.

---

## 🔒 Security & Privacy Audit

This repository has been audited for open-source and hackathon submission compliance:
- **Zero Secrets / API Keys**: No API keys, passwords, or credentials are hardcoded anywhere in the codebase.
- **Environment Isolation**: All configuration is managed via `.env` with a sanitized template provided in `.env.example`.
- **Git Ignore Security**: Comprehensive `.gitignore` configured to prevent accidental upload of `.env`, SQLite databases (`*.db`, `*.sqlite`), temporary artifacts, and Python cache files.
- **Dual-Mode Privacy**: Works **100% offline in browser mode** using `engine.js` without sending any personal data over the network, or connects to your local FastAPI backend when powered up.

---

## 🏗️ Architecture & Project Structure

```
CAREERPILOT/
├── index.html                     # Responsive Web Interface & Page Navigation
├── docker-compose.yml             # Container Orchestration
├── Dockerfile                     # FastAPI Backend Container
├── .env.example                   # Environment Configuration Template
├── .gitignore                     # Security & Privacy Exclusion Rules
│
├── frontend/
│   ├── assets/logo.svg            # CareerPilot Brand Identity
│   ├── css/style.css              # Dark Navy + Teal Design System & Page Animations
│   └── js/
│       ├── engine.js              # Client-Side 6-Agent Engine (Zero-Config Offline Mode)
│       └── app.js                 # Dossier Controller, API Gateway & Native PDF Exporter
│
└── backend/
    ├── main.py                    # FastAPI Server with CORS & REST Endpoints
    ├── config.py                  # Environment Settings (Pydantic v2)
    ├── database.py                # SQLite Database Models & Session Management
    ├── requirements.txt           # Python Dependencies
    ├── agents/
    │   ├── agents.py              # 6 AI Agent Implementations (Qwen 2.5 / OpenAI LLM)
    │   ├── pipeline.py            # Sequential & Parallel Agent Orchestrator
    │   ├── prompts.py             # System Prompts & Structured JSON Schemas
    │   └── tools.py               # Market Salary & Tech Skill Data Tools
    ├── models/schemas.py          # Pydantic Schemas for Requests & Responses
    ├── utils/
    │   ├── pdf_parser.py          # Server-Side Resume PDF Parser (PyPDF & pdfplumber)
    │   └── text_cleaner.py        # Text Normalizer & Regex Skill Extractors
    └── tests/test_agents.py       # Automated Pytest Suite
```

---

## 🚀 Quick Start Guide

### Option 1: Browser Instant Launch (Zero Dependencies)
Simply open `index.html` directly in any web browser (Chrome, Edge, Safari, Firefox):
1. Double-click `index.html` or drag it into your browser.
2. Select a preset sample profile (e.g. *Software Engineer (Backend)*).
3. Click **Analyze My Resume →**.

### Option 2: FastAPI Backend Engine
To enable full LLM power via Qwen 2.5 or OpenAI:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/CAREERPILOT.git
cd CAREERPILOT

# 2. Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Create environment file (Optional: add your LLM API Key)
cp .env.example .env

# 5. Launch FastAPI server
cd backend
uvicorn main:app --reload --port 8000
```
Then open `index.html` in your browser. The application will automatically detect the backend server at `http://localhost:8000`.

### Option 3: Docker Deployment

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- FastAPI Server: `http://localhost:8000`
- API Swagger Docs: `http://localhost:8000/docs`

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Tokens & Glassmorphism), JavaScript (ES6+)
- **Backend API**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Database**: SQLite / SQLAlchemy
- **AI & LLM Integration**: Qwen 2.5 / OpenAI API via `httpx`
- **PDF Extraction**: `pdf.js` (Browser) & `PyPDF`/`pdfplumber` (Server)
- **PDF Generation**: Native Vector Print-to-PDF Engine
- **DevOps**: Docker, Docker Compose

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
