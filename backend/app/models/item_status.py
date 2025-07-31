from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, SmallInteger
from app.db.base_class import Base
from sqlalchemy.orm import relationship


class ItemStatus(Base):
    __tablename__ = 'item_status'

    id = Column(Integer, primary_key=True, index=True)
    item_status_type_id = Column(Integer, ForeignKey('item_status_type.id'))
    item_id = Column(Integer, ForeignKey('item.id'))
    created_by = Column(String(128), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, comment='Создан',
                        index=True)  # *обязателен для заполнения
    item = relationship('Item',
                        back_populates='item_status', lazy='immediate')
    item_status_type = relationship('ItemStatusType',
                                    back_populates='status', lazy='immediate')
