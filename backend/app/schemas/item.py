from pydantic import BaseModel, constr
from typing import Optional
from datetime import datetime


from app.schemas.topic import TopicInDB


class ItemGroupBase(BaseModel):
    is_closed: bool
    # created_by: constr(max_length=128)  # Строка длиной до 128 символов
    # modified_by: Optional[constr(max_length=128)]  # может быть None
    created_at: datetime  # Дата и время создания
    # updated_at: Optional[datetime]  # Дата и время обновления


class ItemGroupInDB(ItemGroupBase):
    id: int  # Поле id, добавленное для представления модели

    class ConfigDict:
        from_attributes = True  # Позволяет Pydantic работать с SQLAlchemy моделями


class ItemBase(BaseModel):
    generated_number: constr(max_length=128)  # Строка длиной до 128 символов
    # skip_numbers: int
    # parent_id: Optional[int]  # может быть None
    group: ItemGroupInDB
    topic: TopicInDB
    # service_unit_id: Optional[int]  # может быть None
    # order_unit_id: Optional[int]  # может быть None
    created_by: constr(max_length=128)  # Строка длиной до 128 символов
    modified_by: Optional[constr(max_length=128)]  # может быть None
    created_at: datetime  # Дата и время создания
    updated_at: Optional[datetime]  # Дата и время обновления


class ItemInDB(ItemBase):
    id: int  # Поле id, добавленное для представления модели

    class ConfigDict:
        from_attributes = True  # Позволяет Pydantic работать с SQLAlchemy моделями
