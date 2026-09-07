# CareerPilot AI — System Architecture & Multi-Agent Swarm

CareerPilot AI is an autonomous multi-agent career intelligence platform engineered specifically for fresh graduates, career switchers, and job applicants.

---

## 1. High-Level Architecture

```
                                  ┌────────────────────────┐
                                  │   User / Web Client    │
                                  │  (Sleek HTML5/CSS3/JS) │
                                  └───────────┬────────────┘
                                              │ REST / JSON (or Client Engine Fallback)
                                              ▼
                                  ┌────────────────────────┐
                                  │   FastAPI Gateway      │
                                  │    (backend/main.py)   │
                                  └───────────┬────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
          ┌─────────────────────┐                           ┌─────────────────────┐
          │ Text & PDF Parsing  │                           │ Session Management  │
          │ (backend/utils/)    │                           │ & Schema Validation │
          └──────────┬──────────┘                           └─────────────────────┘
                     │ Normalized Resume & Job Payload
                     ▼
          ┌────────────────────────────────────────────────────────────┐
          │            CareerPilot Autonomous Swarm Orchestrator       │
          │                   (backend/agents/pipeline.py)             │
          └──────┬────────────┬────────────┬───────────┬───────────┬───┘
                 │            │            │           │           │
                 ▼            ▼            ▼           ▼           ▼
             [Agent 1]    [Agent 2]    [Agent 3]   [Agent 4]   [Agent 5]   [Agent 6]
              Resume        Skill         ATS        Cover     Interview    Career
              Auditor        Gap       Optimizer     Letter       Prep     Advisor
                 │            │            │           │           │           │
                 └────────────┴────────────┴───────────┴───────────┴───────────┘
                                              │ Aggregated JSON Payload
                                              ▼
                                  ┌────────────────────────┐
                                  │  Interactive Executive  │
                                  │   Career Intelligence  │
                                  │         Dossier        │
                                  └────────────────────────┘
```

---

## 2. The 6 Specialized Autonomous Agents

| Agent Name | Primary Responsibility | Key Outputs |
| :--- | :--- | :--- |
| **1. Resume Auditor** | Deep semantic parsing of background & education | Strengths, red flags, experience calculation, skill categorization |
| **2. Skill Gap Specialist** | Differential comparison between candidate & target role | Missing critical tech, gap percentage, 30-60-90 day learning roadmap |
| **3. ATS Algorithm Engine** | Simulates Taleo, Workday, & Greenhouse parsers | ATS score gauge, keyword density, X-Y-Z bullet point rewrites |
| **4. Cover Letter Craftsman** | Generates high-converting, tailored cover letters | Hook opening, project highlights, customizable professional tone |
| **5. Interview Simulator** | Prepares technical & STAR behavioral question bank | Real interview questions, STAR method breakdown, sample answers |
| **6. Career Strategist** | Mentorship, regional compensation benchmarks & trajectory | Salary range (PKR & USD Remote), top hiring companies, promotions |

---

## 3. Resilience & Dual-Mode Fallback Architecture

To guarantee 100% uptime during high-stakes live hackathon presentations and offline evaluations:
1. **Live Cloud/Local Mode**: Communicates with FastAPI backend running Qwen 2.5 LLM / OpenAI API.
2. **Autonomous Client Fallback Engine (`engine.js`)**: If the backend is unavailable or running without internet, the built-in intelligent heuristic engine takes over client-side seamlessly, providing instant, deeply personalized parsing and analysis with zero downtime.

---

## 4. Tech Stack

- **Frontend**: HTML5, Modern CSS (Design tokens, glassmorphism, responsive grid), Vanilla JavaScript (ES6+ modular architecture)
- **Backend API**: FastAPI, Uvicorn, Pydantic v2
- **Document Processing**: PyPDF, pdfplumber, custom regex text cleaners
- **LLM Integration**: Qwen 2.5 7B / Together AI / OpenAI / Ollama compatible
- **Deployment**: Docker, Docker Compose, Nginx
