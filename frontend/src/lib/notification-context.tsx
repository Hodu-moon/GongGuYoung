"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Notification, NotificationPreferences } from "./notification-types"
import { useFCM } from "./fcm-service"
import { useAuth } from "./auth-context"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences | null
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  initializeFCM: (memberId: number) => Promise<() => void>
  requestFCMPermission: () => Promise<boolean>
  isInitialized: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Mock notifications data - 빈 배열로 시작
const mockNotifications: Notification[] = []

const getDefaultPreferences = (userId: string): NotificationPreferences => ({
  userId,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  categories: {
    campaigns: true,
    payments: true,
    bnpl: true,
    promotions: true,
    system: false,
  },
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { initializeFCM: fcmInit, requestPermission } = useFCM()
  const { user, loading: authLoading } = useAuth()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // 로그인 사용자 정보를 기반으로 FCM 자동 초기화
  useEffect(() => {
    const autoInitializeFCM = async () => {
      try {
        // 로그인된 사용자가 있고, 아직 초기화되지 않았을 때만
        if (user && !isInitialized && !authLoading) {
          console.log('🚀 Auto-initializing FCM for logged-in user:', user.id)
          const hasPermission = await requestPermission()
          
          if (hasPermission) {
            await initializeFCMHandler(Number(user.id))
            setIsInitialized(true)
            console.log('✅ Auto FCM initialization completed for user:', user.id)
          } else {
            console.warn('⚠️ FCM permission not granted, skipping auto-init')
          }
        }
      } catch (error) {
        console.error('❌ Auto FCM initialization failed:', error)
      }
    }

    // auth 정보가 로드되고 사용자가 있을 때 FCM 초기화
    if (!authLoading) {
      const timer = setTimeout(autoInitializeFCM, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, isInitialized, authLoading])

  // 사용자 변경 시 preferences 초기화
  useEffect(() => {
    if (user && !authLoading) {
      // 로그인 시 사용자별 기본 설정 적용
      console.log('👤 Setting user preferences for:', user.id)
      setPreferences(getDefaultPreferences(user.id))
    } else if (!user && !authLoading) {
      // 로그아웃 시 모든 상태 리셋
      console.log('🔄 User logged out, resetting all notification state')
      setIsInitialized(false)
      setNotifications([])
      setPreferences(null)
    }
  }, [user, authLoading])

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences((prev) => (prev ? { ...prev, ...newPreferences } : null))
  }

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const initializeFCMHandler = async (memberId: number) => {
    try {
      console.log('🔗 Initializing FCM with notification context integration...')
      
      // FCM 초기화 시 addNotification 콜백을 전달
      const unsubscribe = await fcmInit(memberId, (notificationData) => {
        console.log('📥 Adding FCM notification to context:', notificationData)
        addNotification(notificationData)
      })
      
      console.log('✅ FCM integrated with notification context')
      return unsubscribe
    } catch (error) {
      console.error('❌ Failed to initialize FCM:', error)
      throw error
    }
  }

  const requestFCMPermission = async () => {
    try {
      return await requestPermission()
    } catch (error) {
      console.error('Failed to request FCM permission:', error)
      return false
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        addNotification,
        initializeFCM: initializeFCMHandler,
        requestFCMPermission,
        isInitialized,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
