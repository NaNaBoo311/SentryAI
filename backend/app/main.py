from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.services.detector import init_detector
from app.api.health import router as health_router
from app.api.detection import router as detection_router
from app.api.notifications import router as notifications_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: preload YOLOv8n model."""
    settings = get_settings()
    init_detector(confidence_threshold=settings.yolo_confidence_threshold)
    yield


app = FastAPI(
    title="SentryAI Backend",
    description="Smart home security API with YOLOv8 human detection",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router)
app.include_router(detection_router)
app.include_router(notifications_router)
