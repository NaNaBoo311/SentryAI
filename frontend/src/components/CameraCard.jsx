import { useEffect, useRef, useState, useCallback } from 'react'
import { Video, VideoOff, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useDetection } from '../hooks/useDetection'
import { useCameraStream } from '../hooks/useDeviceCameras'
import DetectionBadge from './DetectionBadge'
import { detectionService } from '../services/detectionService'

export default function CameraCard({
  device,
  cameraRecord,
  detectionEnabled = true,
}) {
  const { videoRef, active, start, stop } = useCameraStream(device?.deviceId)
  const { detections, frameDimensions } = useDetection(
    videoRef,
    active && detectionEnabled,
    2000
  )
  const containerRef = useRef(null)
  const [logged, setLogged] = useState(false)
  const logTimeoutRef = useRef(null)

  // Auto-start camera
  useEffect(() => {
    if (device) start()
    return () => stop()
  }, [device])

  // Log detection events (debounced — log max once every 10s per camera)
  useEffect(() => {
    if (detections.length > 0 && cameraRecord?.id && !logged) {
      const topDetection = detections.reduce(
        (best, d) => (d.confidence > best.confidence ? d : best),
        detections[0]
      )
      detectionService
        .logDetectionEvent(
          cameraRecord.id,
          topDetection.confidence,
          detections.map((d) => d.bbox),
          '',
          'detected'
        )
        .catch(console.error)

      setLogged(true)
      logTimeoutRef.current = setTimeout(() => setLogged(false), 10000)
    }

    return () => {
      if (logTimeoutRef.current) clearTimeout(logTimeoutRef.current)
    }
  }, [detections, cameraRecord, logged])

  const label = device?.label || cameraRecord?.name || 'Camera'

  return (
    <div className="glass-card overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sentry-700/30">
        <div className="flex items-center gap-2">
          {active ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-sentry-500" />
          )}
          <span className="text-sm font-medium text-sentry-200 truncate max-w-[180px]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DetectionBadge count={detections.length} />
          {active ? (
            <span className="status-active text-[10px]">LIVE</span>
          ) : (
            <span className="status-inactive text-[10px]">OFF</span>
          )}
        </div>
      </div>

      {/* Video feed */}
      <div ref={containerRef} className="relative aspect-video bg-sentry-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Bounding box overlays */}
        {detections.map((det, i) => {
          if (!frameDimensions.width || !containerRef.current) return null
          const rect = containerRef.current.getBoundingClientRect()
          const scaleX = rect.width / frameDimensions.width
          const scaleY = rect.height / frameDimensions.height
          const { x1, y1, x2, y2 } = det.bbox

          return (
            <div
              key={i}
              className="absolute border-2 border-red-500 rounded-sm pointer-events-none"
              style={{
                left: x1 * scaleX,
                top: y1 * scaleY,
                width: (x2 - x1) * scaleX,
                height: (y2 - y1) * scaleY,
              }}
            >
              <span className="absolute -top-5 left-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                Person {Math.round(det.confidence * 100)}%
              </span>
            </div>
          )
        })}

        {/* Offline overlay */}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-sentry-950/80">
            <VideoOff className="w-10 h-10 text-sentry-600" />
          </div>
        )}
      </div>
    </div>
  )
}
