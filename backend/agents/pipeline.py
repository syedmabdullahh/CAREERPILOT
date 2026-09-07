from typing import Dict, Any, TypedDict
from agents.agents import (
    ResumeAnalysisAgent,
    SkillGapAgent,
    ATSOptimizationAgent,
    CoverLetterAgent,
    InterviewPrepAgent,
    CareerAdvisorAgent
)

class GraphState(TypedDict):
    resume_text: str
    target_role: str
    company_name: str
    parsed_profile: Dict[str, Any]
    skill_gap_analysis: Dict[str, Any]
    ats_optimization: Dict[str, Any]
    cover_letter: Dict[str, Any]
    interview_prep: Dict[str, Any]
    career_roadmap: Dict[str, Any]

class CareerPilotPipeline:
    """Orchestrates the multi-agent career evaluation pipeline."""
    
    @staticmethod
    async def run_pipeline(resume_text: str, target_role: str = "Software Engineer", company_name: str = "Target Tech Corp") -> Dict[str, Any]:
        # 1. Resume Analysis Agent
        parsed_profile = await ResumeAnalysisAgent.run(resume_text)
        
        # 2. Skill Gap Detection Agent
        skill_gap = await SkillGapAgent.run(parsed_profile, target_role)
        
        # 3. ATS Optimization Agent
        ats_optimization = await ATSOptimizationAgent.run(parsed_profile, target_role, skill_gap)
        
        # 4. Cover Letter Agent
        cover_letter = await CoverLetterAgent.run(parsed_profile, target_role, company_name)
        
        # 5. Interview Prep Agent
        interview_prep = await InterviewPrepAgent.run(target_role, skill_gap)
        
        # 6. Career Advisor Agent
        career_roadmap = await CareerAdvisorAgent.run(target_role, skill_gap)
        
        return {
            "status": "success",
            "resume_analysis": parsed_profile,
            "skill_gap_analysis": skill_gap,
            "ats_optimization": ats_optimization,
            "cover_letter": cover_letter,
            "interview_prep": interview_prep,
            "career_roadmap": career_roadmap
        }
