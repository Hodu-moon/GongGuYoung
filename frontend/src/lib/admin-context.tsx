"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { AdminUser, PlatformMetrics, AdminNotification } from "./admin-data"
import { mockAdminUser, mockPlatformMetrics, mockAdminNotifications } from "./admin-data"

interface AdminContextType {
  adminUser: AdminUser | null
  metrics: PlatformMetrics
  notifications: AdminNotification[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  markNotificationRead: (id: string) => void
  loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [metrics] = useState<PlatformMetrics>(mockPlatformMetrics)
  const [notifications, setNotifications] = useState<AdminNotification[]>(mockAdminNotifications)
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Mock admin login
      if (email === "admin@heyoung.com" && password === "admin123") {
        setAdminUser(mockAdminUser)
        localStorage.setItem("admin_token", "mock_admin_token")
      } else {
        throw new Error("잘못된 관리자 계정입니다.")
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAdminUser(null)
    localStorage.removeItem("admin_token")
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        metrics,
        notifications,
        login,
        logout,
        markNotificationRead,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
