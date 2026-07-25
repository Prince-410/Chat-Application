import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Database URL for SQLite using aiosqlite
DATABASE_URL = f"sqlite+aiosqlite:///{BASE_DIR / 'chat.db'}"

# Directory to store uploaded files
UPLOAD_DIR = BASE_DIR / "uploads"

# Maximum allowed file size (10 MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed file extensions for uploads
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".doc", ".docx", ".txt"}
