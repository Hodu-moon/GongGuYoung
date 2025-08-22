

import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"
import { ArrowLeft, Settings } from "lucide-react"
import { Link } from 'react-router-dom'

export default function NotificationSettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/notifications">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                알림 센터로 돌아가기
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              알림 설정
            </h1>
            <p className="text-gray-600 mt-2">알림 수신 방법과 카테고리를 설정하세요.</p>
          </div>

          <div className="max-w-2xl">
            <NotificationPreferences />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
