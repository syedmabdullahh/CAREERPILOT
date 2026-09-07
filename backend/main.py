"""
CareerPilot AI — FastAPI Backend Server
Multi-agent career analysis pipeline with Qwen LLM integration.
"""

import os
import io
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict, Any

from dotenv import load_dotenv
load_dotenv()

# Import pipeline
from agents.pipeline import CareerPilotPipeline

app = FastAPI(
    title="CareerPilot AI",
    description="Multi-agent career intelligence API — Resume analysis, skill gaps, ATS optimization, cover letters, interview prep, and career roadmaps.",
    version="2.4.0"
)

# CORS — allow frontend on any origin during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Schemas ──────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    resume_text: str
    target_role: str = "Software Engineer"
    company_name: Optional[str] = "Target Company"


# ─── Routes ───────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "CareerPilot AI",
        "version": "2.4.0",
        "status": "online",
        "endpoints": {
            "health": "/api/health",
            "analyze_text": "POST /api/analyze-text",
            "analyze_upload": "POST /api/analyze-upload"
        },
        "agents": [
            "Resume Audit",
            "Skill Gap Analysis",
            "ATS Optimization",
            "Cover Letter Generation",
            "Interview Preparation",
            "Career Roadmap"
        ]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "llm_provider": os.getenv("LLM_PROVIDER", "qwen"),
        "llm_model": os.getenv("QWEN_MODEL", "qwen-max")
    }


@app.post("/api/analyze-text")
async def analyze_text(request: AnalysisRequest):
    """Run the full 6-agent pipeline on raw resume text."""
    if not request.resume_text or len(request.resume_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Resume text must be at least 20 characters.")

    try:
        result = await CareerPilotPipeline.run_pipeline(
            resume_text=request.resume_text,
            target_role=request.target_role,
            company_name=request.company_name or "Target Company"
        )

        # Save to database
        try:
            from database import save_analysis
            ra = result.get("resume_analysis", {})
            sg = result.get("skill_gap_analysis", {})
            ats = result.get("ats_optimization", {})
            save_analysis(
                candidate_name=ra.get("name", "Unknown"),
                target_role=request.target_role,
                ats_score=ats.get("ats_compatibility_score", 0),
                skill_match_score=sg.get("match_score", 0),
                resume_text=request.resume_text,
                result_data=result
            )
        except Exception as db_err:
            print(f"Database save warning: {db_err}")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


@app.post("/api/analyze-upload")
async def analyze_upload(
    file: UploadFile = File(...),
    target_role: str = Form("Software Engineer"),
    company_name: str = Form("Target Company")
):
    """Upload a PDF/TXT resume file and run the full 6-agent pipeline."""
    text_content = ""

    try:
        raw_bytes = await file.read()

        if file.filename.lower().endswith(".pdf"):
            # Try pypdf first
            try:
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(raw_bytes))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content += page_text + "\n"
            except Exception:
                pass

            # Fallback to pdfplumber if pypdf didn't extract enough
            if len(text_content.strip()) < 30:
                try:
                    import pdfplumber
                    with pdfplumber.open(io.BytesIO(raw_bytes)) as pdf:
                        for page in pdf.pages:
                            page_text = page.extract_text()
                            if page_text:
                                text_content += page_text + "\n"
                except Exception:
                    pass
        else:
            text_content = raw_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse resume file: {str(e)}")

    if not text_content or len(text_content.strip()) < 10:
        text_content = f"Uploaded Resume: {file.filename}. Content could not be fully extracted from the binary PDF."

    try:
        result = await CareerPilotPipeline.run_pipeline(
            resume_text=text_content,
            target_role=target_role,
            company_name=company_name
        )

        # Save to database
        try:
            from database import save_analysis
            ra = result.get("resume_analysis", {})
            sg = result.get("skill_gap_analysis", {})
            ats = result.get("ats_optimization", {})
            save_analysis(
                candidate_name=ra.get("name", "Unknown"),
                target_role=target_role,
                ats_score=ats.get("ats_compatibility_score", 0),
                skill_match_score=sg.get("match_score", 0),
                resume_text=text_content[:3000],
                result_data=result
            )
        except Exception as db_err:
            print(f"Database save warning: {db_err}")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


# ─── History & Database Endpoints ─────────────────────────────────────

@app.get("/api/history")
def get_history(limit: int = 20):
    """Get list of recent analysis runs."""
    from database import get_analysis_history
    return {"history": get_analysis_history(limit)}


@app.get("/api/history/{analysis_id}")
def get_analysis(analysis_id: int):
    """Get full details of a single past analysis."""
    from database import get_analysis_by_id
    record = get_analysis_by_id(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return record


@app.delete("/api/history/{analysis_id}")
def delete_analysis_route(analysis_id: int):
    """Delete a past analysis record."""
    from database import delete_analysis
    if delete_analysis(analysis_id):
        return {"status": "deleted", "id": analysis_id}
    raise HTTPException(status_code=404, detail="Analysis not found")


@app.get("/api/stats")
def get_stats():
    """Get aggregate statistics across all analyses."""
    from database import get_stats
    return get_stats()


# ─── Entry Point ──────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

