import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CareerPilot AI"
    VERSION: str = "2.4.0"
    API_PREFIX: str = "/api/v1"
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "qwen")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "qwen2.5:7b")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_API_BASE_URL", "https://api.together.xyz/v1")
    
    # Execution & Limits
    AGENT_TIMEOUT: int = int(os.getenv("AGENT_TIMEOUT_SECONDS", "45"))
    MAX_RESUME_TOKENS: int = int(os.getenv("MAX_RESUME_TOKENS", "4000"))
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    
    # Defaults
    DEFAULT_ROLE: str = "Junior Software Engineer"
    DEFAULT_REGION: str = "Pakistan"
    CURRENCY: str = "PKR"

settings = Settings()
