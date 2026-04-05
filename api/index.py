import os
import sys

# Ensure the root of the project is in the system path for imports
# This allows Vercel to correctly resolve the 'backend' package
PROJECT_ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
sys.path.append(PROJECT_ROOT)

# Import the FastAPI application instance from the core logic
from backend.core.main import app

# Vercel looks for 'app' or 'handler' by default
__all__ = ["app"]