from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.services.base import RBase
from app.models.item_status import ItemStatus


class RItemStatus(RBase[ItemStatus]):
    # async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[Item]:
    #     query = select(Item).where(Item.username == username)
    #     result = await db.execute(query)
    #     obj = result.scalars().first()
    #     return obj

    # async def is_superuser(self, user: User) -> bool:
    #     return user.is_superuser

    pass


item_status = RItemStatus(ItemStatus)
