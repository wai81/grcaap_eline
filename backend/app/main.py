from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
from app.api.v1.api import api_router
from app.config import settings


def include_router(app):
    app.include_router(api_router)


def start_application():
    app = FastAPI(
        title=settings.PROJECT_TITLE,
        version=settings.PROJECT_VERSION,
        openapi_url=f"/{settings.API_URL}/openapi.json",
        docs_url=f"/{settings.API_URL}/docs")
    include_router(app)
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # [str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    return app


app = start_application()
add_pagination(app)  # added fastapi_pagination


@app.on_event("startup")
async def startup_event():
    print('startup Eline Service')


@app.on_event("shutdown")
async def stop_event():
    print('stop Eline Service')

# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run("app.main:app", host="127.0.0.1", port=8002, reload=True)
