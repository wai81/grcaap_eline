from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from fastapi_pagination import Page
from sqlalchemy.future import select
from sqlalchemy import asc
from fastapi_pagination.ext.async_sqlalchemy import paginate

from app.api.v1.filter.item import ItemsFilter
from app.api.v1.filter.staus import StatusTypeFilter, ItemStatusTypeFilter
from app.api.v1.filter.topic import TopicItemsFilter
from app.api.v1.filter.item_group import ItemGroupFilter
from app.models.item import ItemGroup, Item
from app.models.item_status import ItemStatus
from app.models.item_staus_type import ItemStatusType
from app.models.topic import Topic
from app.schemas.item import ItemsStatus

router = APIRouter()


@router.get("/wait_items",
            status_code=200,
            response_model=Page[ItemsStatus])
async def get_items_wait(*,
                         db: AsyncSession = Depends(get_db),
                         topic_filter: TopicItemsFilter = Depends(TopicItemsFilter),
                         group_filter: ItemGroupFilter = Depends(ItemGroupFilter),
                         status_filter: StatusTypeFilter = Depends(StatusTypeFilter),
                         item_filter: ItemsFilter = Depends(ItemsFilter)
                         ) -> Page[ItemsStatus]:
    result = await (services.item.
                    get_items_status_filter(db, topic_filter, group_filter,
                                            status_filter, item_filter,
                                            filter_modified_by_is_notnull=False
                                            ))
    return result


@router.get("/handing_items",
            status_code=200,
            response_model=Page[ItemsStatus])
async def get_items_handing(*,
                            db: AsyncSession = Depends(get_db),
                            topic_filter: TopicItemsFilter = Depends(TopicItemsFilter),
                            group_filter: ItemGroupFilter = Depends(ItemGroupFilter),
                            status_filter: StatusTypeFilter = Depends(StatusTypeFilter),
                            item_filter: ItemsFilter = Depends(ItemsFilter)
                            ) -> Page[ItemsStatus]:
    result = await (services.item.
                    get_items_status_filter(db, topic_filter, group_filter,
                                            status_filter, item_filter,
                                            filter_modified_by_is_notnull=True
                                            ))
    return result
