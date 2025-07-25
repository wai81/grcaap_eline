from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import services
from app.api.depend import get_db
from fastapi_pagination import Page

from app.schemas.item import ItemInDB

router = APIRouter()


@router.get("",
            status_code=200,
            response_model=Page[ItemInDB])
async def get_items(*,
                    db: AsyncSession = Depends(get_db)
                    ) -> Any:
    objects = await services.item.get_list(db=db)
    return objects


@router.get("/{id}", )
async def get_item():
    pass

