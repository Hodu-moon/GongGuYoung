

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { MetricsCards } from "@/components/admin/metrics-cards"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle, TrendingUp } from "lucide-react"

export default function AdminDashboardPage() {
  const { metrics, notifications } = useAdmin()

  const criticalNotifications = notifications.filter((n) => n.priority === "critical" && !n.isRead)
  const actionRequiredNotifications = notifications.filter((n) => n.actionRequired && !n.isRead)

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-700 mt-2">헤이영 스마트캠퍼스 플랫폼 현황을 확인하세요.</p>
          </div>

          {/* Critical Alerts */}
          {criticalNotifications.length > 0 && (
            <div className="mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    긴급 알림 ({criticalNotifications.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {criticalNotifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm">{notification.title}</span>
                        <Button size="sm" variant="outline">
                          확인
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Metrics Cards */}
          <MetricsCards metrics={metrics} />

          {/* Quick Actions & Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            {/* Action Required */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  조치 필요 ({actionRequiredNotifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actionRequiredNotifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-700">{notification.message}</p>
                      </div>
                      <Badge
                        variant={
                          notification.priority === "critical"
                            ? "destructive"
                            : notification.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                  ))}
                  {actionRequiredNotifications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>모든 작업이 완료되었습니다!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">새로운 공구 등록</p>
                      <p className="text-xs text-gray-700">iPad Air 공동구매 - 5분 전</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">BNPL 신청 승인</p>
                      <p className="text-xs text-gray-700">김학생 - 10분 전</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">새 사용자 가입</p>
                      <p className="text-xs text-gray-700">연세대학교 - 15분 전</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">공구 목표 달성</p>
                      <p className="text-xs text-gray-700">생화학 교재 - 30분 전</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>시스템 상태</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
                    <p className="text-sm font-medium">API 서버</p>
                    <p className="text-xs text-gray-700">정상</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
                    <p className="text-sm font-medium">데이터베이스</p>
                    <p className="text-xs text-gray-700">정상</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2" />
                    <p className="text-sm font-medium">결제 시스템</p>
                    <p className="text-xs text-gray-700">지연</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
                    <p className="text-sm font-medium">알림 서비스</p>
                    <p className="text-xs text-gray-700">정상</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
