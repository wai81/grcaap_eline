from pydantic import BaseModel, constr, ConfigDict
from typing import Optional
from datetime import datetime


class TopicBase(BaseModel):
    name_ru: constr(max_length=128)
    is_active: bool


class TopicInDB(TopicBase):
    id: int  # Поле id, добавленное для представления модели
    model_config = ConfigDict(from_attributes=True)


class LineTopic(BaseModel):
    topic_id: int
    name: constr(max_length=128)
    count_items: int
