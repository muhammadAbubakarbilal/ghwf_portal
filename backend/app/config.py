import os
from pathlib import Path


def load_env_file() -> None:
    """Load .env file only in local development. Safe to call anywhere — 
    does nothing if the file doesn't exist (e.g. on Vercel)."""
    root_dir = Path(__file__).resolve().parents[2]
    env_file = root_dir / '.env'

    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value
