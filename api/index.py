import os
import sys

# Ensure the root of the project and the backend directory are in the system path
PROJECT_ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
sys.path.append(PROJECT_ROOT)
sys.path.append(os.path.join(PROJECT_ROOT, 'backend'))

# Import the FastAPI application instance
from backend.core.main import app

# Inject root_path to handle Vercel's /api prefixing
app.root_path = "/api"

# Vercel looks for 'app' or 'handler' by default
__all__ = ["app"]