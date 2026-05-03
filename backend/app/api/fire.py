from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import httpx
from app.core.security import get_current_user
from app.services.supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/fire", tags=["fire-detection"])


class TemperatureReading(BaseModel):
    temperature: float
    unit: str = "celsius"


class FireAlertResponse(BaseModel):
    alert_triggered: bool
    temperature: float
    threshold: float
    message: str


class FireSettingsUpdate(BaseModel):
    fire_detection_enabled: bool | None = None
    temperature_threshold: float | None = None
    device_ip: str | None = None


@router.get("/temperature")
async def get_temperature(user_id: str = Depends(get_current_user)):
    """Fetch current temperature từ cảm biến trên mạch."""
    supabase = get_supabase_admin()
    
    try:
        # Get fire settings (bao gồm device IP)
        settings_result = supabase.rpc("get_my_fire_settings").execute()
        settings = settings_result.data[0] if settings_result.data else None
        
        if not settings or not settings.get("device_ip"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device IP not configured in fire settings"
            )
        
        device_ip = settings["device_ip"]
        
        # Call IoT device API để lấy temperature
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(
                    f"http://{device_ip}/api/sensor/temperature",
                    headers={"Content-Type": "application/json"}
                )
                data = response.json()
                return {
                    "temperature": data.get("temperature", 0),
                    "unit": data.get("unit", "celsius"),
                    "timestamp": data.get("timestamp"),
                    "device_ip": device_ip
                }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Cannot reach IoT device: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch temperature: {str(e)}"
        )


@router.post("/check-alert")
async def check_fire_alert(user_id: str = Depends(get_current_user)):
    """Check nếu có fire alert dựa trên cảm biến hiện tại."""
    supabase = get_supabase_admin()
    
    try:
        # Get fire settings
        settings_result = supabase.rpc("get_my_fire_settings").execute()
        settings = settings_result.data[0] if settings_result.data else None
        
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fire settings not found"
            )
        
        fire_detection_enabled = settings.get("fire_detection_enabled", True)
        temperature_threshold = settings.get("temperature_threshold", 50.0)
        device_ip = settings.get("device_ip", "")
        
        if not fire_detection_enabled or not device_ip:
            return FireAlertResponse(
                alert_triggered=False,
                temperature=0,
                threshold=temperature_threshold,
                message="Fire detection disabled or device not configured"
            )
        
        # Fetch current temperature
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(
                    f"http://{device_ip}/api/sensor/temperature"
                )
                temp_data = response.json()
                current_temp = temp_data.get("temperature", 0)
        except Exception as e:
            return FireAlertResponse(
                alert_triggered=False,
                temperature=0,
                threshold=temperature_threshold,
                message=f"Cannot reach device: {str(e)}"
            )
        
        # Check if alert should be triggered
        alert_triggered = current_temp > temperature_threshold
        
        if alert_triggered:
            # Log the fire alert to database
            supabase.rpc(
                "log_fire_alert",
                {
                    "p_temperature": current_temp,
                    "p_status": "triggered"
                }
            ).execute()
        
        return FireAlertResponse(
            alert_triggered=alert_triggered,
            temperature=current_temp,
            threshold=temperature_threshold,
            message=f"Temperature: {current_temp}°C - {'🔥 ALERT!' if alert_triggered else 'Safe'}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fire check failed: {str(e)}"
        )


@router.post("/settings")
async def update_fire_settings(
    body: FireSettingsUpdate,
    user_id: str = Depends(get_current_user)
):
    """Update fire detection settings cho user."""
    supabase = get_supabase_admin()
    
    try:
        params = {}
        if body.fire_detection_enabled is not None:
            params["p_fire_detection_enabled"] = body.fire_detection_enabled
        if body.temperature_threshold is not None:
            params["p_temperature_threshold"] = body.temperature_threshold
        if body.device_ip is not None:
            params["p_device_ip"] = body.device_ip
        
        supabase.rpc("update_fire_settings", params).execute()
        
        return {"success": True, "message": "Fire settings updated"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.get("/alerts-history")
async def get_fire_alerts_history(
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(get_current_user)
):
    """Fetch lịch sử các lần cảnh báo cháy."""
    supabase = get_supabase_admin()
    
    try:
        result = supabase.rpc(
            "get_fire_alerts",
            {"p_limit": limit, "p_offset": offset}
        ).execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch alerts: {str(e)}"
        )