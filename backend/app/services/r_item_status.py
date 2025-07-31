from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.services.base import RBase
from app.models.item_status import ItemStatus
from fastapi_pagination import Page
from fastapi_pagination.ext.async_sqlalchemy import paginate


class RItemStatus(RBase[ItemStatus]):
    # async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[Item]:
    #     query = select(Item).where(Item.username == username)
    #     result = await db.execute(query)
    #     obj = result.scalars().first()
    #     return obj

    # async def is_superuser(self, user: User) -> bool:
    #     return user.is_superuser

    async def get_list(
            self, db: AsyncSession, *,
            sort: str = None,
            order: str = None,
            filters: str = None,
    ) -> Page[ItemStatus]:
        # query = select(from_obj=self.model, columns='*')
        query = select(self.model)
        result = await paginate(db, query=query)
        # result = await db.execute(query.offset(skip).limit(limit))
        return result


item_status = RItemStatus(ItemStatus)
