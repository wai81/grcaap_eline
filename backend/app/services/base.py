import json
from typing import TypeVar, Generic, Type, Any, Optional, List, Union, Dict
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import column, or_, text, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select
from sqlalchemy.sql.operators import from_
from fastapi_pagination import Page
from fastapi_pagination.ext.async_sqlalchemy import paginate

ModelType = TypeVar("ModelType")


class RBase(Generic[ModelType]):

    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).
        **Parameters**
        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model

    async def get_by_id(
            self, db: AsyncSession,
            id: Any
    ) -> Optional[ModelType]:
        query = select(self.model).where(self.model.id == id)
        result = await db.execute(query)
        obj = result.scalars().first()
        return obj

    async def get_list(
            self, db: AsyncSession, *,
            sort: str = None,
            order: str = None,
            filters: str = None,
    ) -> Page[ModelType]:
        # query = select(from_obj=self.model, columns='*')
        query = select(self.model)

        result = await paginate(db, query=query)
        # result = await db.execute(query.offset(skip).limit(limit))
        return result
