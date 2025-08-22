
import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/lib/notification-context"
import { notificationTypeConfig, getRelativeTime, type Notification } from "@/lib/notification-types"
import { X } from "lucide-react"
import { useRouter } from "@/compat/navigation";

interface NotificationItemProps {
  notification: Notification
  onRead?: () => void
  showDelete?: boolean
}

export function NotificationItem({ notification, onRead, showDelete = false }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications()
  const router = useRouter()

  const config = notificationTypeConfig[notification.type]

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
    onRead?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notification.id)
  }

  return (
    <Card
      className={`p-3 mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
        !notification.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${config.color}`}>{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-2">{getRelativeTime(notification.createdAt)}</p>
            </div>
            {showDelete && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="ml-2 h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
      </div>
    </Card>
  )
}
