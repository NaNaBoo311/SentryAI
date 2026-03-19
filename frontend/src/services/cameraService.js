import { supabase } from '../utils/supabaseClient'

export const cameraService = {
  async getMyCameras() {
    const { data, error } = await supabase.rpc('get_my_cameras')
    if (error) throw error
    return data
  },

  async upsertCamera(name, deviceId) {
    const { data, error } = await supabase.rpc('upsert_camera', {
      p_name: name,
      p_device_id: deviceId,
    })
    if (error) throw error
    return data
  },

  async deleteCamera(cameraId) {
    const { data, error } = await supabase.rpc('delete_camera', {
      p_camera_id: cameraId,
    })
    if (error) throw error
    return data
  },

  async setCameraActive(cameraId, isActive) {
    const { data, error } = await supabase.rpc('set_camera_active', {
      p_camera_id: cameraId,
      p_is_active: isActive,
    })
    if (error) throw error
    return data
  },
}
