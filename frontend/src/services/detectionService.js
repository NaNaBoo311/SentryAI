import { supabase } from '../utils/supabaseClient'


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export const detectionService = {
  /**
   * Send a frame to the backend for YOLOv8n inference.
   * Returns detections with bounding boxes.
   */
  async detectFrame(imageBlob) {
    // Always fetch a fresh token to avoid 401s from expired/stale sessions
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) throw new Error('Not authenticated')

    const formData = new FormData()
    formData.append('file', imageBlob, 'frame.jpg')

    const response = await fetch(`${BACKEND_URL}/api/detect/frame`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Detection failed: ${response.statusText}`)
    }

    return await response.json()
  },

  /**
   * Log a detection event via Supabase RPC.
   */
  async logDetectionEvent(cameraId, confidence, bbox, snapshotUrl = '', status = 'detected') {
    const { data, error } = await supabase.rpc('log_detection_event', {
      p_camera_id: cameraId,
      p_confidence: confidence,
      p_bbox: bbox,
      p_snapshot_url: snapshotUrl,
      p_status: status,
    })
    if (error) throw error
    return data
  },

  /**
   * Fetch detection history via RPC.
   */
  async getDetectionHistory(limit = 50, offset = 0) {
    const { data, error } = await supabase.rpc('get_detection_history', {
      p_limit: limit,
      p_offset: offset,
    })
    if (error) throw error
    return data
  },
}
