import sys
from pathlib import Path

# Add backend directory to sys.path
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from app.main import app

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", os.environ.get("RENDER_PORT", 10000)))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
