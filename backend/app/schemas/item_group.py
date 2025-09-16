from pydantic import BaseModel, constr, ConfigDict
from typing import Optional
from datetime import datetime


class ItemGroupBase(BaseModel):
    is_closed: bool
    created_by: constr(max_length=128)  # Строка длиной до 128 символов
    modified_by: Optional[constr(max_length=128)]  # может быть None
    created_at: datetime  # Дата и время создания
    updated_at: Optional[datetime]  # Дата и время обновления


class ItemGroupInDB(ItemGroupBase):
    id: int  # Поле id, добавленное для представления модели

    model_config = ConfigDict(from_attributes=True)  # Позволяет Pydantic работать с SQLAlchemy моделями
