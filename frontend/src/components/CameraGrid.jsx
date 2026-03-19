import CameraCard from './CameraCard'
import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

export default function CameraGrid({
  devices,
  cameraRecords,
  detectionEnabled,
  loading,
}) {
  if (loading) {
    return <LoadingSpinner text="Discovering cameras..." />
  }

  if (!devices || devices.length === 0) {
    return (
      <EmptyState
        icon="camera"
        title="No cameras found"
        description="Connect a camera or grant browser permission to start monitoring."
      />
    )
  }

  // Match device to DB camera record by device_id
  const getCameraRecord = (deviceId) =>
    cameraRecords?.find((c) => c.device_id === deviceId) || null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {devices.map((device) => (
        <CameraCard
          key={device.deviceId}
          device={device}
          cameraRecord={getCameraRecord(device.deviceId)}
          detectionEnabled={detectionEnabled}
        />
      ))}
    </div>
  )
}
