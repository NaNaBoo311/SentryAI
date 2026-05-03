import { useEffect, useState } from 'react'
import { Flame, Thermometer, AlertTriangle } from 'lucide-react'
import { fireService } from '../services/fireService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function FireMonitor() {
  const { session } = useAuth()
  const [temperature, setTemperature] = useState(null)
  const [threshold, setThreshold] = useState(50)
  const [alertTriggered, setAlertTriggered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deviceIp, setDeviceIp] = useState('')

  // Poll every 3 seconds for temperature
  useEffect(() => {
    if (!session?.access_token) return

    const checkTemperature = async () => {
      try {
        // Check alert status
        const alertData = await fireService.checkFireAlert(session.access_token)
        setTemperature(alertData.temperature)
        setThreshold(alertData.threshold)

        if (alertData.alert_triggered && !alertTriggered) {
          setAlertTriggered(true)
          toast.error(`🔥 Fire Alert! Temperature: ${alertData.temperature}°C`)
        } else if (!alertData.alert_triggered && alertTriggered) {
          setAlertTriggered(false)
          toast.success('Temperature normalized')
        }
      } catch (err) {
        console.error('Temperature check error:', err)
      }
    }

    // Initial check
    checkTemperature()

    // Poll interval
    const interval = setInterval(checkTemperature, 3000)
    return () => clearInterval(interval)
  }, [session, alertTriggered])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await fireService.getFireSettings()
      if (settings) {
        setThreshold(settings.temperature_threshold || 50)
        setDeviceIp(settings.device_ip || '')
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      await fireService.updateFireSettings(true, threshold, deviceIp)
      toast.success('Fire settings saved')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 border-l-4 border-l-orange-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-400" />
          <h3 className="text-lg font-semibold text-sentry-50">Fire Detection</h3>
        </div>
        {alertTriggered && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-xs font-semibold text-red-400">ALERT</span>
          </div>
        )}
      </div>

      {/* Temperature Display */}
      <div className="space-y-4">
        <div className="bg-sentry-950/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-sentry-400" />
            <span className="text-sm text-sentry-400">Current Temperature</span>
          </div>
          <div className="text-3xl font-bold text-sentry-50">
            {temperature !== null ? `${temperature.toFixed(1)}°C` : 'Loading...'}
          </div>
        </div>

        {/* Settings */}
        <div>
          <label className="label-text">Device IP Address</label>
          <input
            type="text"
            value={deviceIp}
            onChange={(e) => setDeviceIp(e.target.value)}
            className="input-field"
            placeholder="192.168.1.100"
          />
        </div>

        <div>
          <label className="label-text">
            Temperature Threshold: {threshold}°C
          </label>
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full h-2 bg-sentry-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-sentry-600 mt-1">
            <span>20°C</span>
            <span>60°C</span>
            <span>100°C</span>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="btn-primary w-full"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}