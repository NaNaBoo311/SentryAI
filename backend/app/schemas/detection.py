from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionResult(BaseModel):
    bbox: BoundingBox
    confidence: float
    label: str = "person"


class FrameDetectionResponse(BaseModel):
    detections: list[DetectionResult]
    count: int
    frame_width: int
    frame_height: int


class LogEventRequest(BaseModel):
    camera_id: str
    confidence: float
    bbox: list[dict] = []
    snapshot_url: str = ""
    status: str = "detected"


class LogEventResponse(BaseModel):
    event_id: str
    message: str = "Detection event logged"
