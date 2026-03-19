import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook to enumerate and manage browser video input devices.
 */
export function useDeviceCameras() {
  const [devices, setDevices] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const enumerate = useCallback(async () => {
    try {
      setLoading(true)
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true })
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput')
      setDevices(videoInputs)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to enumerate cameras')
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    enumerate()
  }, [enumerate])

  return { devices, error, loading, refresh: enumerate }
}

/**
 * Hook to manage a single camera stream attached to a video element ref.
 */
export function useCameraStream(deviceId) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)

  const start = useCallback(async () => {
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setActive(true)
    } catch (err) {
      console.error('Failed to start camera stream:', err)
      setActive(false)
    }
  }, [deviceId])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActive(false)
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { videoRef, active, start, stop }
}
