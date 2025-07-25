from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings

SQLALCHEMY_DATABASE_URL = f"postgresql+asyncpg://" \
                          f"{settings.dbusername}:{settings.password}@{settings.host}:{settings.port}" \
                          f"/{settings.database}"

engine = create_async_engine(SQLALCHEMY_DATABASE_URL,
                             future=True,
                             echo=True,
                             )

SessionLocalAsync = sessionmaker(expire_on_commit=False, class_=AsyncSession, bind=engine)
