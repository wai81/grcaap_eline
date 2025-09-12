from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_filter import FilterDepends
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from fastapi_pagination import Page
from sqlalchemy.future import select
from sqlalchemy import asc, func
from fastapi_pagination.ext.async_sqlalchemy import paginate

from app.api.v1.filter.item import ItemsFilter, ItemsCustomFilter
from app.api.v1.filter.staus import StatusTypeFilter, ItemStatusTypeFilter
from app.api.v1.filter.topic import TopicItemsFilter
from app.api.v1.filter.item_group import ItemGroupFilter
from app.models.item import ItemGroup, Item
from app.models.item_status import ItemStatus
from app.models.item_staus_type import ItemStatusType
from app.models.topic import Topic
from app.schemas.item import ItemsStatus, ItemsGroupByTopic

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


@router.get("/grop_by_services",
            response_model=List[ItemsGroupByTopic],
            status_code=200)
async def grop_by_topic(*,
                        group_filter: ItemsCustomFilter = FilterDepends(ItemsCustomFilter),
                        db: AsyncSession = Depends(get_db),
                        ) -> List[ItemsGroupByTopic]:
    # 1) Применяем фильтры к Item
    filtered_q = select(Item)
    filtered_q = group_filter.filter(filtered_q)
    filtered_subq = filtered_q.subquery()

    # 2) Агрегируем на отфильтрованных данных
    counts_subq = (
        select(
            filtered_subq.c.topic_id.label("topic_id"),
            func.count(filtered_subq.c.id).label("count"),
        )
        .group_by(filtered_subq.c.topic_id)
        .subquery()
    )
    # 3) Соединяем с Topic и возвращаем Topic ORM-объект + count
    agg_q = (
        select(Topic, counts_subq.c.count)
        .join(counts_subq, counts_subq.c.topic_id == Topic.id)
    )

    res = await db.execute(agg_q)
    mappings = res.mappings().all()

    output: List[ItemsGroupByTopic] = []
    for row in mappings:
        topic_obj = row["Topic"]  # ORM объект Topic
        count_val = row["count"]
        # Pydantic с from_attributes=True может принять ORM модель
        output.append(ItemsGroupByTopic(topic=topic_obj, count=count_val))

    return output
