

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
import { CreditEvaluationForm } from "@/components/credit/CreditEvaluationForm"
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
  const [showCreditEvaluation, setShowCreditEvaluation] = useState(false)
  const [memberGroupPurchases, setMemberGroupPurchases] = useState<MemberGroupPurchaseData[]>([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true)
  const [bnplRemain, setBnplRemain] = useState<BNPLRemain | null>(null)
  const [bnplItems, setBnplItems] = useState<BNPLItem[]>([])
  const [isLoadingBnpl, setIsLoadingBnpl] = useState(true)
  const [starterBalance, setStarterBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
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

  // Load BNPL data and starter balance
  useEffect(() => {
    const loadBnplData = async () => {
      if (!user?.id) return
      
      setIsLoadingBnpl(true)
      setIsLoadingBalance(true)
      try {
        const [remain, items, balanceResponse] = await Promise.all([
          fetchBNPLRemain(user.id),
          fetchBNPLItems(user.id),
          fetch(`/api/v1/members/${user.id}/starter-balance`)
        ])
        
        setBnplRemain(remain)
        setBnplItems(items || [])
        console.log("BNPL items data:", items)
        
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json()
          setStarterBalance(balanceData.starterBalance || 0)
        }
      } catch (error) {
        console.error('Failed to load BNPL data:', error)
      } finally {
        setIsLoadingBnpl(false)
        setIsLoadingBalance(false)
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

  // BNPL과 그룹 구매 데이터를 매칭하여 주문 내역 생성
  const getOrderHistory = () => {
    console.log("getOrderHistory - bnplItems:", bnplItems)
    console.log("getOrderHistory - memberGroupPurchases:", memberGroupPurchases)
    
    return bnplItems.map((payment) => {
      // BNPL 아이템과 매칭되는 그룹 구매 찾기 (제목으로 매칭)
      const matchedGroupPurchase = memberGroupPurchases.find(gp => 
        gp.title === payment.groupPurchaseTitle || 
        gp.productName === payment.itemName
      )
      
      // 매칭된 그룹 구매에서 원가 가져오기
      const originalPrice = matchedGroupPurchase?.productPrice || payment.bnplAmount
      const discountedPrice = matchedGroupPurchase ? calculateDiscountedPrice(matchedGroupPurchase) : payment.bnplAmount
      
      // 예상 도착일 계산 (공동구매 종료일 + 1일)
      const estimatedDeliveryDate = matchedGroupPurchase ? (() => {
        const endDate = new Date(matchedGroupPurchase.endAt)
        const deliveryDate = new Date(endDate)
        deliveryDate.setDate(deliveryDate.getDate() + 1) // 종료일 + 1일
        return deliveryDate.toLocaleDateString('ko-KR')
      })() : '미정'
      
      // 결제 방식 결정 (BNPL 금액이 있으면 BNPL, 없으면 일시불)
      const paymentMethod = payment.bnplAmount > 0 ? "BNPL" : "일시불"
      
      return {
        id: payment.paymentId.toString(),
        campaignTitle: payment.groupPurchaseTitle,
        productName: payment.itemName,
        quantity: 1,
        amount: discountedPrice, // 할인가 표시 (실제 결제한 금액)
        status: payment.bnplstatus === "COMPLETED" ? "completed" : "processing",
        orderDate: new Date().toLocaleDateString('ko-KR'),
        originalPrice: originalPrice,
        discountedPrice: discountedPrice,
        groupPurchaseId: matchedGroupPurchase?.id, // 상품 페이지로 이동하기 위한 ID
        estimatedDeliveryDate: estimatedDeliveryDate, // 예상 도착일
        productImageUrl: matchedGroupPurchase?.productImageUrl || payment.itemImageUrl || "/placeholder.svg", // 상품 이미지
        paymentMethod: paymentMethod // 결제 방식
      }
    })
  }

  // 주문 내역 기반 통계 계산
  const getOrderStats = () => {
    const orders = getOrderHistory()
    
    const totalOrders = orders.length
    const completedOrders = orders.filter(order => order.status === 'completed').length
    const totalSavings = orders.reduce((sum, order) => {
      const savings = order.originalPrice - order.discountedPrice
      return sum + savings
    }, 0)
    
    return {
      totalOrders,
      completedOrders,
      totalSavings
    }
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

  // BNPL 데이터 새로고침 함수
  const refreshBnplData = async () => {
    if (!user?.id) return
    
    try {
      const [remain, items] = await Promise.all([
        fetchBNPLRemain(user.id),
        fetchBNPLItems(user.id)
      ])
      
      setBnplRemain(remain)
      setBnplItems(items || [])
    } catch (error) {
      console.error('Failed to refresh BNPL data:', error)
    }
  }

  // 총 상환 금액 계산 (실제 상환해야 할 BNPL 항목들의 합계)
  const getTotalRepayAmount = () => {
    return bnplItems
      .filter(item => item.bnplstatus === "PROCESSING" && item.bnplAmount > 0)
      .reduce((sum, item) => sum + item.bnplAmount, 0)
  }


  // 입금 처리 함수
  const handleDeposit = async () => {
    const amount = parseInt(depositAmount)
    if (!amount || amount <= 0) {
      alert('올바른 금액을 입력해주세요.')
      return
    }
    if (!user?.id) {
      alert('로그인이 필요합니다.')
      return
    }

    setIsDepositing(true)
    console.log('Deposit request:', { userId: user.id, amount })
    
    try {
      const url = `/api/v1/members/${user.id}/deposits`
      console.log('Deposit URL:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount
        })
      })

      console.log('Deposit response status:', response.status, response.statusText)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Deposit success:', responseData)
        alert(`${amount.toLocaleString()}원이 성공적으로 입금되었습니다.`)
        setDepositAmount("")
        // 잔액 새로고침
        const balanceResponse = await fetch(`/api/v1/members/${user.id}/starter-balance`)
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json()
          setStarterBalance(balanceData.starterBalance || 0)
        }
      } else {
        const errorData = await response.text()
        console.error('Deposit error response:', errorData)
        throw new Error(`입금 실패: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Deposit error:', error)
      alert('입금 처리 중 오류가 발생했습니다.')
    } finally {
      setIsDepositing(false)
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
                  src="/favicon.png"
                  alt="GongGuYoung Smart Campus"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">GongGuYoung</h1>
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
                        {(isLoadingBnpl || isLoadingPurchases) ? '-' : getOrderStats().totalOrders}
                      </div>
                      <div className="text-xs text-purple-700">참여한 공구</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-lg">
                      <div className="text-lg font-bold text-pink-600">
                        {(isLoadingBnpl || isLoadingPurchases) ? '-' : getOrderStats().completedOrders}
                      </div>
                      <div className="text-xs text-pink-700">완료된 공구</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {(isLoadingBnpl || isLoadingPurchases) 
                        ? '-' 
                        : getOrderStats().totalSavings.toLocaleString()
                      }원
                    </div>
                    <div className="text-sm text-purple-600">총 절약 금액</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="text-center mb-3">
                      <div className="text-lg font-bold text-purple-600">BNPL 한도</div>
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
                    <CreditCard className="w-4 h-4" />
                    BNPL 상환
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    주문 내역
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    한도 관리
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

                {/* BNPL Repayment Tab */}
                <TabsContent value="campaigns" className="space-y-6">
                  {/* Current Balance Card */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        보유 금액
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBalance ? (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                          <p className="text-green-600">보유 금액을 불러오는 중...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-4">
                              {starterBalance.toLocaleString()}원
                            </div>
                            <p className="text-green-700 mb-4">현재 보유하고 있는 금액입니다</p>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                              <p className="text-sm text-green-600">
                                이 금액으로 공동구매 결제 및 BNPL 상환이 가능합니다
                              </p>
                            </div>
                          </div>

                          {/* 입금 섹션 */}
                          <div className="border-t pt-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">💰 계좌 입금</h4>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="depositAmount" className="text-sm font-medium text-gray-700">
                                  입금할 금액 (원)
                                </Label>
                                <div className="mt-2 flex gap-2">
                                  <Input
                                    id="depositAmount"
                                    type="number"
                                    placeholder="입금할 금액을 입력하세요"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    min="1"
                                    className="flex-1"
                                    disabled={isDepositing}
                                  />
                                  <span className="flex items-center text-gray-600">원</span>
                                </div>
                              </div>

                              {/* 빠른 입금 버튼들 */}
                              <div className="grid grid-cols-4 gap-2">
                                {[10000, 50000, 100000, 500000].map((amount) => (
                                  <Button
                                    key={amount}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDepositAmount(amount.toString())}
                                    disabled={isDepositing}
                                    className="text-xs"
                                  >
                                    {amount >= 10000 ? `${amount / 10000}만원` : `${amount.toLocaleString()}원`}
                                  </Button>
                                ))}
                              </div>

                              <Button
                                onClick={handleDeposit}
                                disabled={!depositAmount || isDepositing || parseInt(depositAmount) <= 0}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {isDepositing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    입금 처리 중...
                                  </>
                                ) : (
                                  `${depositAmount ? parseInt(depositAmount).toLocaleString() : '0'}원 입금하기`
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* BNPL Status */}
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          BNPL 결제 현황
                        </div>
                        {getTotalRepayAmount() > 0 && (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">총 상환 금액</div>
                              <div className="text-lg font-bold text-red-600">
                                {getTotalRepayAmount().toLocaleString()}원
                              </div>
                            </div>
                            <Link to="/bnpl-repay">
                              <Button className="bg-hey-gradient hover:opacity-90 text-white">
                                상환하기
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingBnpl ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-purple-600">BNPL 결제 현황을 불러오는 중...</p>
                          </div>
                        ) : bnplItems.filter(bnpl => 
                            bnpl.bnplstatus === "COMPLETED" || 
                            (bnpl.bnplstatus === "PROCESSING" && bnpl.bnplAmount > 0)
                          ).length > 0 ? (
                          <div className="space-y-4">
                            {bnplItems.filter(bnpl => 
                              bnpl.bnplstatus === "COMPLETED" || 
                              (bnpl.bnplstatus === "PROCESSING" && bnpl.bnplAmount > 0)
                            ).map((bnpl) => (
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
                                      <div className="text-sm font-semibold text-red-600">
                                        {bnpl.bnplAmount.toLocaleString()}원
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
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
                                
                                {/* 상환 완료 상태 표시 */}
                                {bnpl.bnplstatus === "COMPLETED" && (
                                  <div className="flex justify-center pt-3 border-t border-purple-200">
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                                      <span className="text-emerald-500 text-lg">✓</span>
                                      <span className="font-medium">상환이 완료되었습니다</span>
                                    </div>
                                  </div>
                                )}
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

                {/* Order History Tab */}
                <TabsContent value="payments" className="space-y-6">
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        주문 내역
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(isLoadingBnpl || isLoadingPurchases) ? (
                        <div className="text-center py-8 text-purple-600">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p>주문 내역을 불러오는 중...</p>
                        </div>
                      ) : getOrderHistory().length > 0 ? (
                        <div className="space-y-6">
                          {getOrderHistory().map((order) => (
                            <div
                              key={order.id}
                              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-purple-100 overflow-hidden"
                            >
                              <div className="p-6">
                                <div className="flex items-start gap-6">
                                  {/* 상품 이미지 */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={order.productImageUrl}
                                      alt={order.productName}
                                      className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200"
                                    />
                                  </div>
                                  
                                  {/* 주문 정보 */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                          {order.campaignTitle}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">{order.productName}</p>
                                        <div className="flex items-center gap-1 mb-2">
                                          <Badge className={order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                                            {order.status === 'completed' ? '✓ 완료' : '🚀 진행중'}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      {/* 가격 정보 */}
                                      <div className="text-right">
                                        {order.originalPrice !== order.discountedPrice && (
                                          <div className="text-sm text-gray-400 line-through mb-1">
                                            ₩{order.originalPrice.toLocaleString()}
                                          </div>
                                        )}
                                        <div className="text-xl font-bold text-purple-600">
                                          ₩{order.amount.toLocaleString()}
                                        </div>
                                        {order.originalPrice !== order.discountedPrice && (
                                          <div className="text-xs text-emerald-600 font-medium">
                                            {Math.round(((order.originalPrice - order.discountedPrice) / order.originalPrice) * 100)}% 할인
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* 주문 상세 정보 */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 px-4 bg-gray-50 rounded-lg mb-4">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-purple-500" />
                                        <div>
                                          <div className="text-xs text-gray-500">주문일</div>
                                          <div className="font-medium text-gray-700">{order.orderDate}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <div>
                                          <div className="text-xs text-gray-500">예상 도착일</div>
                                          <div className="font-medium text-gray-700">{order.estimatedDeliveryDate}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <ShoppingBag className="w-4 h-4 text-green-500" />
                                        <div>
                                          <div className="text-xs text-gray-500">수량</div>
                                          <div className="font-medium text-gray-700">{order.quantity}개</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        <div>
                                          <div className="text-xs text-gray-500">결제방식</div>
                                          <div className="font-medium text-gray-700">{order.paymentMethod}</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* 액션 버튼 */}
                                    {order.groupPurchaseId && (
                                      <div className="flex justify-end">
                                        <Link to={`/campaigns/${order.groupPurchaseId}`}>
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 transition-all duration-200"
                                          >
                                            📱 상세보기
                                          </Button>
                                        </Link>
                                      </div>
                                    )}
                                  </div>
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
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        BNPL 한도 관리
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* BNPL 한도 현황 */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* 한도 사용 현황 */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                              <CreditCard className="w-5 h-5" />
                              BNPL 한도 사용 현황
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {isLoadingBnpl ? (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-blue-600">BNPL 정보를 불러오는 중...</p>
                              </div>
                            ) : (
                              <>
                                {bnplCreditInfo.hasNoLimit ? (
                                  <div className="text-center py-4">
                                    <div className="text-2xl font-bold text-orange-600 mb-2">
                                      한도가 없습니다
                                    </div>
                                    <div className="text-sm text-orange-700 mb-4">
                                      AI 신용평가를 통해 BNPL 한도를 받아보세요
                                    </div>
                                    <div className="text-lg font-semibold text-gray-600">
                                      최소 10만원 ~ 최대 50만원
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-center">
                                      <div className="text-3xl font-bold text-blue-600">
                                        {bnplCreditInfo.availableAmount.toLocaleString()}원
                                      </div>
                                      <div className="text-sm text-blue-700">사용 가능한 잔여 금액</div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div className="text-center p-3 bg-white/50 rounded-lg">
                                        <div className="font-bold text-blue-600">
                                          {bnplCreditInfo.totalLimit.toLocaleString()}원
                                        </div>
                                        <div className="text-blue-700">총 한도</div>
                                      </div>
                                      <div className="text-center p-3 bg-white/50 rounded-lg">
                                        <div className="font-bold text-red-600">
                                          {bnplCreditInfo.usedAmount.toLocaleString()}원
                                        </div>
                                        <div className="text-red-700">사용 중</div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* 한도 증액 신청 */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                              <TrendingUp className="w-5 h-5" />
                              한도 증액 신청
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-700 mb-2">
                                AI 기반 신용평가로
                              </div>
                              <div className="text-2xl font-bold text-green-600">
                                최대 50만원
                              </div>
                              <div className="text-sm text-green-700">한도 증액 가능</div>
                            </div>
                            
                            <div className="space-y-2 text-sm text-green-700">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                1단계: 학점, 출석률, 활동 평가 (최대 30만원)
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                2단계: AI 신용평가로 추가 20만원 증액
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                필수: 학생증 + 재학증명서 (기본 10만원)
                              </div>
                            </div>
                            
                            <Button 
                              onClick={() => setShowCreditEvaluation(!showCreditEvaluation)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {showCreditEvaluation ? '평가 폼 닫기' : 'AI 한도 평가하기'}
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {/* AI 신용평가 폼 */}
                      {showCreditEvaluation && (
                        <Card className="border-0 shadow-lg bg-white">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-800">
                              <TrendingUp className="w-5 h-5" />
                              AI 기반 학생 신용평가
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CreditEvaluationForm onLimitUpdate={refreshBnplData} />
                          </CardContent>
                        </Card>
                      )}
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
