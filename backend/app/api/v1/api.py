from fastapi import APIRouter

from app.api.v1.endpoints import item, topic, item_status_type, item_status, staus, analytic_items
from app.config import settings

api_router = APIRouter()
api_router = APIRouter(prefix=f'/{settings.API_URL}')

api_router.include_router(item.router, prefix='/item',
                          tags=["Items (Записи)"])

api_router.include_router(item_status.router, prefix='/item_status',
                          tags=["Items status(Статусы записей)"])

api_router.include_router(topic.router, prefix='/topic',
                          tags=["Topics (Услуги)"])

api_router.include_router(item_status_type.router, prefix='/item_status_type',
                          tags=["Items status type (Типы статусов записей)"])

api_router.include_router(staus.router, prefix='/status',
                          tags=["Status items"])

api_router.include_router(analytic_items.router, prefix='/analytic',
                          tags=["Analytic items"])
