import { useEffect, useState } from 'react'
import { Flame, Thermometer, AlertTriangle, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { fireService } from '../services/fireService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function FireAlertPage() {
  const { session } = useAuth()
  const [temperature, setTemperature] = useState(null)
  const [threshold, setThreshold] = useState(50)
  const [fireDetectionEnabled, setFireDetectionEnabled] = useState(true)
  const [alertTriggered, setAlertTriggered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deviceIp, setDeviceIp] = useState('')
  const [history, setHistory] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('checking') // 'connected', 'disconnected', 'checking'
  const [lastUpdate, setLastUpdate] = useState(null)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Poll temperature every 3 seconds
  useEffect(() => {
    if (!session?.access_token || !fireDetectionEnabled) return

    const checkTemperature = async () => {
      try {
        const alertData = await fireService.checkFireAlert(session.access_token)
        setTemperature(alertData.temperature)
        setThreshold(alertData.threshold)
        setConnectionStatus('connected')
        setLastUpdate(new Date())

        if (alertData.alert_triggered && !alertTriggered) {
          setAlertTriggered(true)
          toast.error(`🔥 Fire Alert! Temperature: ${alertData.temperature}°C`, {
            duration: 5000,
            icon: '🔥',
          })
          playAlarmSound()
        } else if (!alertData.alert_triggered && alertTriggered) {
          setAlertTriggered(false)
          toast.success('Temperature normalized', {
            icon: '✅',
          })
        }
      } catch (err) {
        console.error('Temperature check error:', err)
        setConnectionStatus('disconnected')
      }
    }

    // Initial check
    checkTemperature()

    // Poll interval
    const interval = setInterval(checkTemperature, 3000)
    return () => clearInterval(interval)
  }, [session, fireDetectionEnabled, alertTriggered])

  // Load fire settings
  const loadSettings = async () => {
    try {
      const settings = await fireService.getFireSettings()
      if (settings) {
        setThreshold(settings.temperature_threshold || 50)
        setDeviceIp(settings.device_ip || '')
        setFireDetectionEnabled(settings.fire_detection_enabled !== false)
      }

      // Load alert history
      const alertHistory = await fireService.getFireAlertsHistory(20, 0)
      setHistory(alertHistory || [])
    } catch (err) {
      console.error('Failed to load settings:', err)
      toast.error('Failed to load fire settings')
    }
  }

  const handleSaveSettings = async () => {
    if (!deviceIp.trim()) {
      toast.error('Please enter device IP address')
      return
    }

    setLoading(true)
    try {
      await fireService.updateFireSettings(fireDetectionEnabled, threshold, deviceIp)
      toast.success('Fire settings saved successfully')
      loadSettings()
    } catch (err) {
      console.error('Failed to save settings:', err)
      toast.error('Failed to save fire settings')
    } finally {
      setLoading(false)
    }
  }

  const playAlarmSound = () => {
    // Simple beep sound (if browser supports Web Audio API)
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (err) {
      console.log('Audio not available')
    }
  }

  const getStatusColor = () => {
    if (!fireDetectionEnabled) return 'bg-sentry-800/40 border-sentry-700'
    if (alertTriggered) return 'bg-red-500/20 border-red-500/30'
    if (connectionStatus === 'disconnected') return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-green-500/20 border-green-500/30'
  }

  const getStatusIcon = () => {
    if (!fireDetectionEnabled) return '⚪'
    if (alertTriggered) return '🔥'
    if (connectionStatus === 'disconnected') return '⚠️'
    return '✅'
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleString('vi-VN')
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">🔥 Fire Alert System</h1>
        <p className="page-subtitle">Real-time temperature monitoring from IoT device</p>
      </div>

      {/* Main Status Card */}
      <div className={`glass-card p-8 mb-6 border-l-4 border-l-orange-500 transition-all ${getStatusColor()}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-sentry-50">{getStatusIcon()} Fire Detection</span>
            </div>
            <p className="text-sentry-400">
              {!fireDetectionEnabled
                ? 'Fire detection is disabled'
                : alertTriggered
                  ? 'ALERT: Temperature exceeded threshold!'
                  : connectionStatus === 'disconnected'
                    ? 'Warning: Cannot connect to device'
                    : 'System is monitoring...'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold text-sentry-50">
              {temperature !== null ? `${temperature.toFixed(1)}°C` : '-'}
            </div>
            <div className="text-sm text-sentry-500 mt-2">Threshold: {threshold}°C</div>
            {lastUpdate && (
              <div className="text-xs text-sentry-600 mt-1">Updated: {formatTime(lastUpdate)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Settings Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-sentry-50 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-sentry-400" />
            Device Configuration
          </h2>

          <div className="space-y-4">
            {/* Device IP Input */}
            <div>
              <label className="block text-sm font-medium text-sentry-200 mb-2">Device IP Address</label>
              <input
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                className="input-field"
                placeholder="192.168.1.100"
                disabled={loading}
              />
              <p className="text-xs text-sentry-600 mt-1">
                IP address of your Yolo:Bit device (e.g., 192.168.x.x)
              </p>
            </div>

            {/* Temperature Threshold Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-sentry-200">Temperature Threshold</label>
                <span className="text-lg font-bold text-orange-400">{threshold}°C</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                disabled={loading}
                className="w-full h-2 bg-sentry-800 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-sentry-600 mt-2">
                <span>20°C (Cold)</span>
                <span>60°C (Warm)</span>
                <span>100°C (Hot)</span>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 bg-sentry-900/40 rounded-lg border border-sentry-800/30">
              <label className="text-sm font-medium text-sentry-200">Fire Detection Status</label>
              <button
                onClick={() => setFireDetectionEnabled(!fireDetectionEnabled)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  fireDetectionEnabled
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-sentry-800/50 text-sentry-400 border border-sentry-700/30'
                } disabled:opacity-50`}
              >
                {fireDetectionEnabled ? '🟢 Enabled' : '⚪ Disabled'}
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-sentry-50 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sentry-400" />
            System Status
          </h2>

          <div className="space-y-3">
            {/* Connection Status */}
            <div className="p-3 bg-sentry-900/40 rounded-lg border border-sentry-800/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-sentry-400">Connection Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    connectionStatus === 'connected'
                      ? 'bg-green-500/20 text-green-300'
                      : connectionStatus === 'disconnected'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {connectionStatus === 'connected'
                    ? '✅ Connected'
                    : connectionStatus === 'disconnected'
                      ? '❌ Disconnected'
                      : '⏳ Checking...'}
                </span>
              </div>
            </div>

            {/* Alert Status */}
            <div className="p-3 bg-sentry-900/40 rounded-lg border border-sentry-800/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-sentry-400">Alert Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    alertTriggered ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                  }`}
                >
                  {alertTriggered ? (
                    <>
                      <span className="animate-pulse">🔴</span> ALERT
                    </>
                  ) : (
                    <>
                      <span>🟢</span> Safe
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Detection Enabled */}
            <div className="p-3 bg-sentry-900/40 rounded-lg border border-sentry-800/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-sentry-400">Detection Enabled</span>
                <span className={fireDetectionEnabled ? 'text-green-300 font-semibold' : 'text-sentry-500'}>
                  {fireDetectionEnabled ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-blue-300">
                💡 <strong>Tip:</strong> Make sure your Yolo:Bit device is connected to the same network and
                transmitting temperature data via HTTP API at <code className="bg-sentry-900/60 px-2 py-1">/api/sensor/temperature</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-sentry-50 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sentry-400" />
          Alert History
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <Flame className="w-12 h-12 text-sentry-700 mx-auto mb-3" />
            <p className="text-sentry-500">No fire alerts recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs font-semibold text-sentry-400 border-b border-sentry-800/30">
                <tr>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Temperature</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Message</th>
                </tr>
              </thead>
              <tbody className="text-sm text-sentry-300">
                {history.map((alert, idx) => (
                  <tr key={alert.id || idx} className="border-b border-sentry-800/20 hover:bg-sentry-900/30">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-sentry-500">
                      {formatTime(alert.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <span className="text-orange-400">{alert.temperature.toFixed(1)}°C</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          alert.status === 'triggered'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}
                      >
                        {alert.status === 'triggered' ? '🔥 Triggered' : '✅ Resolved'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sentry-400">{alert.alert_message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
