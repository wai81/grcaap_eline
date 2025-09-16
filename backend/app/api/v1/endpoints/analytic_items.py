from decimal import Decimal
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

from app.api.v1.filter.item import ItemsFilter, ItemsByTopicFilter
from app.api.v1.filter.staus import StatusTypeFilter, ItemStatusTypeFilter
from app.api.v1.filter.topic import TopicItemsFilter
from app.api.v1.filter.item_group import ItemGroupFilter
from app.models.item import ItemGroup, Item
from app.models.item_status import ItemStatus
from app.models.item_staus_type import ItemStatusType
from app.models.topic import Topic
from app.schemas.item import ItemsGroupByTopicDate, ItemsGroupByUserModified, \
    AvgItemsWaitServiceByTopics

router = APIRouter()


@router.get("/count_created_items_by_topic",
            response_model=List[ItemsGroupByTopicDate],
            status_code=200)
async def count_created_items_by_topic_until(*,
                                             filters: ItemsByTopicFilter = FilterDepends(
                                                 ItemsByTopicFilter),
                                             db: AsyncSession = Depends(get_db)
                                             ) -> List[ItemsGroupByTopicDate]:
    filtered_q = select(Item)
    filtered_q = filters.filter(filtered_q)
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
            Item.created_at,
        )
    )
    filtered_subq = filtered_q.subquery()

    # 600 секунд = 10 минут
    bucket = func.to_timestamp(
        func.floor(func.extract("epoch", filtered_subq.c.created_at) / 1800) * 1800
    ).label("datetime_hour")

    counts_subq = (
        select(
            bucket,
            # filtered_subq.c.topic_id.label("topic_id"),
            func.count(filtered_subq.c.id).label("count"),
        )
        .group_by(bucket,
                  # filtered_subq.c.topic_id
                  )
        .subquery()
    )

    agg_q = (
        select(
            counts_subq.c.datetime_hour,
            # Topic.id,
            # Topic.name_ru,
            counts_subq.c.count)
        # .join(Topic, Topic.id == counts_subq.c.topic_id)
        # .where(Topic.is_active.is_(True))
        .order_by(counts_subq.c.datetime_hour.asc(),
                  # Topic.id.asc()
                  )
    )
    res = await db.execute(agg_q)
    rows = res.mappings().all()
    result: List[ItemsGroupByTopicDate] = []

    for row in rows:
        result.append(ItemsGroupByTopicDate(
            create_at=row["datetime_hour"],
            # name=row["name_ru"],
            count=row["count"]
        ))

    return result


@router.get("/count_complete_item_user",
            response_model=List[ItemsGroupByUserModified],
            status_code=200)
async def count_complete_item_user_until(*,
                                         filters: ItemsByTopicFilter = FilterDepends(
                                             ItemsByTopicFilter),
                                         db: AsyncSession = Depends(get_db)
                                         ) -> List[ItemsGroupByUserModified]:
    filtered_q = select(Item)
    filtered_q = filters.filter(filtered_q)
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
    result: List[ItemsGroupByUserModified] = []
    for row in rows:
        result.append(ItemsGroupByUserModified(
            modified_by=row["modified_by"],
            count=row["count"]
        ))

    return result


@router.get("/avg_times_by_topic",
            response_model=List[AvgItemsWaitServiceByTopics],
            status_code=200)
