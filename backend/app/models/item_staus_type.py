from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, SmallInteger
from app.db.base_class import Base
from sqlalchemy.orm import relationship


class ItemStatusType(Base):
    __tablename__ = 'item_status_type'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    status = relationship('ItemStatus',
                               back_populates='item_status_type', uselist=True)
