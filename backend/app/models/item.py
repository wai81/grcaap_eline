from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, SmallInteger
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ItemGroup(Base):
    __tablename__ = 'item_group'

    id = Column(Integer, primary_key=True, index=True)
    is_closed = Column(Boolean, default=False)
    created_by = Column(String(128), nullable=False)
    created_at = Column(DateTime(timezone=True),
                        nullable=False, comment='Создан',
                        index=True)  # *обязателен для заполнения
    modified_by = Column(String(128), nullable=True)
    updated_at = Column(DateTime(timezone=True),
                        nullable=True, comment='Изменен',
                        index=True)  # *обязателен для заполнения
    items = relationship('Item', back_populates='group')


class Item(Base):
    __tablename__ = 'item'

    id = Column(Integer, primary_key=True, index=True)
    number = Column(SmallInteger, nullable=False)
    generated_number = Column(String(128), nullable=False)
    skip_numbers = Column(SmallInteger, nullable=False)
    parent_id = Column(Integer)
    item_group_id = Column(Integer, ForeignKey('item_group.id'))
    topic_id = Column(Integer, ForeignKey('topic.id'))
    service_unit_id = Column(Integer)
    order_unit_id = Column(Integer)
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
    item_status = relationship('ItemStatus',
                               back_populates='item', lazy='immediate')

    topic = relationship('Topic',
                         back_populates='items', lazy='immediate')

    group = relationship('ItemGroup',
                         back_populates='items', lazy='immediate')
