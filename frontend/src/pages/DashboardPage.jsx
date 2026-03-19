import { useEffect, useState, useCallback, useRef } from 'react'
import { Shield, Camera, Eye, EyeOff } from 'lucide-react'
import CameraGrid from '../components/CameraGrid'
import DetectionToggle from '../components/DetectionToggle'
import NotificationToast from '../components/NotificationToast'
import { useDeviceCameras } from '../hooks/useDeviceCameras'
import { cameraService } from '../services/cameraService'
import { settingsService } from '../services/settingsService'
import { notificationService } from '../services/notificationService'

export default function DashboardPage() {
  const { devices, loading: camerasLoading, error: cameraError } = useDeviceCameras()
  const [cameraRecords, setCameraRecords] = useState([])
  const [detectionEnabled, setDetectionEnabled] = useState(true)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [stats, setStats] = useState({ cameras: 0, events: 0, unread: 0 })
  const prevUnreadRef = useRef(0)

  // Load settings & stats
  useEffect(() => {
    loadSettings()
    loadStats()
  }, [])

  // Register discovered cameras in DB
  useEffect(() => {
    if (devices.length > 0) {
      registerCameras()
    }
  }, [devices])

  // Poll for new notifications (toast trigger)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const count = await notificationService.getUnreadCount()
        if (count > prevUnreadRef.current && prevUnreadRef.current > 0) {
          setToastMessage('A new person detection alert has been recorded.')
        }
        prevUnreadRef.current = count
        setStats((prev) => ({ ...prev, unread: count }))
      } catch { /* ignore */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await settingsService.getMyDetectionSettings()
      if (settings) {
        setDetectionEnabled(settings.detection_enabled)
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const loadStats = async () => {
    try {
      const [cameras, unread] = await Promise.all([
        cameraService.getMyCameras(),
        notificationService.getUnreadCount(),
      ])
      prevUnreadRef.current = unread || 0
      setStats({
        cameras: cameras?.length || 0,
        events: 0,
        unread: unread || 0,
      })
    } catch { /* ignore */ }
  }

  const registerCameras = async () => {
    try {
      for (const device of devices) {
        await cameraService.upsertCamera(
          device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          device.deviceId
        )
      }
      const records = await cameraService.getMyCameras()
      setCameraRecords(records || [])
      setStats((prev) => ({ ...prev, cameras: records?.length || 0 }))
    } catch (err) {
      console.error('Failed to register cameras:', err)
    }
  }

  const handleToggleDetection = async (value) => {
    setToggleLoading(true)
    try {
      await settingsService.updateDetectionSettings(value)
      setDetectionEnabled(value)
    } catch (err) {
      console.error('Failed to toggle detection:', err)
    } finally {
      setToggleLoading(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield className="w-7 h-7 text-sentry-400" />
            Security Dashboard
          </h1>
          <p className="page-subtitle">Monitor your cameras and detection activity</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-sentry-400 flex items-center gap-1.5">
            {detectionEnabled ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-sentry-500" />
            )}
            Detection
          </span>
          <DetectionToggle
            enabled={detectionEnabled}
            onToggle={handleToggleDetection}
            loading={toggleLoading}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sentry-600/20 flex items-center justify-center">
            <Camera className="w-5 h-5 text-sentry-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-sentry-50">{stats.cameras}</p>
            <p className="text-xs text-sentry-500">Active Cameras</p>
          </div>
        </div>
        <div className="glass-card px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-sentry-50">
              {detectionEnabled ? 'Active' : 'Paused'}
            </p>
            <p className="text-xs text-sentry-500">Detection Status</p>
          </div>
        </div>
        <div className="glass-card px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm">{stats.unread}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-sentry-50">{stats.unread}</p>
            <p className="text-xs text-sentry-500">Unread Alerts</p>
          </div>
        </div>
      </div>

      {/* Camera error */}
      {cameraError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
          <p className="text-red-400 text-sm">{cameraError}</p>
        </div>
      )}

      {/* Camera grid */}
      <CameraGrid
        devices={devices}
        cameraRecords={cameraRecords}
        detectionEnabled={detectionEnabled}
        loading={camerasLoading}
      />

      {/* Toast */}
      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  )
}
