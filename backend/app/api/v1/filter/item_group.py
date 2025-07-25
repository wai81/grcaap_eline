from typing import Optional

from fastapi_filter.contrib.sqlalchemy import Filter
from pydantic import Field

from app.models.item import ItemGroup


class ItemGroupFilter(Filter):
    is_closed: bool = False

    class Constants(Filter.Constants):
        model = ItemGroup
