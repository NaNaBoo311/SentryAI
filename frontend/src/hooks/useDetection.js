import { useState, useRef, useCallback, useEffect } from 'react'
import { detectionService } from '../services/detectionService'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook that periodically captures frames from a video element,
 * sends them to the backend for inference, and returns detections.
 */
export function useDetection(videoRef, enabled = true, intervalMs = 1500) {
  const { session } = useAuth()
  const [detections, setDetections] = useState([])
  const [frameDimensions, setFrameDimensions] = useState({ width: 0, height: 0 })
  const [detecting, setDetecting] = useState(false)
  const intervalRef = useRef(null)
  const canvasRef = useRef(document.createElement('canvas'))

  const captureAndDetect = useCallback(async () => {
    if (!videoRef?.current || !session?.access_token) return
    const video = videoRef.current
    if (video.readyState < 2) return // not enough data

    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    try {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.8)
      )
      if (!blob) return

      const result = await detectionService.detectFrame(blob, session.access_token)
      setDetections(result.detections || [])
      setFrameDimensions({
        width: result.frame_width,
        height: result.frame_height,
      })
    } catch (err) {
      console.error('Detection error:', err)
    }
  }, [videoRef, session])

  useEffect(() => {
    if (enabled && videoRef?.current) {
      setDetecting(true)
      intervalRef.current = setInterval(captureAndDetect, intervalMs)
    } else {
      setDetections([])
      setDetecting(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, captureAndDetect, intervalMs, videoRef])

  return { detections, frameDimensions, detecting }
}
