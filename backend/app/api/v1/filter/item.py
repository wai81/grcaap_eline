from typing import Optional
from datetime import datetime, date
from fastapi_filter.contrib.sqlalchemy import Filter
from pydantic import Field

from app.models.item import Item
from app.models.item_status import ItemStatus


class ItemsFilter(Filter):
    generated_number: Optional[str] = Field(default=None)
    created_at__gte: Optional[datetime] = Field(alias='created_at_gte', default=None)
    created_at__lte: Optional[datetime] = Field(alias='created_at_lte', default=None)
    modified_by: Optional[str] = Field(default=None)

    class Constants(Filter.Constants):
        model = Item
        search_model_fields = ["generated_number"]

    class Config:
        populate_by_name = True



