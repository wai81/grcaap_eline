from typing import Optional, Any, List

from fastapi_pagination import Page
from fastapi_pagination.ext.async_sqlalchemy import paginate
from sqlalchemy import func, or_
from sqlalchemy.sql import literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import aliased

from app.api.v1.filter.topic import TopicFilter
from app.models.item import Item, ItemGroup
from app.schemas.topic import TopicInDB, LineTopic
from app.services.base import RBase
from app.models.topic import Topic


class RTopic(RBase[Topic]):
    # async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[Item]:
    #     query = select(Item).where(Item.username == username)
    #     result = await db.execute(query)
    #     obj = result.scalars().first()
    #     return obj

    # async def is_superuser(self, user: User) -> bool:
    #     return user.is_superuser

    async def get_topics_filter(
            self,
            db: AsyncSession, *,
            filters: TopicFilter,
    ) -> Page[TopicInDB]:

        query = select(self.model)

        if filters:
            # query = filters.filter(query)
            # Применяем кастомные фильтры
            query = filters.custom_filter(query, filters)
        query = query.order_by("name_ru")
        result = await paginate(db, query=query)
        return result

    async def get_count_items_topic(
            self,
            db: AsyncSession, *,
            topic_id: int,
    ) -> LineTopic:
        query = (
            select(
                Topic.id.label("topic_id"),
                Topic.name_ru.label("name"),
                func.coalesce(func.count(Item.id), 0).label('count_items')
            )
            .outerjoin(Item, Item.topic_id == Topic.id)
            .outerjoin(ItemGroup, ItemGroup.id == Item.item_group_id)
            .filter(
                Topic.id == topic_id,
                Topic.is_active.is_(True),
                or_(ItemGroup.is_closed.is_(False), ItemGroup.is_closed.is_(None)),
                or_(Item.modified_by.is_(None)),
                or_(
                    Item.created_at.between(
                        func.current_date(),
                        # func.current_date() + func.interval('1 day') - func.interval('1 second')
                        # func.current_date() + func.text("INTERVAL '1 day'") - func.text("INTERVAL '1 second'")
                        func.current_date() + literal_column("interval '1 day'") - literal_column("interval '1 second'")
                    ),
                    Item.created_at.is_(None)
                )
            )
            .group_by(Topic.id, Topic.name_ru)
            .order_by(Topic.id.asc())
        )
        query_result = await db.execute(query)
        result = query_result.first()

        return result


topic = RTopic(Topic)
