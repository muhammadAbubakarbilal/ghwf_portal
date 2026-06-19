#!/usr/bin/env python3
"""
GHWF Student Registration Portal — Backend Entry Point
Used by Vercel (@vercel/python) and local uvicorn.
"""
import os
import sys
from pathlib import Path

# Make sure the backend package is importable
sys.path.insert(0, str(Path(__file__).parent))

# Load .env in local dev (no-op on Vercel where env vars are injected)
from app.config import load_env_file
load_env_file()

# Import the FastAPI app — nothing heavy runs at this point
from app.main import app  # noqa: F401  (Vercel needs `app` exported from this module)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        'app.main:app',
        host=os.environ.get('HOST', '127.0.0.1'),
        port=int(os.environ.get('PORT', 8000)),
        reload=True,
    )
