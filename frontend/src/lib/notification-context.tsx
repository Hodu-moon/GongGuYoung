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

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    type: "campaign_complete",
    title: "공구 성공!",
    message: "생화학 교재 공동구매가 목표를 달성했습니다. 주문이 확정되었어요!",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    relatedId: "1",
    actionUrl: "/campaigns/1",
    priority: "high",
  },
  {
    id: "2",
    userId: "1",
    type: "payment_due",
    title: "결제 예정 알림",
    message: "BNPL 분할결제 38,500원이 내일(2/15) 자동 출금됩니다.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    relatedId: "bnpl-1",
    actionUrl: "/bnpl",
    priority: "high",
  },
  {
    id: "3",
    userId: "1",
    type: "new_campaign",
    title: "새로운 공구 등장!",
    message: "관심 카테고리 '전자기기'에 iPad 공동구매가 새로 등록되었어요.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    relatedId: "3",
    actionUrl: "/campaigns/3",
    priority: "medium",
  },
  {
    id: "4",
    userId: "1",
    type: "campaign_deadline",
    title: "마감 임박!",
    message: "간호학과 실습복 공구가 2일 후 마감됩니다. 서둘러 참여하세요!",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    relatedId: "2",
    actionUrl: "/campaigns/2",
    priority: "high",
  },
  {
    id: "5",
    userId: "1",
    type: "bnpl_approved",
    title: "BNPL 승인 완료",
    message: "생화학 교재 BNPL 신청이 승인되었습니다. 첫 결제는 다음 달부터 시작됩니다.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    relatedId: "bnpl-1",
    actionUrl: "/bnpl",
    priority: "high",
  },
]

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
