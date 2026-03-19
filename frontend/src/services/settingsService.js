import { supabase } from '../utils/supabaseClient'

export const settingsService = {
  async getMyDetectionSettings() {
    const { data, error } = await supabase.rpc('get_my_detection_settings')
    if (error) throw error
    return data?.[0] ?? null
  },

  async updateDetectionSettings(detectionEnabled, confidenceThreshold) {
    const params = {}
    if (detectionEnabled !== undefined) params.p_detection_enabled = detectionEnabled
    if (confidenceThreshold !== undefined) params.p_confidence_threshold = confidenceThreshold

    const { data, error } = await supabase.rpc('update_detection_settings', params)
    if (error) throw error
    return data
  },

  async getMyProfile() {
    const { data, error } = await supabase.rpc('get_my_profile')
    if (error) throw error
    return data?.[0] ?? null
  },

  async updateMyProfile(fullName, avatarUrl) {
    const params = {}
    if (fullName !== undefined) params.p_full_name = fullName
    if (avatarUrl !== undefined) params.p_avatar_url = avatarUrl

    const { data, error } = await supabase.rpc('update_my_profile', params)
    if (error) throw error
    return data
  },
}
