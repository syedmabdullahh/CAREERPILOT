"""
Agent Tools and External Integrations for CareerPilot AI.
Provides market data lookups, salary indexing, and skill taxonomy benchmarks.
"""

from typing import Dict, Any, List

PAKISTAN_TECH_SALARY_BENCHMARKS = {
    "junior_software_engineer": {"pkr": "PKR 90,000 - 160,000 / mo", "remote_usd": "$12,000 - $22,000 / yr"},
    "mid_software_engineer": {"pkr": "PKR 180,000 - 320,000 / mo", "remote_usd": "$25,000 - $45,000 / yr"},
    "senior_software_engineer": {"pkr": "PKR 350,000 - 650,000+ / mo", "remote_usd": "$50,000 - $95,000+ / yr"},
    "frontend_developer": {"pkr": "PKR 85,000 - 160,000 / mo", "remote_usd": "$14,000 - $24,000 / yr"},
    "data_analyst": {"pkr": "PKR 80,000 - 150,000 / mo", "remote_usd": "$12,000 - $20,000 / yr"},
    "data_scientist": {"pkr": "PKR 120,000 - 240,000 / mo", "remote_usd": "$20,000 - $40,000 / yr"},
    "ai_engineer": {"pkr": "PKR 150,000 - 300,000 / mo", "remote_usd": "$28,000 - $55,000 / yr"},
    "devops_engineer": {"pkr": "PKR 140,000 - 280,000 / mo", "remote_usd": "$25,000 - $48,000 / yr"}
}

PAKISTAN_TOP_TECH_EMPLOYERS = [
    "Systems Limited", "Arbisoft", "NetSol Technologies", "10Pearls",
    "Afiniti", "Devsinc", "Careem (R&D)", "S&P Global Pakistan",
    "Educative", "KeepTruckin / Motive", "VentureDive", "Contour Software"
]

def lookup_salary_benchmark(role: str, experience_years: float = 0.5) -> Dict[str, str]:
    """Retrieve indexed salary compensation data for Pakistani and Global remote markets."""
    role_normalized = role.lower().replace(" ", "_")
    
    # Simple matching
    for key, data in PAKISTAN_TECH_SALARY_BENCHMARKS.items():
        if key in role_normalized or role_normalized in key:
            return data
            
    # Default fallback
    if experience_years < 2:
        return PAKISTAN_TECH_SALARY_BENCHMARKS["junior_software_engineer"]
    elif experience_years < 5:
        return PAKISTAN_TECH_SALARY_BENCHMARKS["mid_software_engineer"]
    else:
        return PAKISTAN_TECH_SALARY_BENCHMARKS["senior_software_engineer"]

def get_hiring_companies(role: str) -> List[str]:
    """Return top active hiring companies in the region for this talent segment."""
    return PAKISTAN_TOP_TECH_EMPLOYERS[:6]
