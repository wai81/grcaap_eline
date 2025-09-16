from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_filter import FilterDepends
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from fastapi_pagination import Page
from app.schemas.item import ItemInDB
from app.api.v1.filter.item import ItemsCustomFilter

router = APIRouter()


@router.get("",
            status_code=200,
            response_model=Page[ItemInDB])
async def get_items(*,
                    filters: ItemsCustomFilter = FilterDepends(ItemsCustomFilter),
                    db: AsyncSession = Depends(get_db),
                    ) -> Page[ItemInDB]:
    result = await services.item.get_items_filter(db=db, item_filter=filters)
    return result


@router.get("/{id}", )
async def get_item():
    pass
