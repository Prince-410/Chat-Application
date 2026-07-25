import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from app.config import UPLOAD_DIR, BASE_DIR
from app.database.init_db import init_db
from app.routes.pages import router as pages_router
from app.routes.api import router as api_router
from app.websocket.handler import router as websocket_router

app = FastAPI(title="Chat Application")

# Mount static files
static_dir = BASE_DIR / "app" / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include routers
app.include_router(pages_router, prefix="")
app.include_router(api_router, prefix="")
app.include_router(websocket_router, prefix="")

@app.on_event("startup")
async def startup_event():
    """Run on startup"""
    await init_db()
    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    # Ensure templates directory exists
    templates_dir = BASE_DIR / "app" / "templates"
    templates_dir.mkdir(parents=True, exist_ok=True)

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    """Custom 404 handler"""
    return JSONResponse(status_code=404, content={"message": "Resource not found"})

@app.exception_handler(500)
async def server_error_handler(request: Request, exc: Exception):
    """Custom 500 handler"""
    import traceback
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"message": f"Internal server error: {str(exc)}"})

