from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from fastapi_pagination import Page
from app.schemas.item_status_type import ItemStatusTypeInDB

router = APIRouter()


@router.get("",
            status_code=200,
            response_model=Page[ItemStatusTypeInDB])
async def get_items_status_type(*,
                                db: AsyncSession = Depends(get_db)
                                ) -> Any:
    objects = await services.item_status_type.get_list(db=db)
    return objects


@router.get("/{status_id}",
            status_code=200,
            response_model=ItemStatusTypeInDB)
async def get_status_type(*, status_id: int, db: AsyncSession = Depends(get_db)):
    item = await services.item_status_type.get_by_id(id=status_id, db=db)
    return item
