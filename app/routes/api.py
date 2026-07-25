from fastapi import APIRouter, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database.connection import get_db
from app.services import file_service, message_service
from app.config import UPLOAD_DIR

router = APIRouter()

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...), sender: str = Form(...)):
    """Handle file uploads"""
    file_info = await file_service.save_upload(file)
    return file_info

@router.get("/api/download/{filename}")
async def download_file(filename: str):
    """Serve an uploaded file"""
    file_path = UPLOAD_DIR / filename
    return FileResponse(path=file_path)

@router.get("/api/history")
async def get_history(
    recipient: Optional[str] = None, 
    sender: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    """Get chat history"""
    if recipient and sender:
        messages = await message_service.get_private_messages(db, sender, recipient)
    else:
        messages = await message_service.get_recent_messages(db)
    return messages
