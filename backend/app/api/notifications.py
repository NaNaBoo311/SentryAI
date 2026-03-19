from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user
from app.services.supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class CreateNotificationRequest(BaseModel):
    title: str = "Alert"
    message: str = ""
    detection_event_id: str | None = None


class CreateNotificationResponse(BaseModel):
    success: bool
    message: str = "Notification created"


@router.post("/create", response_model=CreateNotificationResponse)
async def create_notification(
    body: CreateNotificationRequest,
    user_id: str = Depends(get_current_user),
):
    """Create a notification record in the database."""
    supabase = get_supabase_admin()

    try:
        supabase.table("notifications").insert(
            {
                "user_id": user_id,
                "title": body.title,
                "message": body.message,
                "detection_event_id": body.detection_event_id,
            }
        ).execute()

        return CreateNotificationResponse(success=True)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}",
        )
