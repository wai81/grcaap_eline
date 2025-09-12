from typing import Optional

from fastapi import Depends
from fastapi_pagination import Page
from fastapi_pagination.ext.async_sqlalchemy import paginate
from sqlalchemy import asc, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.v1.filter.item import ItemsFilter
from app.api.v1.filter.item_group import ItemGroupFilter
from app.api.v1.filter.staus import StatusTypeFilter, ItemStatusTypeFilter
from app.api.v1.filter.topic import TopicItemsFilter
from app.models.item_status import ItemStatus
from app.models.item_staus_type import ItemStatusType
from app.models.topic import Topic
from app.schemas.item import ItemsStatus, ItemInDB
from app.services.base import RBase
from app.models.item import Item, ItemGroup

from app.schemas.item_group import ItemGroupInDB
from app.schemas.topic import TopicInDB

from app.api.v1.filter.item import ItemsCustomFilter


class RItem(RBase[Item]):

    # async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[Item]:
    #     query = select(Item).where(Item.username == username)
    #     result = await db.execute(query)
    #     obj = result.scalars().first()
    #     return obj

    # async def is_superuser(self, user: User) -> bool:
    #     return user.is_superuser

    async def get_items_filter(
            self,
            db: AsyncSession,
            # topic_filter: Optional[TopicItemsFilter] = Depends(TopicItemsFilter),
            # group_filter: Optional[ItemGroupFilter] = Depends(ItemGroupFilter),
            # item_filter: Optional[ItemsFilter] = Depends(ItemsFilter),
            item_filter: Optional[ItemsCustomFilter] = Depends(ItemsCustomFilter)
    ) -> Page[ItemInDB]:
        # item_ = self.model
        # query = (select(
        #     item_,
        #     Topic,
        #     ItemGroup,
        # )
        #          .join(Topic, item_.topic_id == Topic.id)
        #          .join(ItemGroup, item_.item_group_id == ItemGroup.id)
        #          )

        query = select(self.model)
        # query = topic_filter.filter(query)
        # query = group_filter.filter(query)
        query = item_filter.filter(query)

        if item_filter.order_by:
            for order in item_filter.order_by:
                field_name = order.lstrip("+-")
                column = getattr(self.model, field_name)
                if order.startswith("-"):
                    query = query.order_by(column.desc())
                else:
                    query = query.order_by(column.asc())

        result = await paginate(db, query=query)
        return result

        # items = []
        # for item_obj, topic_obj, group_obj in result.items:
        #     items.append(ItemInDB(
        #         id=item_obj.id,
        #         generated_number=item_obj.generated_number,
        #         created_by=item_obj.created_by,
        #         modified_by=item_obj.modified_by,
        #         created_at=item_obj.created_at,
        #         updated_at=item_obj.updated_at,
        #         group=ItemGroupInDB(
        #             id=group_obj.id,
        #             is_closed=group_obj.is_closed,
        #             created_at=group_obj.created_at
        #         ),
        #         topic=TopicInDB(
        #             id=topic_obj.id,
        #             name_ru=topic_obj.name_ru,
        #             is_active=topic_obj.is_active
        #         ),
        #     ))
        # print(items)
        # return Page.create(items=items,
        #                    total=result.total,
        #                    page=result.page,
        #                    size=result.size,
        #                    pages=result.pages)

    async def get_items_status_filter(
            self,
            db: AsyncSession,
            topic_filter: Optional[TopicItemsFilter] = Depends(TopicItemsFilter),
            group_filter: Optional[ItemGroupFilter] = Depends(ItemGroupFilter),
            status_filter: Optional[StatusTypeFilter] = Depends(StatusTypeFilter),
            item_filter: Optional[ItemsFilter] = Depends(ItemsFilter),
            filter_modified_by_is_notnull: bool = None  # Параметр для фильтрации
    ) -> Page[ItemsStatus]:
        item_ = self.model

        # подзапрос для row_number()
        item_status_subq = (
            select(
                ItemStatus.id,
                ItemStatus.item_id,
                ItemStatus.item_status_type_id,
                ItemStatus.created_at,
                (func.row_number()
                .over(
                    partition_by=ItemStatus.item_id,
                    order_by=ItemStatus.created_at.desc()
                )
                ).label("rn")
            ).subquery()
        )

        query_ = (
            select(
                item_.id,
                Topic.id.label("topic_id"),
                Topic.name_ru,
                Topic.is_active,
                item_.generated_number,
                item_.created_at.label("item_created_at"),
                item_.modified_by,
                item_.item_group_id,
                ItemGroup.is_closed,
                item_status_subq.c.item_status_type_id.label("item_status_id"),
                ItemStatusType.name.label("item_status_name"),
                item_status_subq.c.created_at.label("status_updated_at")
            )
            .join(Topic, item_.topic_id == Topic.id)
            .join(ItemGroup, item_.item_group_id == ItemGroup.id)
            .join(item_status_subq, and_(
                item_status_subq.c.item_id == item_.id,
                item_status_subq.c.rn == 1
            ))
            .join(ItemStatusType, ItemStatusType.id == item_status_subq.c.item_status_type_id)
            .order_by(item_.created_at.asc())
        )

        query_ = topic_filter.filter(query_)
        query_ = group_filter.filter(query_)
        query_ = status_filter.filter(query_)
        query_ = item_filter.filter(query_)

        if filter_modified_by_is_notnull:
            query_ = query_.where(item_.modified_by.isnot(None))

        result = await paginate(db, query=query_)
        return result


item = RItem(Item)
