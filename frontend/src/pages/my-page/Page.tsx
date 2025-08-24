

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockCampaigns } from "@/lib/mock-data"
import { GroupPurchaseApi, type GroupPurchaseData, type ParticipantData } from "@/lib/group-purchase-api"
import {
  User,
  ShoppingBag,
  CreditCard,
  Settings,
  Edit,
  Save,
  Camera,
  School,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Clock,
  Bell,
  QrCode,
  Plus,
  LogOut,
} from "lucide-react"
import { Link } from 'react-router-dom'
import Image from '@/compat/NextImage'

export default function MyPage() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userParticipatedPurchases, setUserParticipatedPurchases] = useState<ParticipantData[]>([])
  const [userCreatedPurchases, setUserCreatedPurchases] = useState<GroupPurchaseData[]>([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true)
  const [profileData, setProfileData] = useState({
    name: user?.fullName || "",
    email: user?.email || "heyoung@university.ac.kr",
    phone: "010-1234-5678",
    university: "한국대학교",
    department: "MSA학과",
    studentId: "202412345",
    bio: "안녕하세요! 공동구매를 통해 합리적인 소비를 추구하는 대학생입니다.",
    address: "서울시 강남구 테헤란로 123",
  })

  // Load user's group purchases
  useEffect(() => {
    const loadUserPurchases = async () => {
      if (!user?.id) return
      
      setIsLoadingPurchases(true)
      try {
        const [participated, created] = await Promise.all([
          GroupPurchaseApi.getUserParticipatedGroupPurchases(user.id.toString()),
          GroupPurchaseApi.getUserCreatedGroupPurchases(user.id.toString())
        ])
        
        console.log('Participated purchases:', participated)
        console.log('Created purchases:', created)
        
        setUserParticipatedPurchases(participated)
        setUserCreatedPurchases(created)
      } catch (error) {
        console.error('Failed to load user purchases:', error)
      } finally {
        setIsLoadingPurchases(false)
      }
    }

    loadUserPurchases()
  }, [user?.id])

  // Fallback to mock data for campaigns display
  const myCampaigns = user?.fullName 
    ? mockCampaigns.filter((campaign) => campaign.createdBy === user.fullName)
    : []
  const joinedCampaigns = user?.fullName 
    ? mockCampaigns.filter((campaign) => campaign.createdBy !== user.fullName).slice(0, 3)
    : []

  const mockOrders = [
    {
      id: "1",
      campaignTitle: "생화학 교재 공동구매",
      productName: "Campbell Biology 11th Edition",
      quantity: 1,
      amount: 75000,
      status: "completed",
      orderDate: "2024-01-15",
      paymentMethod: "BNPL 3개월",
    },
    {
      id: "2",
      campaignTitle: "간호학과 실습복 공구",
      productName: "간호학과 실습복 세트",
      quantity: 2,
      amount: 120000,
      status: "processing",
      orderDate: "2024-01-20",
      paymentMethod: "일시불",
    },
  ]

  const mockBNPLStatus = [
    {
      id: "1",
      productName: "Campbell Biology 11th Edition",
      totalAmount: 75000,
      monthlyPayment: 25000,
      remainingPayments: 2,
      nextPaymentDate: "2024-02-15",
      status: "active",
    },
  ]

  const bnplCreditInfo = {
    totalLimit: 500000, // 총 BNPL 한도
    usedAmount: 75000, // 사용 중인 금액
    availableAmount: 425000, // 사용 가능한 잔여 금액
  }

  const handleSaveProfile = () => {
    setIsSaving(true)
    // Mock API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      alert("프로필이 성공적으로 업데이트되었습니다!")
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">완료</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700">진행중</Badge>
      case "active":
        return <Badge className="bg-purple-100 text-purple-700">결제중</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-hey-gradient">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
              </Link>
              <div className="flex gap-1">
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
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
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2" onClick={() => logout()}>
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-white">마이 페이지</h1>
            <p className="text-white/90 text-lg">내 정보와 공구 활동을 관리하세요</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm sticky top-8">
                <CardHeader className="text-center pb-4">
                  <div className="relative mx-auto mb-4">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                      <AvatarImage src="/placeholder.svg" alt={profileData.name} />
                      <AvatarFallback className="bg-hey-gradient text-white text-2xl font-bold">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-bold text-purple-800">{profileData.name}</h2>
                  <p className="text-sm text-purple-600">{profileData.university}</p>
                  <p className="text-sm text-purple-600">{profileData.department}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {isLoadingPurchases ? '-' : userCreatedPurchases.length}
                      </div>
                      <div className="text-xs text-blue-700">개설한 공구</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {isLoadingPurchases ? '-' : userParticipatedPurchases.length}
                      </div>
                      <div className="text-xs text-green-700">참여한 공구</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {isLoadingPurchases 
                        ? '-' 
                        : userParticipatedPurchases
                            .filter(p => p.isPaid && p.groupPurchase?.productPrice)
                            .reduce((sum, p) => {
                              const price = p.groupPurchase?.productPrice || 0
                              return sum + (price * 0.1) // 10% 할인 가정
                            }, 0)
                            .toLocaleString()
                      }원
                    </div>
                    <div className="text-sm text-purple-600">총 절약 금액</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="text-center mb-3">
                      <div className="text-lg font-bold text-purple-600">BNPL 한도</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 한도</span>
                        <span className="font-semibold">{bnplCreditInfo.totalLimit.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">사용 중</span>
                        <span className="font-semibold text-red-600">
                          {bnplCreditInfo.usedAmount.toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">사용 가능</span>
                        <span className="font-bold text-green-600">
                          {bnplCreditInfo.availableAmount.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-white/95 backdrop-blur-sm">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    프로필
                  </TabsTrigger>
                  <TabsTrigger value="campaigns" className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    공구 내역
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    결제 내역
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    설정
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        개인 정보
                      </CardTitle>
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          수정
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            취소
                          </Button>
                          <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-hey-gradient">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "저장 중..." : "저장"}
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            이름
                          </Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            이메일
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            전화번호
                          </Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studentId" className="flex items-center gap-2">
                            <School className="w-4 h-4" />
                            학번
                          </Label>
                          <Input
                            id="studentId"
                            value={profileData.studentId}
                            onChange={(e) => handleInputChange("studentId", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="university" className="flex items-center gap-2">
                            <School className="w-4 h-4" />
                            대학교
                          </Label>
                          <Input
                            id="university"
                            value={profileData.university}
                            onChange={(e) => handleInputChange("university", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department" className="flex items-center gap-2">
                            <School className="w-4 h-4" />
                            학과
                          </Label>
                          <Input
                            id="department"
                            value={profileData.department}
                            onChange={(e) => handleInputChange("department", e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          주소
                        </Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          자기소개
                        </Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Campaigns Tab */}
                <TabsContent value="campaigns" className="space-y-6">
                  {/* My Created Campaigns */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        내가 개설한 공구 ({isLoadingPurchases ? '-' : userCreatedPurchases.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPurchases ? (
                        <div className="text-center py-8 text-purple-600">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p>로딩 중...</p>
                        </div>
                      ) : userCreatedPurchases.length > 0 ? (
                        <div className="space-y-4">
                          {userCreatedPurchases.map((purchase) => (
                            <div
                              key={purchase.id}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={purchase.productImageUrl || "/placeholder.svg"}
                                  alt={purchase.productName}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                  <h3 className="font-semibold text-purple-800">{purchase.title}</h3>
                                  <p className="text-sm text-purple-600">{purchase.productName}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(purchase.status.toLowerCase())}
                                    <span className="text-sm text-purple-600">
                                      {purchase.currentCount}/{purchase.targetCount}명 참여
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-purple-600">
                                  {(purchase.productPrice || 0).toLocaleString()}원
                                </div>
                                <Link to={`/campaigns/${purchase.id}`}>
                                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                                    상세보기
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-purple-600">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>아직 개설한 공구가 없습니다.</p>
                          <Link to="/create-campaign">
                            <Button className="mt-4 bg-hey-gradient">첫 공구 만들기</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Participated Campaigns */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        참여한 공구 ({isLoadingPurchases ? '-' : userParticipatedPurchases.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPurchases ? (
                        <div className="text-center py-8 text-purple-600">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p>로딩 중...</p>
                        </div>
                      ) : userParticipatedPurchases.length > 0 ? (
                        <div className="space-y-4">
                          {userParticipatedPurchases.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={participant.groupPurchase.productImageUrl || "/placeholder.svg"}
                                  alt={participant.groupPurchase.productName}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                  <h3 className="font-semibold text-purple-800">{participant.groupPurchase.title}</h3>
                                  <p className="text-sm text-purple-600">{participant.groupPurchase.productName}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(participant.groupPurchase.status.toLowerCase())}
                                    <span className="text-sm text-purple-600">
                                      {participant.isPaid ? '결제완료' : '미결제'}
                                    </span>
                                    <span className="text-sm text-purple-600">
                                      {participant.groupPurchase.currentCount}/{participant.groupPurchase.targetCount}명 참여
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {(participant.groupPurchase?.productPrice || 0).toLocaleString()}원
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {!participant.isPaid && (
                                    <Button size="sm" className="bg-hey-gradient text-white">
                                      결제하기
                                    </Button>
                                  )}
                                  <Link to={`/campaigns/${participant.groupPurchase.id}`}>
                                    <Button variant="outline" size="sm" className="bg-transparent">
                                      상세보기
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-purple-600">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>아직 참여한 공구가 없습니다.</p>
                          <Link to="/dashboard">
                            <Button className="mt-4 bg-hey-gradient">공구 둘러보기</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="space-y-6">
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        BNPL 한도 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {bnplCreditInfo.totalLimit.toLocaleString()}원
                          </div>
                          <div className="text-sm text-blue-700">총 BNPL 한도</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {bnplCreditInfo.usedAmount.toLocaleString()}원
                          </div>
                          <div className="text-sm text-red-700">상환해야 할 금액</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {bnplCreditInfo.availableAmount.toLocaleString()}원
                          </div>
                          <div className="text-sm text-green-700">사용 가능한 잔여 금액</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order History */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        주문 내역
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 bg-purple-50/50 rounded-lg hover:bg-purple-100/50 transition-colors"
                          >
                            <div>
                              <h3 className="font-semibold text-purple-800">{order.campaignTitle}</h3>
                              <p className="text-sm text-purple-600">{order.productName}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-purple-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {order.orderDate}
                                </span>
                                <span>수량: {order.quantity}개</span>
                                <span>{order.paymentMethod}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-700">{order.amount.toLocaleString()}원</div>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* BNPL Status */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        BNPL 결제 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockBNPLStatus.length > 0 ? (
                        <div className="space-y-4">
                          {mockBNPLStatus.map((bnpl) => (
                            <div
                              key={bnpl.id}
                              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-purple-800">{bnpl.productName}</h3>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(bnpl.status)}
                                  {bnpl.status === "active" && (
                                    <Button
                                      size="sm"
                                      className="bg-hey-gradient hover:opacity-90 text-white"
                                      onClick={() => {
                                        alert(`${bnpl.monthlyPayment.toLocaleString()}원 결제 페이지로 이동합니다.`)
                                      }}
                                    >
                                      {bnpl.monthlyPayment.toLocaleString()}원 결제
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">총 금액</span>
                                  <div className="font-semibold">{bnpl.totalAmount.toLocaleString()}원</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">월 납부액</span>
                                  <div className="font-semibold">{bnpl.monthlyPayment.toLocaleString()}원</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">남은 횟수</span>
                                  <div className="font-semibold">{bnpl.remainingPayments}회</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">다음 결제일</span>
                                  <div className="font-semibold">{bnpl.nextPaymentDate}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-purple-600">
                          <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>진행 중인 BNPL 결제가 없습니다.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        계정 설정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">알림 설정</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg">
                            <div>
                              <div className="font-medium">새로운 공구 알림</div>
                              <div className="text-sm text-purple-600">관심 카테고리의 새 공구가 등록될 때 알림</div>
                            </div>
                            <Button variant="outline" size="sm">
                              설정
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg">
                            <div>
                              <div className="font-medium">결제 알림</div>
                              <div className="text-sm text-purple-600">BNPL 결제일 및 공구 마감 알림</div>
                            </div>
                            <Button variant="outline" size="sm">
                              설정
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">보안 설정</h3>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            비밀번호 변경
                          </Button>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            2단계 인증 설정
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">기타</h3>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            개인정보 처리방침
                          </Button>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            서비스 이용약관
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                          >
                            회원 탈퇴
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
