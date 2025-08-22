

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationItem } from "@/components/notifications/notification-item"
import { useNotifications } from "@/lib/notification-context"
import type { NotificationType } from "@/lib/notification-types"
import { ArrowLeft, Bell } from "lucide-react"
import { Link } from 'react-router-dom'

export default function NotificationsPage() {
  const { notifications, markAllAsRead } = useNotifications()
  const [selectedType, setSelectedType] = useState<NotificationType | "all">("all")

  const filteredNotifications = notifications.filter((notification) =>
    selectedType === "all" ? true : notification.type === selectedType,
  )

  const unreadNotifications = filteredNotifications.filter((n) => !n.isRead)
  const readNotifications = filteredNotifications.filter((n) => n.isRead)

  const notificationTypes = Array.from(new Set(notifications.map((n) => n.type)))

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                알림 센터
              </h1>
              <div className="flex gap-3">
                <Link to="/notifications/settings">
                  <Button variant="outline">알림 설정</Button>
                </Link>
                {unreadNotifications.length > 0 && (
                  <Button onClick={markAllAsRead} className="bg-blue-600 hover:bg-blue-700">
                    모두 읽음 처리
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as NotificationType | "all")}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="campaign_start">공구</TabsTrigger>
                <TabsTrigger value="payment_due">결제</TabsTrigger>
                <TabsTrigger value="bnpl_approved">BNPL</TabsTrigger>
                <TabsTrigger value="new_campaign">신규</TabsTrigger>
                <TabsTrigger value="system_update">시스템</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Notifications List */}
          <div className="space-y-6">
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  읽지 않은 알림 ({unreadNotifications.length})
                </h2>
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} showDelete />
                  ))}
                </div>
              </div>
            )}

            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">읽은 알림 ({readNotifications.length})</h2>
                <div className="space-y-2">
                  {readNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} showDelete />
                  ))}
                </div>
              </div>
            )}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">알림이 없습니다</h3>
                <p className="text-gray-600">새로운 알림이 오면 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
