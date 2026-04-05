import os
import sys

# Add project root and backend dir to sys.path so all modules resolve correctly
PROJECT_ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, os.path.join(PROJECT_ROOT, 'backend'))

# Import the FastAPI application instance
from backend.core.main import app

# Vercel requires the 'app' symbol to be present at module level
__all__ = ["app"]