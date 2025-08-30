"use client"

import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/atoms/typography"
import { Icon } from "@/components/atoms/icon"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface NavigationHeaderProps {
  title?: string
  showNotifications?: boolean
  notificationCount?: number
  onMenuClick?: () => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  className?: string
}

export function NavigationHeader({
  title,
  showNotifications = true,
  notificationCount = 0,
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  className,
}: NavigationHeaderProps) {
  return (
    <header className={`bg-hey-gradient text-white p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/favicon.png" alt="GongGuYoung" width={32} height={32} />
          {title && (
            <Typography variant="h3" className="text-white">
              {title}
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="text-white hover:bg-white/20 relative"
            >
              <Icon icon={Bell} />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-white hover:bg-white/20">
            <Icon icon={Menu} />
          </Button>
        </div>
      </div>
    </header>
  )
}
