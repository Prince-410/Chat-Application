from fastapi import APIRouter, Request, Query
from fastapi.templating import Jinja2Templates
from app.config import BASE_DIR

router = APIRouter()
templates = Jinja2Templates(directory=str(BASE_DIR / "app" / "templates"))

@router.get("/")
async def login_page(request: Request):
    """Render the login page"""
    return templates.TemplateResponse(request=request, name="login.html")

@router.get("/chat")
async def chat_page(request: Request, username: str = Query(...)):
    """Render the chat page"""
    return templates.TemplateResponse(request=request, name="chat.html", context={"username": username})

