from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi_filter import FilterDepends
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from fastapi_pagination import Page

from app.schemas.item import ItemInDB
from app.api.v1.filter.item import ItemsFilter
from app.api.v1.filter.topic import TopicItemsFilter
from app.api.v1.filter.item_group import ItemGroupFilter

from app.api.v1.filter.item import ItemsCustomFilter

router = APIRouter()


@router.get("",
            status_code=200,
            response_model=Page[ItemInDB])
async def get_items(*,
                    item_filter: ItemsCustomFilter = FilterDepends(ItemsCustomFilter),
                    db: AsyncSession = Depends(get_db),
                    # item_filter: ItemsFilter = Depends(ItemsFilter),
                    # topic_filter: TopicItemsFilter = Depends(TopicItemsFilter),
                    # group_filter: ItemGroupFilter = Depends(ItemGroupFilter),
                    ) -> Page[ItemInDB]:
    objects = await services.item.get_items_filter(db=db, item_filter=item_filter)
    return objects


@router.get("/{id}", )
async def get_item():
    pass

