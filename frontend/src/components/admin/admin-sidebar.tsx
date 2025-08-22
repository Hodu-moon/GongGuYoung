"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAdmin } from "@/lib/admin-context"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CreditCard,
  Bell,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Link } from "react-router-dom";
import { useRouter, usePathname } from "@/compat/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "/admin/dashboard" },
  { icon: Users, label: "사용자 관리", href: "/admin/users" },
  { icon: ShoppingCart, label: "공구 관리", href: "/admin/campaigns" },
  { icon: CreditCard, label: "BNPL 관리", href: "/admin/bnpl" },
  { icon: Bell, label: "알림 관리", href: "/admin/notifications" },
  { icon: BarChart3, label: "분석 리포트", href: "/admin/analytics" },
  { icon: Settings, label: "시스템 설정", href: "/admin/settings" },
]

export function AdminSidebar() {
  const { adminUser, logout, notifications } = useAdmin()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const unreadNotifications = notifications.filter((n) => !n.isRead).length
  const criticalNotifications = notifications.filter((n) => n.priority === "critical" && !n.isRead).length

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h2 className="text-xl font-bold">관리자 패널</h2>}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="text-white">
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {!isCollapsed && adminUser && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="font-medium">{adminUser.fullName}</p>
            <p className="text-sm text-gray-300">{adminUser.role}</p>
          </div>
        )}
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const showBadge = item.href === "/admin/notifications" && unreadNotifications > 0

          return (
            <Link key={item.href} to={item.href}>
              <div
                className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${
                  isActive ? "bg-gray-800 border-r-2 border-blue-500" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1">{item.label}</span>
                    {showBadge && (
                      <Badge variant={criticalNotifications > 0 ? "destructive" : "secondary"} className="ml-2">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full text-white hover:bg-gray-800 justify-start"
          size={isCollapsed ? "sm" : "default"}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">로그아웃</span>}
        </Button>
      </div>
    </div>
  )
}
