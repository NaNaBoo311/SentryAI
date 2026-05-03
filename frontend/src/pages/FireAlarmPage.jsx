import { useEffect, useState } from 'react'
import { Flame, Zap, AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { fireAlarmService } from '../services/fireAlarmService'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const TEMPERATURE_THRESHOLD = 20

export default function FireAlarmPage() {
  // State Management
  const [temperature, setTemperature] = useState(null)
  const [mode, setMode] = useState('simulator') // 'simulator' or 'mqtt'
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(mode === 'mqtt')
  const [alertTriggered, setAlertTriggered] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [simulatorValue, setSimulatorValue] = useState(25)
  const [mqttError, setMqttError] = useState(null)

  // MQTT Connection Effect
  useEffect(() => {
    if (mode !== 'mqtt') return

    setLoading(true)
    const handleMessage = (data) => {
      const temp = data.temperature || data.temp || 0
      setTemperature(temp)
      setLastUpdate(new Date().toLocaleTimeString())
      setMqttError(null)
      setLoading(false)
    }

    const handleConnection = (isConnected) => {
      setConnected(isConnected)
      if (!isConnected) {
        setMqttError('Cannot connect to MQTT broker. Check your connection.')
        setLoading(false) // Lỗi thì tắt loading
      } else {
        setLoading(false) // THÊM DÒNG NÀY: Kết nối thành công cũng phải tắt loading luôn!
      }
    }

    fireAlarmService.connect(handleMessage, handleConnection)

    return () => {
      fireAlarmService.disconnect()
    }
  }, [mode])

  // Update temperature when mode or simulator value changes
  useEffect(() => {
    if (mode === 'simulator') {
      setTemperature(simulatorValue)
      setLastUpdate(new Date().toLocaleTimeString())
      setConnected(true)
      setLoading(false)
    }
  }, [mode, simulatorValue])

  // Fire Alert Logic
  useEffect(() => {
    if (temperature === null) return

    const isAlert = temperature > TEMPERATURE_THRESHOLD

    if (isAlert && !alertTriggered) {
      setAlertTriggered(true)
      toast.error(
        `🔥 FIRE ALARM! Temperature: ${temperature.toFixed(1)}°C`,
        { duration: 5000 }
      )
      // Optional: Play sound or trigger vibration
      playAlarmSound()
    } else if (!isAlert && alertTriggered) {
      setAlertTriggered(false)
      toast.success(`✅ Temperature normalized: ${temperature.toFixed(1)}°C`)
    }
  }, [temperature, alertTriggered])

  // Simple alarm sound
  const playAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 1000
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      )

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (err) {
      console.warn('Audio context not available')
    }
  }

  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    setAlertTriggered(false)
    setTemperature(null)
    setMqttError(null)
  }

  const handleRetryConnection = () => {
    setLoading(true)
    fireAlarmService.disconnect()
    setTimeout(() => {
      fireAlarmService.connect(
        (data) => {
          const temp = data.temperature || data.temp || 0
          setTemperature(temp)
          setLastUpdate(new Date().toLocaleTimeString())
          setMqttError(null)
          setLoading(false)
        },
        (isConnected) => {
          setConnected(isConnected)
          if (!isConnected) {
            setMqttError('Cannot connect to MQTT broker.')
            setLoading(false)
          }
        }
      )
    }, 1000)
  }

  return (
    <div className={`page-container transition-all duration-300 ${
      alertTriggered ? 'bg-red-950/30' : ''
    }`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            alertTriggered 
              ? 'bg-red-500/80 animate-pulse' 
              : 'bg-orange-500/80'
          }`}>
            <Flame className="w-5 h-5 text-white" />
          </div>
          Fire Alarm System
        </h1>
        <p className="page-subtitle">Real-time temperature monitoring & fire detection</p>
      </div>

      {/* Main Alert Display */}
      <div className={`glass-card p-8 mb-8 border-2 transition-all duration-300 ${
        alertTriggered
          ? 'border-red-500/60 bg-gradient-to-br from-red-950/40 to-red-900/20 shadow-2xl shadow-red-600/30'
          : 'border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-orange-900/10'
      }`}>
        {/* Status Indicator */}
        <div className="text-center mb-6">
          {alertTriggered ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-full mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
              <span className="text-red-300 font-bold text-sm animate-pulse">🔥 FIRE WARNING 🔥</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full mb-4">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-bold text-sm">Safe & Normal</span>
            </div>
          )}
        </div>

        {/* Temperature Display */}
        <div className="text-center">
          <div className={`text-6xl font-black mb-2 transition-all duration-300 ${
            alertTriggered 
              ? 'text-red-400 drop-shadow-lg animate-pulse' 
              : 'text-orange-300'
          }`}>
            {temperature !== null ? temperature.toFixed(1) : '—'}
            <span className="text-3xl ml-2">°C</span>
          </div>
          
          {/* Threshold indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-full max-w-xs bg-sentry-800/60 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  alertTriggered ? 'bg-red-500 w-full' : 'bg-orange-400'
                }`}
                style={{
                  width: temperature !== null 
                    ? `${Math.min((temperature / 100) * 100, 100)}%`
                    : '0%'
                }}
              />
            </div>
          </div>
          
          <p className="text-sentry-400 text-sm mt-3">
            Threshold: {TEMPERATURE_THRESHOLD}°C
          </p>
        </div>

        {/* Status info */}
        {lastUpdate && (
          <div className="text-center mt-6 pt-4 border-t border-sentry-700/40">
            <p className="text-xs text-sentry-500">
              Last update: {lastUpdate}
            </p>
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-sentry-50 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-sentry-400" />
          Connection Mode
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulator Mode */}
          <button
            onClick={() => handleModeSwitch('simulator')}
            className={`p-4 rounded-xl border-2 transition-all ${
              mode === 'simulator'
                ? 'border-sentry-400 bg-sentry-700/30 shadow-lg shadow-sentry-600/20'
                : 'border-sentry-700/40 bg-sentry-800/30 hover:border-sentry-600/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-semibold text-sentry-100">Simulation Mode</span>
            </div>
            <p className="text-xs text-sentry-400 text-left">
              Manual temperature control for testing
            </p>
          </button>

          {/* MQTT Mode */}
          <button
            onClick={() => handleModeSwitch('mqtt')}
            className={`p-4 rounded-xl border-2 transition-all ${
              mode === 'mqtt'
                ? 'border-sentry-400 bg-sentry-700/30 shadow-lg shadow-sentry-600/20'
                : 'border-sentry-700/40 bg-sentry-800/30 hover:border-sentry-600/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                connected 
                  ? 'bg-emerald-500/20' 
                  : 'bg-red-500/20'
              }`}>
                {connected ? (
                  <Wifi className="w-4 h-4 text-emerald-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
              </div>
              <span className="font-semibold text-sentry-100">
                MQTT Hardware
              </span>
            </div>
            <p className="text-xs text-sentry-400 text-left">
              Real-time data from IoT device (OhStem)
            </p>
          </button>
        </div>
      </div>

      {/* Simulator Slider */}
      {mode === 'simulator' && (
        <div className="glass-card p-6 mb-8 border-l-4 border-l-blue-500">
          <h3 className="text-lg font-semibold text-sentry-50 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            Temperature Simulator
          </h3>
          
          <div className="space-y-4">
            {/* Slider */}
            <div>
              <label className="label-text">
                Temperature: {simulatorValue}°C
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={simulatorValue}
                onChange={(e) => setSimulatorValue(parseInt(e.target.value))}
                className="w-full h-3 bg-sentry-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-sentry-600 mt-2">
                <span>0°C</span>
                <span>50°C (Threshold)</span>
                <span>100°C</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setSimulatorValue(15)}
                className="btn-secondary text-sm py-2"
              >
                Cold (15°C)
              </button>
              <button
                onClick={() => setSimulatorValue(30)}
                className="btn-secondary text-sm py-2"
              >
                Normal (30°C)
              </button>
              <button
                onClick={() => setSimulatorValue(55)}
                className="btn-secondary text-sm py-2 bg-orange-600/40 border-orange-500/30 hover:bg-orange-600/50"
              >
                Warm (55°C)
              </button>
              <button
                onClick={() => setSimulatorValue(75)}
                className="btn-secondary text-sm py-2 bg-red-600/40 border-red-500/30 hover:bg-red-600/50"
              >
                Hot (75°C)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MQTT Status & Debug */}
      {mode === 'mqtt' && (
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-sentry-50 mb-4 flex items-center gap-2">
            <Wifi className={`w-5 h-5 ${
              connected ? 'text-emerald-400' : 'text-red-400'
            }`} />
            MQTT Connection Status
          </h3>

          {loading ? (
            <LoadingSpinner size="sm" text="Connecting to MQTT broker..." />
          ) : (
            <div className="space-y-3">
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  connected ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <span className={`text-sm font-medium ${
                  connected ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  {connected ? '✅ Connected' : '❌ Disconnected'}
                </span>
              </div>

              {/* Error message */}
              {mqttError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4">
                  <p className="text-red-400 text-sm">{mqttError}</p>
                  <button
                    onClick={handleRetryConnection}
                    className="btn-secondary text-sm mt-2 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Connection details */}
              {connected && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mt-4 text-sm text-emerald-300">
                  <p>🔗 Broker: mqtt.ohstem.vn:8084</p>
                  <p>📡 Topic: sentryai/temperature</p>
                  <p>🔄 Listening for real-time data...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Information Panel */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-sentry-50 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-sentry-400" />
          System Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-sentry-500 mb-1">Fire Alert Threshold</p>
            <p className="text-sentry-200 font-semibold">{TEMPERATURE_THRESHOLD}°C</p>
          </div>
          <div>
            <p className="text-sentry-500 mb-1">Current Status</p>
            <p className={`font-semibold ${
              temperature !== null && temperature > TEMPERATURE_THRESHOLD
                ? 'text-red-400'
                : 'text-emerald-400'
            }`}>
              {temperature !== null && temperature > TEMPERATURE_THRESHOLD
                ? '🔥 FIRE ALARM ACTIVE'
                : '✅ SAFE'}
            </p>
          </div>
          <div>
            <p className="text-sentry-500 mb-1">Connection Mode</p>
            <p className="text-sentry-200 font-semibold capitalize">
              {mode === 'simulator' ? 'Simulation' : 'MQTT (Real Hardware)'}
            </p>
          </div>
          <div>
            <p className="text-sentry-500 mb-1">Last Update</p>
            <p className="text-sentry-200 font-semibold">
              {lastUpdate || '—'}
            </p>
          </div>
        </div>

        {/* Info text */}
        <div className="mt-4 p-3 bg-sentry-800/40 rounded-lg border border-sentry-700/30">
          <p className="text-xs text-sentry-400">
            <strong>ℹ️ How it works:</strong> The system monitors temperature in real-time. If the temperature exceeds {TEMPERATURE_THRESHOLD}°C, 
            a fire alarm is triggered with visual and audio alerts. Use Simulation Mode to test the system without hardware.
          </p>
        </div>
      </div>
    </div>
  )
}