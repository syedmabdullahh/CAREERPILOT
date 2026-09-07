import io
import re
from typing import Optional

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract clean textual content from PDF byte streams.
    Supports pypdf fallback and pure byte decoding if binary markers match.
    """
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(f"--- Page {i+1} ---\n" + page_text)
        
        full_text = "\n\n".join(extracted_pages)
        if full_text.strip():
            return full_text
    except Exception as e:
        # Fallback to pdfplumber if installed
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                pages_text = [p.extract_text() or "" for p in pdf.pages]
                return "\n\n".join(pages_text)
        except Exception:
            pass

    # Final robust fallback for UTF-8/Latin encoded text documents
    try:
        decoded = file_bytes.decode('utf-8', errors='ignore')
        # Filter printable strings if it was a raw text/markdown file
        clean_lines = [line.strip() for line in decoded.splitlines() if line.strip()]
        return "\n".join(clean_lines)
    except Exception:
        return "Unable to parse resume binary content."

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Helper dispatcher based on file extension."""
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif lower.endswith(".txt") or lower.endswith(".md"):
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        return extract_text_from_pdf(file_bytes)
