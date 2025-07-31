from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, SmallInteger
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Topic(Base):
    __tablename__ = 'topic'

    id = Column(Integer, primary_key=True, index=True)
    name_ru = Column(String(128), nullable=False)
    name_be = Column(String(128), nullable=False)
    name_en = Column(String(128), nullable=False)
    # start_work = Column(String(128), nullable=False)
    # end_work = Column(String(128), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    item_name_prefix = Column(String(3), nullable=False)
    created_by = Column(String(128), nullable=False)
    created_at = Column(DateTime(timezone=True),
                        nullable=False,
                        comment='Создан',
                        index=True
                        )  # *обязателен для заполнения
    modified_by = Column(String(128), nullable=True)
    updated_at = Column(DateTime(timezone=True),
                        nullable=True,
                        comment='Изменен',
                        index=True
                        )  # *обязателен для заполнения
    items = relationship('Item',
                         back_populates='topic', uselist=True)
