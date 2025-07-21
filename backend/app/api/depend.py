from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from app.config import settings
from app.db.session import SessionLocalAsync
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app import services


async def get_db() -> Generator:
    db = SessionLocalAsync()
    db.current_user_id = None
    try:
        yield db
        await db.commit()
    finally:
        await db.close()
