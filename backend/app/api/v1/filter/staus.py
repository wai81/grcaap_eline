from typing import Optional, List
from datetime import datetime, date
from fastapi_filter.contrib.sqlalchemy import Filter
from pydantic import Field

from app.models.item_status import ItemStatus
from app.models.item_staus_type import ItemStatusType


class StatusTypeFilter(Filter):
    id: Optional[int] = Field(alias='item_status_id', default=None, )

    class Constants(Filter.Constants):
        model = ItemStatusType


class ItemStatusTypeFilter(Filter):
    item_status_id__in: Optional[list[int]] = Field(default=None)

    class Constants(Filter.Constants):
        model = ItemStatus

