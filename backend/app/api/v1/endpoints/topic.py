from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_filter import FilterDepends
from fastapi_pagination import Page
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from app.api.v1.filter.topic import TopicFilter
from app.schemas.topic import TopicInDB, LineTopic

router = APIRouter()


@router.get("",
            status_code=200,
            response_model=Page[TopicInDB])
async def get_topics(*,
                     filters: TopicFilter = FilterDepends(TopicFilter),
                     db: AsyncSession = Depends(get_db)
                     ) -> Any:
    result = await services.topic.get_topics_filter(db=db, filters=filters)
    return result


@router.get("/{topic_id}",
            status_code=200,
            response_model=TopicInDB)
async def get_topic(*, topic_id: int, db: AsyncSession = Depends(get_db)) -> TopicInDB:
    result = await services.topic.get_by_id(db=db, id=topic_id)
    if not result:
        raise HTTPException(
            status_code=404, detail=f"Услуга не найдена."
        )
    return result


@router.get("/line/{topic_id}",
            status_code=200, )
async def get_line_topic(*,
                         topic_id: int,
                         db: AsyncSession = Depends(get_db)
                         ) -> LineTopic:
    items_count = await services.topic.get_count_items_topic(db=db, topic_id=topic_id)

    if items_count:
        result = LineTopic(topic_id=items_count.topic_id, name=items_count.name, count_items=items_count.count_items)
    else:
        topic = await services.topic.get_by_id(db=db, id=topic_id)
        result = LineTopic(topic_id=topic_id, name=topic.name_ru, count_items=0)
    return result
