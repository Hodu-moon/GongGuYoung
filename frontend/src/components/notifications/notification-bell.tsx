import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "./notification-item"
import { useNotifications } from "@/lib/notification-context"
import { Bell, Settings } from "lucide-react"
import { Link } from "react-router-dom";

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const recentNotifications = notifications.slice(0, 5)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">알림</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                모두 읽음
              </Button>
            )}
            <Link to="/notifications/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <ScrollArea className="h-96">
          {recentNotifications.length > 0 ? (
            <div className="p-2">
              {recentNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onRead={() => setIsOpen(false)} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>새로운 알림이 없습니다</p>
            </div>
          )}
        </ScrollArea>

        {notifications.length > 5 && (
          <div className="p-3 border-t">
            <Link to={`/notifications`}>
              <Button variant="ghost" className="w-full text-sm">
                모든 알림 보기
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
