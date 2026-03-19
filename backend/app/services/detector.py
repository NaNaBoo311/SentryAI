import io
import numpy as np
import cv2
from ultralytics import YOLO


class DetectorService:
    """Loads YOLOv8n and runs person-only inference on image frames."""

    def __init__(self, confidence_threshold: float = 0.5):
        self.model = YOLO("yolov8n.pt")
        self.confidence_threshold = confidence_threshold
        # COCO class 0 = person
        self.person_class_id = 0

    def detect_persons(self, image_bytes: bytes) -> dict:
        """Run YOLOv8n inference on raw image bytes.

        Returns dict with detections list, count, and frame dimensions.
        """
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"detections": [], "count": 0, "frame_width": 0, "frame_height": 0}

        h, w = frame.shape[:2]

        # Run inference
        results = self.model(
            frame,
            conf=self.confidence_threshold,
            classes=[self.person_class_id],
            verbose=False,
        )

        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for box in boxes:
                xyxy = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                detections.append(
                    {
                        "bbox": {
                            "x1": xyxy[0],
                            "y1": xyxy[1],
                            "x2": xyxy[2],
                            "y2": xyxy[3],
                        },
                        "confidence": round(conf, 4),
                        "label": "person",
                    }
                )

        return {
            "detections": detections,
            "count": len(detections),
            "frame_width": w,
            "frame_height": h,
        }


# Singleton instance created at startup
_detector: DetectorService | None = None


def get_detector() -> DetectorService:
    global _detector
    if _detector is None:
        raise RuntimeError("Detector not initialized. Call init_detector() first.")
    return _detector


def init_detector(confidence_threshold: float = 0.5) -> DetectorService:
    global _detector
    _detector = DetectorService(confidence_threshold=confidence_threshold)
    return _detector
