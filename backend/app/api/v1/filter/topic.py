from typing import Optional

from fastapi_filter.contrib.sqlalchemy import Filter
from pydantic import Field

from app.models.topic import Topic


class TopicFilter(Filter):
    name_ru__ilike: Optional[str] = Field(alias='name_ru__like', default=None, )
    is_active: Optional[bool] = Field(default=True)

    # is_deleted: Optional[bool] = Field(default=False)

    class Constants(Filter.Constants):
        model = Topic
        search_model_fields = ["name_ru"]

    @classmethod
    def custom_filter(cls, query, filters):
        if filters.name_ru__ilike:
            # фильтрация по полю adress_object без учета регистра ilike
            query = query.where(Topic.name_ru.ilike(f'%{filters.name_ru__ilike}%'))
        if filters.is_active:
            query = query.where(Topic.is_active == filters.is_active)
        return query

    class Config:
        populate_by_name = True


class TopicItemsFilter(Filter):
    id: Optional[int] = Field(alias='topic_id', default=None, )
    is_active: bool = True

    class Constants(Filter.Constants):
        model = Topic

    class Config:
        populate_by_name = True
