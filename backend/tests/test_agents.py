"""
Unit and integration tests for CareerPilot AI Multi-Agent Pipeline.
"""

import unittest
from backend.utils.text_cleaner import clean_resume_text, extract_contact_info, extract_keywords
from backend.agents.tools import lookup_salary_benchmark, get_hiring_companies
from backend.agents.pipeline import CareerPilotOrchestrator

SAMPLE_RESUME = """
Muhammad Hamza
Email: hamza.cs@gmail.com | Phone: +92 300 1234567 | Lahore, Pakistan

EDUCATION
Bachelor of Science in Computer Science (BSCS) - FAST-NUCES (2020 - 2024)

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, C++, SQL
Frameworks: React, FastAPI, Node.js, Express, TailwindCSS
Tools: Git, Docker, MongoDB, PostgreSQL, Postman

PROJECTS
1. E-Commerce Microservices Platform (FastAPI, Docker, React, MongoDB)
- Built scalable order and inventory microservices handling 1,000+ mock transactions per minute.
- Integrated JWT authentication and Redis caching, reducing API response times by 35%.

2. AI Smart Job Matcher (Python, Scikit-Learn, Flask)
- Developed NLP parser calculating TF-IDF cosine similarity between applicant resumes and jobs.
"""

class TestCareerPilotPipeline(unittest.TestCase):

    def test_text_cleaner_and_extraction(self):
        cleaned = clean_resume_text(SAMPLE_RESUME)
        self.assertIn("Muhammad Hamza", cleaned)
        
        info = extract_contact_info(cleaned)
        self.assertEqual(info["email"], "hamza.cs@gmail.com")
        self.assertEqual(info["phone"], "+92 300 1234567")
        
        skills = extract_keywords(cleaned)
        self.assertIn("Python", skills)
        self.assertIn("FastAPI", skills)
        self.assertIn("Docker", skills)

    def test_tools_salary_lookup(self):
        salary = lookup_salary_benchmark("Junior Software Engineer", 1.0)
        self.assertIn("PKR", salary["pkr"])
        self.assertIn("USD", salary["remote_usd"])

    def test_pipeline_execution(self):
        orchestrator = CareerPilotOrchestrator()
        result = orchestrator.run_pipeline(
            resume_text=SAMPLE_RESUME,
            job_description="Looking for a Junior Backend Developer proficient in Python, FastAPI, and Docker.",
            target_role="Junior Backend Developer"
        )
        self.assertIsNotNone(result)
        self.assertIn("resume_analysis", result)
        self.assertIn("ats_optimization", result)
        self.assertGreaterEqual(result["ats_optimization"]["ats_score"], 50)

if __name__ == "__main__":
    unittest.main()
