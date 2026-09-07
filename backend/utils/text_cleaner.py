import re
from typing import Dict, List, Optional

EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}'

COMMON_TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
    "FastAPI", "Django", "Flask", "SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "CI/CD",
    "HTML", "CSS", "TailwindCSS", "REST APIs", "GraphQL", "Machine Learning", "PyTorch",
    "TensorFlow", "Pandas", "NumPy", "Scikit-Learn", "C++", "Java", "Go", "Rust"
]

def clean_resume_text(raw_text: str) -> str:
    """Normalize whitespace, remove weird non-printable glyphs, and fix newlines."""
    # Replace non-breaking spaces and tabs
    text = raw_text.replace('\xa0', ' ').replace('\t', ' ')
    # Consolidate multiple empty lines into double newlines
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    # Strip trailing whitespace on each line
    lines = [line.strip() for line in text.split('\n')]
    return '\n'.join(lines).strip()

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extract email, phone, and potential candidate name."""
    email_match = re.search(EMAIL_REGEX, text)
    phone_match = re.search(PHONE_REGEX, text)
    
    email = email_match.group(0) if email_match else None
    phone = phone_match.group(0) if phone_match else None
    
    # Attempt name extraction from first few non-empty lines
    lines = [l.strip() for l in text.split('\n') if l.strip() and not re.search(r'resume|curriculum|page', l, re.I)]
    name = lines[0] if lines and len(lines[0].split()) <= 4 else "Candidate"
    
    return {
        "name": name,
        "email": email,
        "phone": phone
    }

def extract_keywords(text: str) -> List[str]:
    """Identify matched technical skills present in text."""
    found = []
    text_lower = f" {text.lower()} "
    for skill in COMMON_TECH_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found
