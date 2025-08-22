"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/lib/notification-context"
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react"

export function NotificationPreferences() {
  const { preferences, updatePreferences } = useNotifications()

  if (!preferences) return null

  const handleToggle = (key: string, value: boolean) => {
    if (key.includes(".")) {
      const [parent, child] = key.split(".")
      updatePreferences({
        [parent]: {
          ...preferences[parent as keyof typeof preferences],
          [child]: value,
        },
      })
    } else {
      updatePreferences({ [key]: value })
    }
  }

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 수신 방법
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <div>
                <Label htmlFor="push">푸시 알림</Label>
                <p className="text-sm text-gray-600">앱 내 실시간 알림</p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => handleToggle("pushNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-green-600" />
              <div>
                <Label htmlFor="email">이메일 알림</Label>
                <p className="text-sm text-gray-600">중요한 알림을 이메일로 수신</p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handleToggle("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              <div>
                <Label htmlFor="sms">SMS 알림</Label>
                <p className="text-sm text-gray-600">긴급 알림을 문자로 수신</p>
              </div>
            </div>
            <Switch
              id="sms"
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => handleToggle("smsNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>알림 카테고리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="campaigns">공동구매 알림</Label>
              <p className="text-sm text-gray-600">새 공구, 마감 임박, 성공/실패 알림</p>
            </div>
            <Switch
              id="campaigns"
              checked={preferences.categories.campaigns}
              onCheckedChange={(checked) => handleToggle("categories.campaigns", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payments">결제 알림</Label>
              <p className="text-sm text-gray-600">결제 완료, 실패, 예정 알림</p>
            </div>
            <Switch
              id="payments"
              checked={preferences.categories.payments}
              onCheckedChange={(checked) => handleToggle("categories.payments", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="bnpl">BNPL 알림</Label>
              <p className="text-sm text-gray-600">분할결제 승인, 납부 예정 알림</p>
            </div>
            <Switch
              id="bnpl"
              checked={preferences.categories.bnpl}
              onCheckedChange={(checked) => handleToggle("categories.bnpl", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="promotions">프로모션 알림</Label>
              <p className="text-sm text-gray-600">할인, 이벤트, 특가 정보</p>
            </div>
            <Switch
              id="promotions"
              checked={preferences.categories.promotions}
              onCheckedChange={(checked) => handleToggle("categories.promotions", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system">시스템 알림</Label>
              <p className="text-sm text-gray-600">업데이트, 점검, 공지사항</p>
            </div>
            <Switch
              id="system"
              checked={preferences.categories.system}
              onCheckedChange={(checked) => handleToggle("categories.system", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-blue-600 hover:bg-blue-700">설정 저장</Button>
    </div>
  )
}
