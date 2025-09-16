from decimal import Decimal

from pydantic import BaseModel, constr, ConfigDict
from typing import Optional
from datetime import datetime

from app.models.item_staus_type import ItemStatusType
from app.schemas.topic import TopicInDB


class ItemGroupBase(BaseModel):
    is_closed: bool
    created_at: datetime  # Дата и время создания


class ItemGroupInDB(ItemGroupBase):
    id: int  # Поле id, добавленное для представления модели

    model_config = ConfigDict(from_attributes=True)  # Позволяет Pydantic работать с SQLAlchemy моделями


class ItemBase(BaseModel):
    generated_number: constr(max_length=128)  # Строка длиной до 128 символов
    group: ItemGroupInDB
    topic: TopicInDB
    created_by: constr(max_length=128)  # Строка длиной до 128 символов
    modified_by: Optional[constr(max_length=128)]  # может быть None
    created_at: datetime  # Дата и время создания
    updated_at: Optional[datetime]  # Дата и время обновления


class ItemInDB(ItemBase):
    id: int  # Поле id, добавленное для представления модели

    model_config = ConfigDict(from_attributes=True)  # Позволяет Pydantic работать с SQLAlchemy моделями


class ItemsStatus(BaseModel):
    id: int
    generated_number: constr(max_length=128)
    item_created_at: datetime
    topic_id: int
    status_updated_at: datetime
    item_status_id: int
    modified_by: Optional[constr(max_length=128)]
    is_closed: bool

    model_config = ConfigDict(from_attributes=True)


class ItemsGroupByTopic(BaseModel):
    topic: TopicInDB
    count: int

    model_config = ConfigDict(from_attributes=True)


class ItemsGroupByTopicDate(BaseModel):
    # name: str
    create_at: datetime
    count: int

    model_config = ConfigDict(from_attributes=True)


class ItemsGroupByUserModified(BaseModel):
    modified_by: Optional[str]
    count: int

    model_config = ConfigDict(from_attributes=True)


class AvgItemsWaitServiceByTopics(BaseModel):
    topic: TopicInDB
    avg_wait_seconds: Decimal
    avg_wait_interval: str
    avg_service_seconds: Decimal
    avg_service_interval: str
    count: int

    model_config = ConfigDict(from_attributes=True)
