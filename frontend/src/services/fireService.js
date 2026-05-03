import { supabase } from '../utils/supabaseClient'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export const fireService = {
  /**
   * Get current temperature from IoT device
   */
  async getTemperature(accessToken) {
    const response = await fetch(`${BACKEND_URL}/api/fire/temperature`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch temperature: ${response.statusText}`)
    }

    return await response.json()
  },

  /**
   * Check if fire alert should be triggered
   */
  async checkFireAlert(accessToken) {
    const response = await fetch(`${BACKEND_URL}/api/fire/check-alert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Fire alert check failed: ${response.statusText}`)
    }

    return await response.json()
  },

  /**
   * Get fire detection settings
   */
  async getFireSettings() {
    const { data, error } = await supabase.rpc('get_my_fire_settings')
    if (error) throw error
    return data?.[0] ?? null
  },

  /**
   * Update fire detection settings
   */
  async updateFireSettings(fireDetectionEnabled, temperatureThreshold, deviceIp) {
    const params = {}
    if (fireDetectionEnabled !== undefined) params.p_fire_detection_enabled = fireDetectionEnabled
    if (temperatureThreshold !== undefined) params.p_temperature_threshold = temperatureThreshold
    if (deviceIp !== undefined) params.p_device_ip = deviceIp

    const { data, error } = await supabase.rpc('update_fire_settings', params)
    if (error) throw error
    return data
  },

  /**
   * Get fire alerts history
   */
  async getFireAlertsHistory(limit = 50, offset = 0) {
    const { data, error } = await supabase.rpc('get_fire_alerts', {
      p_limit: limit,
      p_offset: offset,
    })
    if (error) throw error
    return data
  },
}