from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User

async def get_or_create_user(db: AsyncSession, username: str) -> User:
    """Get an existing user or create a new one"""
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    
    if not user:
        user = User(username=username)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    return user

async def set_online(db: AsyncSession, username: str, status: bool):
    """Set the user's online status"""
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    
    if user:
        user.is_online = status
        await db.commit()

async def get_online_users(db: AsyncSession) -> list[str]:
    """Get a list of all online users"""
    result = await db.execute(select(User.username).where(User.is_online == True))
    return list(result.scalars().all())
