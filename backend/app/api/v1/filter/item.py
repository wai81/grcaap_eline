from typing import Optional
from datetime import datetime, date
from fastapi_filter.contrib.sqlalchemy import Filter
from pydantic import Field

from app.models.item_status import ItemStatus


class ItemStatusFilter(Filter):
    generated_number: Optional[str] = Field(default=None)
    created_at__gte: Optional[datetime] = Field(alias='created_at_gte', default=None)
    created_at__lte: Optional[datetime] = Field(alias='created_at_lte', default=None)
    item_status_type_id: Optional[int] = Field(default=None)
    is_closed: Optional[bool] = Field(default=None)

    class Constants(Filter.Constants):
        model = ItemStatus
        search_model_fields = ["generated_number"]

    @classmethod
    def custom_filter(cls, query, filters, subquery):
        """
                Применяет кастомные фильтры к запросу.
                """
        # Фильтр по ID организации (если указан)
        # if filters.organization_id__in:  # Проверяем наличие фильтра
        #     query = query.where(subquery.c.organization_id.in_(filters.organization_id__in))

            # Фильтр по номеру заказа (если указан)
        # if filters.order_number:
        #     query = query.where(subquery.c.order_number == filters.order_number)

            # Фильтр по датам создания заказа
        if filters.created_at__gte:
            query = query.where(subquery.c.created_at >= filters.created_at__gte)

        if filters.created_at__lte:
            query = query.where(subquery.c.created_at <= filters.created_at__lte)

        # if filters.adress_object__like:
        #     # фильтрация по полю adress_object без учета регистра ilike
        #     query = query.where(subquery.c.adress_object.ilike(f'%{filters.adress_object__like}%'))

        # if filters.departure__in:
        #     query = query.where(subquery.c.departure.in_(filters.departure__in))

        return query