async def avg_times_by_topic(*,
                             filters: ItemsByTopicFilter = FilterDepends(
                                 ItemsByTopicFilter),
                             db: AsyncSession = Depends(get_db)
                             ) -> List[AvgItemsWaitServiceByTopics]:
    S = ItemStatus
    I = Item
    T = Topic

    # Базовый запрос по Item, на который НАВЕШИВАЕМ fastapi_filter
    base_items_q = select(I)
    base_items_q = filters.filter(base_items_q)  # применяем topic_id__in, created_at_gte/lte, поиск по generated_number

    # Подзапрос (чтобы потом JOIN’ить CTE только к уже отфильтрованным item’ам)
    base_items_sq = base_items_q.subquery("base_items")

    # CTE: времена статусов
    waiting_cte = (
        select(
            S.item_id.label("item_id"),
            func.min(S.created_at).label("wait_start_at"),
        )
        .where(S.item_status_type_id == 2)
        .group_by(S.item_id)
        .cte("waiting")
    )

    processing_cte = (
        select(
            S.item_id.label("item_id"),
            func.min(S.created_at).label("process_start_at"),
        )
        .where(S.item_status_type_id == 6)
        .group_by(S.item_id)
        .cte("processing")
    )

    done_cte = (
        select(
            S.item_id.label("item_id"),
            func.min(S.created_at).label("done_at"),
        )
        .where(S.item_status_type_id == 7)
        .group_by(S.item_id)
        .cte("done")
    )

    bad_cte = (
        select(S.item_id)
        .where(S.item_status_type_id.in_([8, 9, 10]))
        .distinct()
        .cte("bad")
    )

    # Сборка "базы": только отфильтрованные item’ы + присоединяем вычисленные времена + отсекаем bad
    base = (
        select(
            base_items_sq.c.id.label("item_id"),
            base_items_sq.c.topic_id.label("topic_id"),
            base_items_sq.c.created_at.label("item_created_at"),
            waiting_cte.c.wait_start_at.label("wait_start_at"),
            processing_cte.c.process_start_at.label("process_start_at"),
            done_cte.c.done_at.label("done_at"),
        )
        .join(waiting_cte, waiting_cte.c.item_id == base_items_sq.c.id, isouter=True)
        .join(processing_cte, processing_cte.c.item_id == base_items_sq.c.id, isouter=True)
        .join(done_cte, done_cte.c.item_id == base_items_sq.c.id, isouter=True)
        .join(bad_cte, bad_cte.c.item_id == base_items_sq.c.id, isouter=True)
        .where(bad_cte.c.item_id.is_(None))  # исключаем 8/9/10
    ).subquery("base")

    # Агрегация по topic_id (строго соблюдая порядок времени)
    agg = (
        select(
            base.c.topic_id.label("topic_id"),
            func.avg(func.extract("epoch", base.c.process_start_at - base.c.wait_start_at)).label("avg_wait_seconds"),
            func.avg(base.c.process_start_at - base.c.wait_start_at).label("avg_wait_interval"),
            func.avg(func.extract("epoch", base.c.done_at - base.c.process_start_at)).label("avg_service_seconds"),
            func.avg(base.c.done_at - base.c.process_start_at).label("avg_service_interval"),
            func.count().label("served_count"),
        )
        .where(
            base.c.wait_start_at.isnot(None),
            base.c.process_start_at.isnot(None),
            base.c.done_at.isnot(None),
            base.c.process_start_at >= base.c.wait_start_at,
            base.c.done_at >= base.c.process_start_at,
        )
        .group_by(base.c.topic_id)
        .subquery("agg")
    )

    # 5) Присоединяем Topic, чтобы вернуть поле `topic: TopicInDB`
    stmt = (
        select(
            T,  # ORM-модель темы — FastAPI/Pydantic сможет смэппить в TopicInDB (from_attributes=True)
            agg.c.avg_wait_seconds,
            agg.c.avg_wait_interval,
            agg.c.avg_service_seconds,
            agg.c.avg_service_interval,
            agg.c.served_count,
        )
        .join(agg, agg.c.topic_id == T.id)
        .order_by(T.name_ru)
    )
    res = await db.execute(stmt)
    rows = res.all()

    # Подгоняем под схему: avg_*_seconds как Decimal, interval как строка
    result: List[AvgItemsWaitServiceByTopics] = []
    for (topic_obj,
         avg_wait_seconds,
         avg_wait_interval,
         avg_service_seconds,
         avg_service_interval,
         served_count) in rows:
        result.append(AvgItemsWaitServiceByTopics(
            topic=topic_obj,  # Pydantic: from_attributes=True позволит сериализовать ORM-модель
            avg_wait_seconds=Decimal(str(avg_wait_seconds)) if avg_wait_seconds is not None else Decimal("0"),
            avg_wait_interval=str(avg_wait_interval) if avg_wait_interval is not None else "0",
            avg_service_seconds=Decimal(str(avg_service_seconds)) if avg_service_seconds is not None else Decimal("0"),
            avg_service_interval=str(avg_service_interval) if avg_service_interval is not None else "0",
            count=int(served_count or 0),
        ))

    return result
