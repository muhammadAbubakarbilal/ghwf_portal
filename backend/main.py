#!/usr/bin/env python3
"""
GHWF Student Registration Portal — FastAPI Backend Server Entry Point
"""

import os
import sys
from pathlib import Path

# Ensure backend module is discoverable
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.config import load_env_file
load_env_file()

from app.main import app
import uvicorn

if __name__ == '__main__':
    # Detect environment
    environment = os.environ.get('ENVIRONMENT', 'development')
    host = os.environ.get('HOST', '127.0.0.1')
    port = int(os.environ.get('PORT', 8000))
    
    # Run server
    print(f"""
╔════════════════════════════════════════════════════════════════════════════╗
║                    GHWF STUDENT REGISTRATION PORTAL                        ║
║                         FastAPI Backend Server                              ║
╚════════════════════════════════════════════════════════════════════════════╝

Starting backend server...
  • Environment: {environment}
  • Server: {host}:{port}
  • API Endpoint: http://{host}:{port}/api/v1
  • Docs: http://{host}:{port}/docs

Press CTRL+C to stop the server.
""")
    
    uvicorn.run(
        'app.main:app',
        host=host,
        port=port,
        reload=(environment == 'development'),
        log_level='info' if environment == 'development' else 'warning',
    )
