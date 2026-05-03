import mqtt from 'mqtt'

class FireAlarmService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.listeners = []
  }

  /**
   * Connect to OhStem MQTT broker via WebSocket
   */
  connect(onMessageCallback, onConnectionCallback) {
    const brokerUrl = 'wss://mqtt.ohstem.vn:8084/mqtt'
    
    try {
      this.client = mqtt.connect(brokerUrl, {
        protocol: 'wss',
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        clientId: `sentryai-${Math.random().toString(16).slice(2, 8)}`,
        username: 'sentryai_test',
      })

      this.client.on('connect', () => {
        console.log('✅ Connected to MQTT broker')
        this.isConnected = true
        if (onConnectionCallback) onConnectionCallback(true)
        
        // Subscribe to temperature topic
        this.subscribe('sentryai_test/feeds/sentryai/temperature', (payload) => {
          try {
            const data = JSON.parse(payload)
            if (onMessageCallback) onMessageCallback(data)
          } catch (err) {
            console.error('Failed to parse MQTT message:', err)
          }
        })
      })

      this.client.on('error', (err) => {
        console.error('❌ MQTT connection error:', err)
        this.isConnected = false
        if (onConnectionCallback) onConnectionCallback(false)
      })

      this.client.on('offline', () => {
        console.warn('⚠️ MQTT client offline')
        this.isConnected = false
        if (onConnectionCallback) onConnectionCallback(false)
      })

      this.client.on('disconnect', () => {
        console.log('Disconnected from MQTT broker')
        this.isConnected = false
      })
    } catch (err) {
      console.error('Failed to initialize MQTT client:', err)
      this.isConnected = false
    }
  }

  /**
   * Subscribe to a specific topic
   */
  subscribe(topic, callback) {
    if (!this.client || !this.isConnected) {
      console.warn('MQTT client not connected')
      return
    }

    // Chỉ theo dõi đúng topic được truyền vào
    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err)
      } else {
        console.log(`✅ Subscribed to ${topic}`)
      }
    })

    // Lọc cực kỳ nghiêm ngặt: Phải ĐÚNG tên topic mới cho qua
    this.client.on('message', (receivedTopic, message) => {
      if (receivedTopic === topic) {
        callback(message.toString())
      }
    })
  }

  /**
   * Publish to a topic (optional)
   */
  publish(topic, message) {
    if (!this.client || !this.isConnected) {
      console.warn('MQTT client not connected')
      return
    }

    this.client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to publish to ${topic}:`, err)
      }
    })
  }

  /**
   * Disconnect from broker
   */
  disconnect() {
    if (this.client) {
      this.client.end(true, () => {
        console.log('Disconnected from MQTT broker')
        this.isConnected = false
      })
    }
  }

  /**
   * Check connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      client: this.client,
    }
  }
}

export const fireAlarmService = new FireAlarmService()