import { getFCMToken, onForegroundMessage } from './firebase-config'
import type { MessagePayload } from 'firebase/messaging'
import { convertFCMPayloadToNotification } from './notification-types'
import type { Notification } from './notification-types'

export interface FCMService {
  initializeFCM: () => Promise<void>
  requestPermission: () => Promise<boolean>
  getToken: () => Promise<string | null>
  subscribeToMessages: (onNotification?: (notification: Omit<Notification, "id" | "createdAt">) => void) => () => void
}

class FCMServiceImpl implements FCMService {
  private token: string | null = null
  private memberId: number | null = null
  private userId: string = "1" // 기본값, 실제 구현에서는 로그인 시 설정

  async initializeFCM(): Promise<void> {
    try {
      console.log('🔥 FCM initialization started...')
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        console.log('📝 Registering service worker...')
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope'
        })
        console.log('✅ Service worker registered:', registration)
      } else {
        console.warn('⚠️ Service Worker not supported in this browser')
      }
      
      // Get FCM token
      console.log('🎯 Getting FCM token...')
      const token = await this.getToken()
      if (token && this.memberId) {
        console.log('🚀 Registering token with server...')
        await this.registerTokenWithServer(token)
      } else {
        console.warn('⚠️ No token or memberId:', { token: token?.substring(0, 20) + '...', memberId: this.memberId })
      }
      
      console.log('✅ FCM initialization completed')
    } catch (error) {
      console.error('❌ FCM initialization failed:', error)
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      console.log('🔔 Requesting notification permission...')
      const permission = await Notification.requestPermission()
      console.log('🔔 Notification permission:', permission)
      return permission === 'granted'
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error)
      return false
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (this.token) {
        return this.token
      }

      const token = await getFCMToken()
      if (token) {
        this.token = token
        console.log('FCM Token received:', token.substring(0, 20) + '...')
      }
      return token
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }

  subscribeToMessages(onNotification?: (notification: Omit<Notification, "id" | "createdAt">) => void): () => void {
    return onForegroundMessage((payload: MessagePayload) => {
      console.log('📨 Foreground FCM message received:', payload)
      
      // Convert FCM payload to notification format
      const notificationData = convertFCMPayloadToNotification(payload, this.userId)
      console.log('🔄 Converted notification data:', notificationData)
      
      // Call the callback to add notification to context
      if (onNotification) {
        console.log('📤 Adding notification to context via callback')
        onNotification(notificationData)
      }
      
      // Show browser notification only if page is not focused or callback is not provided
      if (Notification.permission === 'granted' && (!document.hasFocus() || !onNotification)) {
        console.log('🔔 Showing browser notification')
        const notification = new Notification(
          payload.notification?.title || 'GongGuYoung',
          {
            body: payload.notification?.body || 'New notification',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: payload.data,
            requireInteraction: true
          }
        )

        notification.onclick = () => {
          window.focus()
          notification.close()
          
          // Navigate to action URL if provided
          if (payload.data?.actionUrl) {
            window.location.href = payload.data.actionUrl
          }
        }
      }
    })
  }

  setMemberId(memberId: number): void {
    this.memberId = memberId
    this.userId = memberId.toString() // userId도 함께 설정
  }

  private async registerTokenWithServer(token: string): Promise<void> {
    try {
      if (!this.memberId) {
        console.warn('Member ID not set, cannot register FCM token')
        return
      }

      const response = await fetch('/api/fcm/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: this.memberId,
          token: token,
          deviceType: this.getDeviceType()
        })
      })

      if (response.ok) {
        console.log('FCM token registered successfully')
      } else {
        console.error('Failed to register FCM token:', response.statusText)
      }
    } catch (error) {
      console.error('Error registering FCM token:', error)
    }
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return 'mobile'
    } else if (/tablet/i.test(userAgent)) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  async unregisterToken(): Promise<void> {
    try {
      if (!this.token || !this.memberId) {
        return
      }

      await fetch(`/api/fcm/token?memberId=${this.memberId}&token=${this.token}`, {
        method: 'DELETE'
      })

      this.token = null
      console.log('FCM token unregistered')
    } catch (error) {
      console.error('Error unregistering FCM token:', error)
    }
  }
}

export const fcmService = new FCMServiceImpl()

// Hook for using FCM in React components
export const useFCM = () => {
  const initializeFCM = async (
    memberId: number, 
    onNotification?: (notification: Omit<Notification, "id" | "createdAt">) => void
  ) => {
    fcmService.setMemberId(memberId)
    await fcmService.initializeFCM()
    return fcmService.subscribeToMessages(onNotification)
  }

  const requestPermission = () => fcmService.requestPermission()
  const getToken = () => fcmService.getToken()
  const unregister = () => fcmService.unregisterToken()

  return {
    initializeFCM,
    requestPermission,
    getToken,
    unregister
  }
}