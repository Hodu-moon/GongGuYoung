"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { Notification, NotificationPreferences } from "./notification-types"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences | null
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Mock notifications data - 빈 배열로 시작
const mockNotifications: Notification[] = []

const mockPreferences: NotificationPreferences = {
  userId: "1",
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
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(mockPreferences)

  const unreadCount = notifications.filter((n) => !n.isRead).length

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
