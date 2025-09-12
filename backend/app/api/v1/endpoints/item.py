from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_filter import FilterDepends
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from fastapi_pagination import Page
from sqlalchemy.future import select

from app.models.item import Item
from app.schemas.item import ItemInDB, ItemsGroupByTopic

from app.api.v1.filter.item import ItemsCustomFilter

router = APIRouter()


@router.get("",
            status_code=200,
            response_model=Page[ItemInDB])
async def get_items(*,
                    item_filter: ItemsCustomFilter = FilterDepends(ItemsCustomFilter),
                    db: AsyncSession = Depends(get_db),
                    ) -> Page[ItemInDB]:
    objects = await services.item.get_items_filter(db=db, item_filter=item_filter)
    return objects


@router.get("/{id}", )
async def get_item():
    pass

#
# @router.get("/grop_by_services",
#             response_model=List[ItemsGroupByTopic],
#             status_code=200)
# async def grop_by_topic(*,
#                         group_filter: ItemsCustomFilter = FilterDepends(ItemsCustomFilter),
#                         db: AsyncSession = Depends(get_db),
#                         ) -> List[ItemsGroupByTopic]:
#     # query = select(Item)
#     item_model = Item
#     query = (
#         select(
#             item_model.topic_id.label("topic_id"),
#             func.count(item_model.id).label("topic_count")
#         )
#         .where(True)  # чтобы можно было безопасно добавить фильтры ниже
#         .group_by(item_model.topic_id)
#     )
#     query = group_filter.filter(query)
#
#     # if group_filter.order_by:
#     #     for order in group_filter.order_by:
#     #         field_name = order.lstrip("+-")
#     #         column = getattr(Item, field_name)
#     #         if order.startswith("-"):
#     #             query = query.order_by(column.desc())
#     #         else:
#     #             query = query.order_by(column.asc())
#
#     # result = await paginate(db, query=query)
#     query_result = await db.execute(query)
#     rows = query_result.mappings().all()
#     return [ItemsGroupByTopic(**row) for row in rows]
