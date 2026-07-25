from app.database.connection import engine, Base
from app.models.user import User
from app.models.message import Message

async def init_db():
    """Initialize the database by creating all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
