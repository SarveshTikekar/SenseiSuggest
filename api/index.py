import os
import sys

# Add project root and backend dir to sys.path so all modules resolve correctly
PROJECT_ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, os.path.join(PROJECT_ROOT, 'backend'))

# Import the FastAPI application instance
from backend.core.main import app as _fastapi_app

# Vercel forwards the full path (e.g. /api/get_countries) to this function.
# FastAPI only knows routes at the root level (e.g. /get_countries).
# This ASGI wrapper strips the /api prefix before FastAPI processes the request,
# so no changes are needed to any backend route definitions.
async def app(scope, receive, send):
    if scope["type"] in ("http", "websocket"):
        path = scope.get("path", "")
        if path.startswith("/api"):
            scope["path"] = path[4:] or "/"
            raw = scope.get("raw_path", b"")
            if raw.startswith(b"/api"):
                scope["raw_path"] = raw[4:] or b"/"
    await _fastapi_app(scope, receive, send)

__all__ = ["app"]