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

from app.api.v1.filter.item import ItemsFilter, ItemsGroupByTopicFilter
from app.api.v1.filter.staus import StatusTypeFilter, ItemStatusTypeFilter
from app.api.v1.filter.topic import TopicItemsFilter
from app.api.v1.filter.item_group import ItemGroupFilter
from app.models.item import ItemGroup, Item
from app.models.item_status import ItemStatus
from app.models.item_staus_type import ItemStatusType
from app.models.topic import Topic
from app.schemas.item import ItemsGroupByTopic, ItemsGroupByTopicDate, ItemsGroupByUserModified

router = APIRouter()


@router.get("/count_by_topics",
            response_model=List[ItemsGroupByTopic],
            status_code=200)
async def grop_by_topic(*,
                        group_filter: ItemsGroupByTopicFilter = FilterDepends(ItemsGroupByTopicFilter),
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
        .where(Topic.is_active.is_(True))
        .order_by("name_ru")
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


@router.get("/count_created_items_by_topic",
            response_model=List[ItemsGroupByTopicDate],
            status_code=200)
async def count_created_items_by_topic_until(*,
                                             group_filter: ItemsGroupByTopicFilter = FilterDepends(
                                                 ItemsGroupByTopicFilter),
                                             db: AsyncSession = Depends(get_db)
                                             ) -> List[ItemsGroupByTopicDate]:
    filtered_q = select(Item)
    filtered_q = group_filter.filter(filtered_q)
    filtered_subq = filtered_q.subquery()

    # 600 секунд = 10 минут
    bucket = func.to_timestamp(
        func.floor(func.extract("epoch", filtered_subq.c.created_at) / 1800) * 1800
    ).label("datetime_hour")

    counts_subq = (
        select(
            bucket,
            filtered_subq.c.topic_id.label("topic_id"),
            func.count(filtered_subq.c.id).label("count"),
        )
        .group_by(bucket, filtered_subq.c.topic_id)
        .subquery()
    )

    agg_q = (
        select(
            counts_subq.c.datetime_hour,
            Topic.id,
            Topic.name_ru,
            counts_subq.c.count)
        .join(Topic, Topic.id == counts_subq.c.topic_id)
        .where(Topic.is_active.is_(True))
        .order_by(counts_subq.c.datetime_hour.asc(), Topic.id.asc())
    )
    res = await db.execute(agg_q)
    rows = res.mappings().all()
    output: List[ItemsGroupByTopicDate] = []

    for row in rows:
        output.append(ItemsGroupByTopicDate(
            create_at=row["datetime_hour"],
            name=row["name_ru"],
            count=row["count"]
        ))

    return output


@router.get("/count_complete_item_user",
            response_model=List[ItemsGroupByUserModified],
            status_code=200)
async def count_complete_item_user_until(*,
                                         group_filter: ItemsGroupByTopicFilter = FilterDepends(
                                             ItemsGroupByTopicFilter),
                                         db: AsyncSession = Depends(get_db)
                                         ) -> List[ItemsGroupByUserModified]:
    filtered_q = select(Item)
    filtered_q = group_filter.filter(filtered_q)
    # ) Добавляем JOIN к Topic и фильтр активности
    filtered_q = (
        filtered_q
        .join(Topic, Item.topic_id == Topic.id)
        .where(
            Topic.is_active.is_(True),
            Item.modified_by.is_not(None),  # исключаем NULL
            func.trim(Item.modified_by) != ""  # исключаем пустые/пробельные строки
        )
        .with_only_columns(  # оставляем только нужные во внешнем уровне поля
            Item.id,
            Item.modified_by,
        )
    )
    filtered_subq = filtered_q.subquery()

    agg_q = (
        select(
            filtered_subq.c.modified_by.label("modified_by"),
            func.count(filtered_subq.c.id).label("count"),
        )
        .group_by(filtered_subq.c.modified_by)
        .order_by(asc(filtered_subq.c.modified_by))
    )
    res = await db.execute(agg_q)
    rows = res.mappings().all()
    output: List[ItemsGroupByUserModified] = []
    for row in rows:
        output.append(ItemsGroupByUserModified(
            modified_by=row["modified_by"],
            count=row["count"]
        ))

    return output
