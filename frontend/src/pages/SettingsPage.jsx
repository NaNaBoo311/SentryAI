import { useEffect, useState } from 'react'
import { Settings, User, Shield, Save } from 'lucide-react'
import DetectionToggle from '../components/DetectionToggle'
import LoadingSpinner from '../components/LoadingSpinner'
import { settingsService } from '../services/settingsService'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [detectionEnabled, setDetectionEnabled] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, settingsData] = await Promise.all([
        settingsService.getMyProfile(),
        settingsService.getMyDetectionSettings(),
      ])
      setProfile(profileData)
      setSettings(settingsData)
      setFullName(profileData?.full_name || '')
      setDetectionEnabled(settingsData?.detection_enabled ?? true)
      setConfidenceThreshold(settingsData?.confidence_threshold ?? 0.5)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await settingsService.updateMyProfile(fullName)
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDetection = async () => {
    setSaving(true)
    try {
      await settingsService.updateDetectionSettings(detectionEnabled, confidenceThreshold)
      toast.success('Detection settings saved')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (value) => {
    setDetectionEnabled(value)
    try {
      await settingsService.updateDetectionSettings(value)
      toast.success(value ? 'Detection enabled' : 'Detection paused')
    } catch (err) {
      setDetectionEnabled(!value)
      toast.error('Failed to update')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner text="Loading settings..." />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-7 h-7 text-sentry-400" />
          Settings
        </h1>
        <p className="page-subtitle">Manage your profile and detection preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-sentry-400" />
            <h2 className="text-lg font-semibold text-sentry-50">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="label-text">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </div>

        {/* Detection settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-sentry-400" />
            <h2 className="text-lg font-semibold text-sentry-50">Detection</h2>
          </div>

          <div className="space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sentry-200">Enable Detection</p>
                <p className="text-xs text-sentry-500">
                  Turn on/off human detection for all cameras
                </p>
              </div>
              <DetectionToggle enabled={detectionEnabled} onToggle={handleToggle} />
            </div>

            {/* Confidence threshold */}
            <div>
              <label className="label-text">
                Confidence Threshold: {Math.round(confidenceThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-sentry-800 rounded-lg appearance-none cursor-pointer accent-sentry-500"
              />
              <div className="flex justify-between text-xs text-sentry-600 mt-1">
                <span>10%</span>
                <span>50%</span>
                <span>95%</span>
              </div>
            </div>

            <button
              onClick={handleSaveDetection}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Detection Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
