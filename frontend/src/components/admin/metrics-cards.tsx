import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PlatformMetrics } from "@/lib/admin-data"
import { Users, ShoppingCart, CreditCard, TrendingUp } from "lucide-react"

interface MetricsCardsProps {
  metrics: PlatformMetrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => `${(amount / 1000000).toFixed(1)}M원`
  const formatNumber = (num: number) => num.toLocaleString()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* User Metrics */}
      <Card className="animate-fade-in-up hover-lift" style={{ animationDelay: "0.1s" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
          <Users className="h-4 w-4 text-blue-600 transition-transform duration-300 hover:scale-110" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-pulse-slow">{formatNumber(metrics.userStats.totalUsers)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              인증: {formatNumber(metrics.userStats.verifiedUsers)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              활성: {formatNumber(metrics.userStats.activeUsers)}
            </Badge>
          </div>
          <div className="flex items-center mt-2 text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            이번 달 +{formatNumber(metrics.userStats.newUsersThisMonth)}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Metrics */}
      <Card className="animate-fade-in-up hover-lift" style={{ animationDelay: "0.2s" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">공동구매</CardTitle>
          <ShoppingCart className="h-4 w-4 text-green-600 transition-transform duration-300 hover:scale-110" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.campaignStats.totalCampaigns)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs">
              진행중: {formatNumber(metrics.campaignStats.activeCampaigns)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              완료: {formatNumber(metrics.campaignStats.completedCampaigns)}
            </Badge>
          </div>
          <div className="text-xs text-orange-600 mt-2">
            승인 대기: {formatNumber(metrics.campaignStats.pendingApproval)}건
          </div>
        </CardContent>
      </Card>

      {/* BNPL Metrics */}
      <Card className="animate-fade-in-up hover-lift" style={{ animationDelay: "0.3s" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BNPL</CardTitle>
          <CreditCard className="h-4 w-4 text-purple-600 transition-transform duration-300 hover:scale-110" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.bnplStats.totalApplications)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs">
              승인: {formatNumber(metrics.bnplStats.approvedApplications)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              활성: {formatNumber(metrics.bnplStats.activeLoans)}
            </Badge>
          </div>
          <div className="text-xs text-red-600 mt-2">연체: {formatNumber(metrics.bnplStats.overduePayments)}건</div>
        </CardContent>
      </Card>

      {/* Revenue Metrics */}
      <Card className="animate-fade-in-up hover-lift" style={{ animationDelay: "0.4s" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 거래액</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 transition-transform duration-300 hover:scale-110" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.campaignStats.totalRevenue)}</div>
          <div className="text-sm text-gray-600 mt-1">BNPL: {formatCurrency(metrics.bnplStats.totalLoanAmount)}</div>
          <div className="flex items-center mt-2 text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            전월 대비 +{metrics.revenueGrowth}%
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
