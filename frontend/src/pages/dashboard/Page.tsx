

import { useState, useMemo } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CampaignCard } from "@/components/dashboard/campaign-card"
import { CampaignFilters } from "@/components/dashboard/campaign-filters"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { mockCampaigns } from "@/lib/mock-data"
import { Link } from 'react-router-dom'
import Image from '@/compat/NextImage'
import { Plus, Users, ShoppingCart, TrendingUp, User, Target, Clock, Star, ArrowRight, Heart, Eye } from "lucide-react"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [filters, setFilters] = useState({
    category: "전체",
    search: "",
    status: "all",
  })

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        campaign.product.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesStatus = filters.status === "all" || campaign.status === filters.status

      return matchesSearch && matchesStatus
    })
  }, [filters])

  const stats = {
    activeCampaigns: mockCampaigns.filter((c) => c.status === "active").length,
    totalParticipants: mockCampaigns.reduce((sum, c) => sum + c.participants, 0),
    completedCampaigns: mockCampaigns.filter((c) => c.status === "completed").length,
    totalFunding: mockCampaigns.reduce((sum, c) => sum + (c.discountPrice * c.participants), 0),
  }

  const trendingCampaigns = mockCampaigns
    .filter((c) => c.status === "active")
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 3)

  const recentCampaigns = mockCampaigns
    .filter((c) => c.status === "active")
    .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime())
    .slice(0, 2)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-hey-gradient">
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Image
                  src="/hey-young-logo.png"
                  alt="Hey Young Smart Campus"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">Hey Young</h1>
                  <p className="text-xs text-white/80">Smart Campus</p>
                </div>
              </div>
              <div className="flex gap-1">
                <NotificationBell />
                <Link to="/my-page">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/create-campaign">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2" onClick={logout}>
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section with CTA */}
          <div className="mb-8">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-purple-800 mb-2">새로운 공동구매를 시작해보세요!</h2>
                    <p className="text-purple-600">더 많은 사람들과 함께 할인 혜택을 누리고, 원하는 상품을 더 저렴하게 구매하세요.</p>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/create-campaign">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        <Plus className="w-5 h-5 mr-2" />
                        공동구매 만들기
                      </Button>
                    </Link>
                    <Link to="/campaigns">
                      <Button variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-3 text-lg font-semibold">
                        전체 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trending & Recent Campaigns */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Trending Campaigns */}
            <div className="lg:col-span-2">
              <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-xl text-purple-800">인기 공동구매</CardTitle>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-600">HOT</Badge>
                    </div>
                    <Link to="/campaigns" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1">
                      모두 보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trendingCampaigns.map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-lg hover:bg-purple-100/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-purple-400' : 'bg-orange-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <img
                        src={campaign.product.imageUrl || "/placeholder.svg"}
                        alt={campaign.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-purple-900 truncate">{campaign.title}</h4>
                        <p className="text-sm text-purple-600 flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4" />
                          {campaign.participants}명 참여
                          <Heart className="h-4 w-4 ml-2" />
                          {Math.floor(Math.random() * 50) + 10}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-700">{campaign.discountPrice.toLocaleString()}원</p>
                        <Badge variant="destructive" className="text-xs bg-pink-500">
                          {Math.round(((campaign.product.originalPrice - campaign.discountPrice) / campaign.product.originalPrice) * 100)}% 할인
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <div>
              <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-xl text-purple-800">최신 공구</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <Link key={campaign.id} to={`/campaigns/${campaign.id}`} className="block">
                      <div className="p-4 border border-purple-200/50 bg-purple-50/30 rounded-lg hover:border-purple-300 hover:bg-purple-100/40 hover:shadow-md transition-all duration-200">
                        <div className="flex gap-3">
                          <img
                            src={campaign.product.imageUrl || "/placeholder.svg"}
                            alt={campaign.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-purple-900 text-sm mb-2 line-clamp-2">{campaign.title}</h4>
                            <div className="text-xs text-purple-600 mb-2 flex items-center gap-2">
                              <Eye className="h-3 w-3" />
                              {Math.floor(Math.random() * 100) + 50}
                              <Users className="h-3 w-3 ml-2" />
                              {campaign.participants}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">NEW</Badge>
                              <p className="text-sm font-bold text-purple-700">{campaign.discountPrice.toLocaleString()}원</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <CampaignFilters onFilterChange={setFilters} />

          {/* Campaign Grid */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                전체 공동구매 
                <Badge variant="secondary" className="ml-2">{filteredCampaigns.length}개</Badge>
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-gray-600">
                  최신순
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600">
                  인기순
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600">
                  마감임박순
                </Button>
              </div>
            </div>

            {filteredCampaigns.length > 0 ? (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">조건에 맞는 공동구매가 없습니다</h3>
                  <p className="text-gray-500 mb-6">새로운 공동구매를 만들어 다른 사용자들과 함께 혜택을 누려보세요!</p>
                  <Link to="/create-campaign">
                    <Button className="bg-hey-gradient hover:opacity-90 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      새 공구 만들기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
