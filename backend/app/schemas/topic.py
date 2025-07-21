from pydantic import BaseModel, constr
from typing import Optional
from datetime import datetime


class TopicBase(BaseModel):
    name_ru: constr(max_length=128)
    # name_be: constr(max_length=128)
    # name_en: constr(max_length=128)
    # start_work: datetime
    # end_work: datetime
    is_active: bool
    # is_deleted: bool
    # item_name_prefix: constr(max_length=3)  # Строка длиной до 128 символов
    # created_by: constr(max_length=128)  # Строка длиной до 128 символов
    # created_at: Optional[datetime]  # Дата и время обновления
    # modified_by: constr(max_length=128)  # Строка длиной до 128 символов
    # updated_at: Optional[datetime]  # Дата и время обновления


class TopicInDB(TopicBase):
    id: int  # Поле id, добавленное для представления модели

    class ConfigDict:
        from_attributes = True  # Позволяет Pydantic работать с SQLAlchemy моделями


class LineTopic(BaseModel):
    topic_id: int
    name: constr(max_length=128)
    count_items: int
