from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text of the candidate's resume")
    job_description: Optional[str] = Field(default="", description="Target job description")
    target_role: Optional[str] = Field(default="Software Engineer", description="Desired role or career title")
    candidate_name: Optional[str] = Field(default="", description="Candidate full name")
    experience_level: Optional[str] = Field(default="Entry-Level / Fresh Graduate", description="Experience tier")

class AgentExecutionStatus(BaseModel):
    agent_id: str
    name: str
    status: str # "pending", "running", "completed", "failed"
    duration_ms: Optional[int] = 0
    error_message: Optional[str] = None

class ResumeAnalysisResult(BaseModel):
    candidate_name: str
    extracted_email: Optional[str] = None
    extracted_phone: Optional[str] = None
    experience_years: float = 0.0
    education_level: str
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    summary_verdict: str

class SkillGapResult(BaseModel):
    matching_skills: List[str] = []
    missing_critical_skills: List[str] = []
    recommended_certifications: List[str] = []
    gap_percentage: int
    learning_roadmap_30_days: List[str] = []
    learning_roadmap_60_days: List[str] = []
    learning_roadmap_90_days: List[str] = []

class ATSResult(BaseModel):
    ats_score: int
    readability_score: int
    keyword_match_rate: int
    format_compliance: str
    critical_formatting_issues: List[str] = []
    keyword_inclusions: List[str] = []
    optimized_bullet_points: List[Dict[str, str]] = [] # {"original": "...", "improved": "..."}

class CoverLetterResult(BaseModel):
    recipient_company: str
    role_title: str
    tone: str
    salutation: str
    opening_hook: str
    core_pitch: str
    project_highlight: str
    call_to_action: str
    full_markdown: str

class InterviewQuestion(BaseModel):
    category: str # "Technical", "Behavioral", "System Design", "Cultural"
    question: str
    difficulty: str # "Easy", "Medium", "Hard"
    star_guide: Dict[str, str] # {"Situation": "...", "Task": "...", "Action": "...", "Result": "..."}
    sample_answer: str

class InterviewPrepResult(BaseModel):
    target_role: str
    questions: List[InterviewQuestion] = []
    pro_tips: List[str] = []

class CareerAdvisorResult(BaseModel):
    projected_salary_range_pkr: str
    projected_salary_range_usd: str
    short_term_trajectory: str
    mid_term_trajectory: str
    long_term_trajectory: str
    target_hiring_companies: List[str] = []
    recommended_networking_strategy: str

class CompletePipelineResponse(BaseModel):
    session_id: str
    execution_time_total_ms: int
    agents_status: List[AgentExecutionStatus]
    resume_analysis: ResumeAnalysisResult
    skill_gap: SkillGapResult
    ats_optimization: ATSResult
    cover_letter: CoverLetterResult
    interview_prep: InterviewPrepResult
    career_guidance: CareerAdvisorResult
