from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status

from app.core.security import get_current_user
from app.services.detector import get_detector
from app.services.supabase_client import get_supabase_admin
from app.schemas.detection import (
    FrameDetectionResponse,
    LogEventRequest,
    LogEventResponse,
)

router = APIRouter(prefix="/api/detect", tags=["detection"])


@router.post("/frame", response_model=FrameDetectionResponse)
async def detect_frame(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Accept an image frame and run YOLOv8n person detection."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )

    image_bytes = await file.read()
    detector = get_detector()
    result = detector.detect_persons(image_bytes)

    return FrameDetectionResponse(
        detections=result["detections"],
        count=result["count"],
        frame_width=result["frame_width"],
        frame_height=result["frame_height"],
    )


@router.post("/log-event", response_model=LogEventResponse)
async def log_detection_event(
    body: LogEventRequest,
    user_id: str = Depends(get_current_user),
):
    """Log a detection event to the database via Supabase RPC."""
    supabase = get_supabase_admin()

    try:
        result = supabase.rpc(
            "log_detection_event",
            {
                "p_camera_id": body.camera_id,
                "p_confidence": body.confidence,
                "p_bbox": body.bbox,
                "p_snapshot_url": body.snapshot_url,
                "p_status": body.status,
            },
        ).execute()

        event_id = result.data if result.data else ""
        return LogEventResponse(event_id=str(event_id))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log event: {str(e)}",
        )


@router.get("/status")
async def get_detection_status(
    user_id: str = Depends(get_current_user),
):
    """Fetch the user's detection enabled/disabled state."""
    supabase = get_supabase_admin()

    try:
        result = supabase.rpc("get_my_detection_settings").execute()
        settings = result.data[0] if result.data else None

        if settings is None:
            return {"detection_enabled": True, "confidence_threshold": 0.5}

        return {
            "detection_enabled": settings.get("detection_enabled", True),
            "confidence_threshold": settings.get("confidence_threshold", 0.5),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch settings: {str(e)}",
        )
