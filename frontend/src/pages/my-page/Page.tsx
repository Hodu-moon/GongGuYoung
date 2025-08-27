

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
import { GroupPurchaseApi, type GroupPurchaseData, type ParticipantData, type MemberGroupPurchaseData } from "@/lib/group-purchase-api"
import { fetchBNPLRemain, fetchBNPLItems, postBnplRepay, type BNPLRemain, type BNPLItem } from "@/api/Payment"
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
  const [memberGroupPurchases, setMemberGroupPurchases] = useState<MemberGroupPurchaseData[]>([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true)
  const [bnplRemain, setBnplRemain] = useState<BNPLRemain | null>(null)
  const [bnplItems, setBnplItems] = useState<BNPLItem[]>([])
  const [isLoadingBnpl, setIsLoadingBnpl] = useState(true)
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

  // Load user's group purchases (새로운 API 사용)
  useEffect(() => {
    const loadUserPurchases = async () => {
      if (!user?.id) return
      
      setIsLoadingPurchases(true)
      try {
        const memberPurchases = await GroupPurchaseApi.getMemberGroupPurchases(user.id.toString())
        
        console.log('Member group purchases:', memberPurchases)
        
        // 데이터 유효성 검증
        const validPurchases = memberPurchases.filter(p => 
          p && 
          p.id && 
          (p.title || p.productName)
        )
        
        setMemberGroupPurchases(validPurchases)
      } catch (error) {
        console.error('Failed to load member group purchases:', error)
      } finally {
        setIsLoadingPurchases(false)
      }
    }

    loadUserPurchases()
  }, [user?.id])

  // Load BNPL data
  useEffect(() => {
    const loadBnplData = async () => {
      if (!user?.id) return
      
      setIsLoadingBnpl(true)
      try {
        const [remain, items] = await Promise.all([
          fetchBNPLRemain(user.id),
          fetchBNPLItems(user.id)
        ])
        
        setBnplRemain(remain)
        setBnplItems(items || [])
      } catch (error) {
        console.error('Failed to load BNPL data:', error)
      } finally {
        setIsLoadingBnpl(false)
      }
    }

    loadBnplData()
  }, [user?.id])

  // Fallback to mock data for campaigns display
  const myCampaigns = user?.fullName 
    ? mockCampaigns.filter((campaign) => campaign.createdBy === user.fullName)
    : []
  const joinedCampaigns = user?.fullName 
    ? mockCampaigns.filter((campaign) => campaign.createdBy !== user.fullName).slice(0, 3)
    : []

  // 실제 참여한 공구 데이터를 주문 내역으로 변환
  const getOrderHistory = () => {
    return memberGroupPurchases.map((purchase) => ({
      id: purchase.id?.toString() || 'unknown',
      campaignTitle: purchase.title || '제목 없음',
      productName: purchase.productName || '상품명 없음',
      quantity: 1, // 일반적으로 공구는 1개씩 참여
      amount: calculateDiscountedPrice(purchase),
      status: (() => {
        const now = Date.now()
        const endTime = new Date(purchase.endAt).getTime()
        if (endTime <= now || purchase.status?.toLowerCase() === "completed") {
          return "completed"
        } else {
          return "processing"
        }
      })(),
      orderDate: new Date(purchase.joinedAt).toLocaleDateString('ko-KR'),
      paymentMethod: purchase.isPaid ? "BNPL" : "미결제",
      originalPrice: purchase.productPrice || 0,
      discountedPrice: calculateDiscountedPrice(purchase)
    }))
  }

  // mockBNPLStatus 제거 - bnplItems로 실제 데이터 사용

  // BNPL 한도 정보 (API 실제 데이터 사용)
  const actualBnplLimit = bnplRemain?.bnplLimit || 0
  const remainAmount = bnplRemain?.remain || 0
  const hasNoLimit = actualBnplLimit === 0
  
  const bnplCreditInfo = {
    totalLimit: hasNoLimit ? 100000 : actualBnplLimit, // API에서 받은 bnplLimit
    usedAmount: hasNoLimit ? 0 : (actualBnplLimit - remainAmount), // 총 한도 - 사용 가능 금액 = 사용 중 금액
    availableAmount: hasNoLimit ? 100000 : remainAmount, // API에서 받은 remain (사용 가능한 금액)
    hasNoLimit, // 한도가 없는 상태인지 여부
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

  const getStatusBadge = (purchase: MemberGroupPurchaseData) => {
    const now = Date.now()
    const endTime = new Date(purchase.endAt).getTime()
    const isEnded = endTime <= now
    
    if (isEnded || purchase.status?.toLowerCase() === "completed") {
      return <Badge className="bg-green-100 text-green-700">완료</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-700">진행중</Badge>
    }
  }

  // targetCount에 따른 할인 가격 계산
  const calculateDiscountedPrice = (purchase: MemberGroupPurchaseData): number => {
    const originalPrice = purchase.productPrice || 0
    const targetCount = purchase.targetCount || 0
    
    // 목표 참여자 수에 따른 할인율 계산
    let discountRate = 0
    if (targetCount >= 1 && targetCount <= 9) {
      discountRate = 0 // 0% 할인
    } else if (targetCount >= 10 && targetCount <= 20) {
      discountRate = 0.03 // 3% 할인
    } else if (targetCount >= 21 && targetCount <= 40) {
      discountRate = 0.05 // 5% 할인
    } else if (targetCount >= 41 && targetCount <= 60) {
      discountRate = 0.08 // 8% 할인
    } else if (targetCount >= 61) {
      discountRate = 0.10 // 10% 할인
    }
    
    return Math.floor(originalPrice * (1 - discountRate))
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
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {isLoadingPurchases ? '-' : memberGroupPurchases.length}
                      </div>
                      <div className="text-xs text-purple-700">참여한 공구</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-lg">
                      <div className="text-lg font-bold text-pink-600">
                        {isLoadingPurchases ? '-' : memberGroupPurchases.filter(p => {
                          const now = Date.now()
                          const endTime = new Date(p.endAt).getTime()
                          return endTime <= now || p.status?.toLowerCase() === "completed"
                        }).length}
                      </div>
                      <div className="text-xs text-pink-700">완료된 공구</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {isLoadingPurchases 
                        ? '-' 
                        : memberGroupPurchases
                            .reduce((sum, p) => {
                              const originalPrice = p.productPrice || 0
                              const discountedPrice = calculateDiscountedPrice(p)
                              const savings = originalPrice - discountedPrice
                              return sum + savings
                            }, 0)
                            .toLocaleString()
                      }원
                    </div>
                    <div className="text-sm text-purple-600">총 절약 금액</div>
                  </div>
                  <Link to="/bnpl">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer">
                      <div className="text-center mb-3">
                        <div className="text-lg font-bold text-purple-600">BNPL 한도</div>
                        <div className="text-xs text-purple-500">클릭하여 자세히 보기</div>
                      </div>
                      {isLoadingBnpl ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                      ) : bnplCreditInfo.hasNoLimit ? (
                        <div className="text-center py-2">
                          <div className="text-lg font-bold text-orange-600 mb-1">
                            한도가 없습니다
                          </div>
                          <div className="text-xs text-orange-700 mb-2">
                            AI 평가로 한도 받기
                          </div>
                          <div className="text-sm font-semibold text-gray-600">
                            10만원 ~ 50만원
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-600">총 한도</span>
                            <span className="font-semibold">{bnplCreditInfo.totalLimit.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-600">사용 중</span>
                            <span className="font-semibold text-red-600">
                              {bnplCreditInfo.usedAmount.toLocaleString()}원
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-purple-600">사용 가능</span>
                            <span className="font-bold text-green-600">
                              {bnplCreditInfo.availableAmount.toLocaleString()}원
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm border border-purple-200">
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
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <User className="w-5 h-5 text-purple-700" />
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
                          <Label htmlFor="name" className="flex items-center gap-2 text-purple-700">
                            <User className="w-4 h-4 text-purple-600" />
                            이름
                          </Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            disabled={!isEditing}
                            className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2 text-purple-700">
                            <Mail className="w-4 h-4 text-purple-600" />
                            이메일
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            disabled={!isEditing}
                            className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2 text-purple-700">
                            <Phone className="w-4 h-4 text-purple-600" />
                            전화번호
                          </Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            disabled={!isEditing}
                            className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studentId" className="flex items-center gap-2 text-purple-700">
                            <School className="w-4 h-4 text-purple-600" />
                            학번
                          </Label>
                          <Input
                            id="studentId"
                            value={profileData.studentId}
                            onChange={(e) => handleInputChange("studentId", e.target.value)}
                            disabled={!isEditing}
                            className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="university" className="flex items-center gap-2 text-purple-700">
                            <School className="w-4 h-4 text-purple-600" />
                            대학교
                          </Label>
                          <Input
                            id="university"
                            value={profileData.university}
                            onChange={(e) => handleInputChange("university", e.target.value)}
                            disabled={!isEditing}
                            className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department" className="flex items-center gap-2 text-purple-700">
                            <School className="w-4 h-4 text-purple-600" />
                            학과
                          </Label>
                          <Input
                            id="department"
                            value={profileData.department}
                            onChange={(e) => handleInputChange("department", e.target.value)}
                            disabled={!isEditing}
                            className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2 text-purple-700">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          주소
                        </Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          disabled={!isEditing}
                          className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="flex items-center gap-2 text-purple-700">
                          <User className="w-4 h-4 text-purple-600" />
                          자기소개
                        </Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          disabled={!isEditing}
                          className="bg-purple-50 border-purple-200 text-purple-800 focus:border-purple-400 focus:ring-purple-200"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Campaigns Tab */}
                <TabsContent value="campaigns" className="space-y-6">
                  {/* Member's Group Purchases */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        참여한 공구 ({isLoadingPurchases ? '-' : memberGroupPurchases.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPurchases ? (
                        <div className="text-center py-8 text-purple-600">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p>로딩 중...</p>
                        </div>
                      ) : memberGroupPurchases.length > 0 ? (
                        <div className="space-y-4">
                          {memberGroupPurchases.map((purchase, index) => (
                            <div
                              key={purchase?.id || `purchase-${index}`}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={purchase?.productImageUrl || "/placeholder.svg"}
                                  alt={purchase?.productName || "상품 이미지"}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                  <h3 className="font-semibold text-purple-800">{purchase?.title || "제목 없음"}</h3>
                                  <p className="text-sm text-purple-600">{purchase?.productName || "상품명 없음"}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(purchase)}
                                    <span className="text-sm text-purple-600">
                                      결제완료
                                    </span>
                                    <span className="text-sm text-purple-600">
                                      {purchase?.currentCount || 0}/{purchase?.targetCount || 0}명 참여
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="space-y-1">
                                  <div className="text-sm text-gray-500 line-through">
                                    정가: {(purchase.productPrice || 0).toLocaleString()}원
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    할인가: {calculateDiscountedPrice(purchase).toLocaleString()}원
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <Link to={`/campaigns/${purchase?.id || '#'}`}>
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
                          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-purple-400" />
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
                      {isLoadingBnpl ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-purple-600">BNPL 정보를 불러오는 중...</p>
                        </div>
                      ) : bnplCreditInfo.hasNoLimit ? (
                        <div className="text-center py-8">
                          <div className="text-2xl font-bold text-orange-600 mb-2">
                            BNPL 한도가 없습니다
                          </div>
                          <div className="text-sm text-orange-700 mb-4">
                            AI 신용평가를 통해 BNPL 한도를 받아보세요
                          </div>
                          <div className="text-lg font-semibold text-gray-600">
                            최소 10만원 ~ 최대 50만원
                          </div>
                          <Link to="/bnpl">
                            <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
                              AI 한도 평가하기
                            </Button>
                          </Link>
                        </div>
                      ) : (
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
                      )}
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
                      {isLoadingPurchases ? (
                        <div className="text-center py-8 text-purple-600">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p>주문 내역을 불러오는 중...</p>
                        </div>
                      ) : getOrderHistory().length > 0 ? (
                        <div className="space-y-4">
                          {getOrderHistory().map((order) => (
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
                                <div className="space-y-1">
                                  {order.originalPrice !== order.discountedPrice && (
                                    <div className="text-sm text-gray-500 line-through">
                                      정가: {order.originalPrice.toLocaleString()}원
                                    </div>
                                  )}
                                  <div className="text-lg font-bold text-purple-700">
                                    {order.amount.toLocaleString()}원
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <Badge className={order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                    {order.status === 'completed' ? '완료' : '진행중'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-purple-600">
                          <CreditCard className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                          <p>주문 내역이 없습니다.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* BNPL Status */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          BNPL 결제 현황
                        </CardTitle>
                        <Link to="/bnpl">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            자세히 보기
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBnpl ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-purple-600">BNPL 결제 현황을 불러오는 중...</p>
                        </div>
                      ) : bnplItems.length > 0 ? (
                        <div className="space-y-4">
                          {bnplItems.map((bnpl) => (
                            <div
                              key={bnpl.paymentId}
                              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={bnpl.itemImageUrl || "/placeholder.svg"}
                                    alt={bnpl.itemName}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <div>
                                    <h3 className="font-semibold text-purple-800">{bnpl.itemName}</h3>
                                    <p className="text-sm text-purple-600">{bnpl.groupPurchaseTitle}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(bnpl.bnplstatus.toLowerCase())}
                                  {bnpl.bnplstatus === "PROCESSING" && (
                                    <Button
                                      size="sm"
                                      className="bg-hey-gradient hover:opacity-90 text-white"
                                      onClick={async () => {
                                        if (!user?.id) return
                                        const success = await postBnplRepay({
                                          paymentId: bnpl.paymentId,
                                          memberId: user.id
                                        })
                                        if (success) {
                                          alert('BNPL 상환이 완료되었습니다.')
                                          // 데이터 새로고침
                                          const [remain, items] = await Promise.all([
                                            fetchBNPLRemain(user.id),
                                            fetchBNPLItems(user.id)
                                          ])
                                          setBnplRemain(remain)
                                          setBnplItems(items || [])
                                        } else {
                                          alert('BNPL 상환에 실패했습니다.')
                                        }
                                      }}
                                    >
                                      {bnpl.bnplAmount.toLocaleString()}원 상환
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-purple-500">상환해야 할 금액</span>
                                  <div className="font-semibold">{bnpl.bnplAmount.toLocaleString()}원</div>
                                </div>
                                <div>
                                  <span className="text-purple-500">결제 상태</span>
                                  <div className="font-semibold">
                                    {bnpl.bnplstatus === "PROCESSING" ? "상환 대기중" : "상환 완료"}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-purple-500">결제 ID</span>
                                  <div className="font-semibold">#{bnpl.paymentId}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-purple-600">
                          <CreditCard className="w-12 h-12 mx-auto mb-4 text-purple-400" />
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
