from pydantic import BaseModel, constr, ConfigDict


class ItemStatusTypeBase(BaseModel):
    name: constr(max_length=128)  # Строка длиной до 128 символов


class ItemStatusTypeInDB(ItemStatusTypeBase):
    id: int  # Поле id, добавленное для представления модели

    model_config = ConfigDict(from_attributes=True)  # Позволяет Pydantic работать с SQLAlchemy моделями
