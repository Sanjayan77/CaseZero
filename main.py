import sys
import os
from pathlib import Path

# Ensure backend directory is in python module search path
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", os.environ.get("RENDER_PORT", 10000)))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
