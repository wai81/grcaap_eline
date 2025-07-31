from typing import Optional
from datetime import datetime, date
from fastapi_filter.contrib.sqlalchemy import Filter
from pydantic import Field

from app.models.item import Item


class ItemsFilter(Filter):
    order_by: Optional[list[str]] = Field(default=None)
    generated_number: Optional[str] = Field(default=None)
    created_at__gte: Optional[datetime] = Field(alias='created_at_gte', default=None)
    created_at__lte: Optional[datetime] = Field(alias='created_at_lte', default=None)
    modified_by: Optional[str] = Field(default=None)

    class Constants(Filter.Constants):
        model = Item
        search_model_fields = ["generated_number"]

    class Config:
        populate_by_name = True


class ItemsCustomFilter(Filter):
    order_by: Optional[list[str]] = Field(default=None)
    generated_number: Optional[str] = Field(default=None)
    topic_id__in: Optional[list[int]] = Field(default=None)
    created_at__gte: Optional[datetime] = Field(alias='created_at_gte', default=None)
    created_at__lte: Optional[datetime] = Field(alias='created_at_lte', default=None)
    modified_by: Optional[str] = Field(default=None)

    class Constants(Filter.Constants):
        model = Item
        search_model_fields = ["generated_number"]

    class Config:
        populate_by_name = True
