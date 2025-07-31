from typing import Optional

from pydantic import BaseModel, constr
from datetime import datetime

from app.schemas.item import ItemInDB
from app.schemas.item_status_type import ItemStatusTypeInDB


class ItemStatusBase(BaseModel):
    # item_status_type_id: int  # Поле id статуса
    # item_id: int  # Поле id записи
    item_status_type: Optional[ItemStatusTypeInDB]
    item: Optional[ItemInDB]
    created_by: constr(max_length=128)  # Строка длиной до 128 символов
    created_at: datetime  # Дата и время создания


class ItemStatusInDB(ItemStatusBase):
    id: int  # Поле id, добавленное для представления модели

    class ConfigDict:
        from_attributes = True  # Позволяет Pydantic работать с SQLAlchemy моделями
