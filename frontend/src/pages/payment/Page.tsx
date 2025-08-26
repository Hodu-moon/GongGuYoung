import React, { useState, useEffect } from "react"
import { useRouter } from '@/compat/navigation'
import { useSearchParams } from 'react-router-dom'
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Check, Loader2, CreditCard, Wallet, Shield, Eye, EyeOff } from "lucide-react"
import { Link } from 'react-router-dom'
import { useAuth } from "@/lib/auth-context"
import { NotificationBell } from "@/components/notifications/notification-bell"
import Image from "@/compat/NextImage"

interface PaymentInfo {
  campaignId: string
  productName: string
  quantity: number
  originalPrice: number
  discountPrice: number
  finalPrice: number
  discountRate: number
}

export default function PaymentPage() {
  const router = useRouter()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'bnpl' | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // 랜덤 키패드를 위한 숫자 배열
  const [randomNumbers, setRandomNumbers] = useState<number[]>([])
  
  // URL 파라미터에서 결제 정보 가져오기
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  
  // BNPL 잔액 및 분할 결제 관련
  const [bnplBalance, setBnplBalance] = useState(100000) // 예시: 10만원 잔액
  const [needsSplitPayment, setNeedsSplitPayment] = useState(false)
  const [bnplAmount, setBnplAmount] = useState(0)
  const [cashAmount, setCashAmount] = useState(0)
  const [selectedBnplAmount, setSelectedBnplAmount] = useState(0) // 사용자가 선택한 BNPL 금액
  const [showBnplAmountSelector, setShowBnplAmountSelector] = useState(false)

  const steps = [
    { number: 1, title: "결제 방법", icon: CreditCard, description: "결제 수단을 선택하세요" },
    { number: 2, title: "비밀번호", icon: Shield, description: "결제 비밀번호를 입력하세요" },
    { number: 3, title: "완료", icon: Check, description: "결제가 완료되었습니다" },
  ]

  // 컴포넌트 마운트 시 결제 정보 설정 및 키패드 초기화
  useEffect(() => {
    // URL 파라미터에서 결제 정보 파싱
    const campaignId = searchParams.get('campaignId')
    const productName = searchParams.get('productName')
    const quantity = parseInt(searchParams.get('quantity') || '1')
    const originalPrice = parseInt(searchParams.get('originalPrice') || '0')
    const discountPrice = parseInt(searchParams.get('discountPrice') || '0')
    const finalPrice = parseInt(searchParams.get('finalPrice') || '0')
    const discountRate = parseInt(searchParams.get('discountRate') || '0')

    if (campaignId && productName) {
      setPaymentInfo({
        campaignId,
        productName,
        quantity,
        originalPrice,
        discountPrice,
        finalPrice,
        discountRate
      })
    }

    // 키패드 숫자 랜덤 배치
    shuffleNumbers()
    
    // BNPL 관련 초기값 설정
    if (finalPrice) {
      const maxBnplUsage = Math.min(bnplBalance, finalPrice)
      setSelectedBnplAmount(maxBnplUsage) // 기본값은 최대 사용 가능 금액
      
      if (bnplBalance < finalPrice) {
        setNeedsSplitPayment(true)
        setBnplAmount(bnplBalance)
        setCashAmount(finalPrice - bnplBalance)
      } else {
        setNeedsSplitPayment(false)
        setBnplAmount(maxBnplUsage)
        setCashAmount(0)
      }
    }
  }, [searchParams, bnplBalance])

  const shuffleNumbers = () => {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }
    setRandomNumbers(numbers)
  }

  const handlePaymentMethodSelect = (method: 'full' | 'bnpl') => {
    setPaymentMethod(method)
    
    if (method === 'bnpl') {
      setShowBnplAmountSelector(true)
    } else {
      setCurrentStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // 다음 단계로 넘어갈 때 키패드 재배치
      shuffleNumbers()
    }
  }

  const handleBnplAmountSelect = () => {
    // 유효성 검사
    if (selectedBnplAmount <= 0) {
      alert("BNPL 사용 금액을 선택해주세요.")
      return
    }
    
    if (selectedBnplAmount > bnplBalance) {
      alert(`BNPL 잔액이 부족합니다. (잔액: ${bnplBalance.toLocaleString()}원)`)
      return
    }
    
    if (selectedBnplAmount > (paymentInfo?.finalPrice || 0)) {
      alert("결제 금액보다 많은 BNPL를 사용할 수 없습니다.")
      return
    }
    
    // 선택한 BNPL 금액으로 분할 결제 계산
    const remaining = paymentInfo!.finalPrice - selectedBnplAmount
    setBnplAmount(selectedBnplAmount)
    setCashAmount(remaining)
    setNeedsSplitPayment(remaining > 0)
    
    setShowBnplAmountSelector(false)
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    shuffleNumbers()
  }

  const handleBnplAmountChange = (amount: number) => {
    const maxUsage = Math.min(bnplBalance, paymentInfo?.finalPrice || 0)
    const validAmount = Math.max(0, Math.min(amount, maxUsage))
    setSelectedBnplAmount(validAmount)
  }

  const handleNumberClick = (num: number) => {
    if (password.length < 6) {
      setPassword(prev => prev + num.toString())
    }
  }

  const handlePasswordDelete = () => {
    setPassword(prev => prev.slice(0, -1))
  }

  const handlePasswordClear = () => {
    setPassword("")
  }

  const handlePayment = async () => {
    if (password.length !== 6) {
      alert("6자리 비밀번호를 입력해주세요.")
      return
    }

    setIsProcessing(true)
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // 결제 처리 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false)
      // 결제 완료 후 성공 페이지로 이동 (실제 결제 정보 전달)
      const successParams = new URLSearchParams({
        orderId: `ORDER-${Date.now()}`,
        method: paymentMethod || 'full',
        amount: paymentInfo?.finalPrice.toString() || '0',
        campaignId: paymentInfo?.campaignId || '1',
        productName: paymentInfo?.productName || '',
        quantity: paymentInfo?.quantity.toString() || '1',
        // 분할 결제 정보 추가
        ...(paymentMethod === 'bnpl' && {
          splitPayment: needsSplitPayment ? 'true' : 'false',
          bnplAmount: bnplAmount.toString(),
          cashAmount: cashAmount.toString(),
          selectedBnplAmount: selectedBnplAmount.toString()
        })
      });
      router.push(`/payment/success?${successParams.toString()}`)
    }, 2000)
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      if (currentStep === 2) {
        setPaymentMethod(null)
        setPassword("")
      }
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!paymentInfo) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">잘못된 접근입니다</h1>
            <p className="text-gray-500 mb-4">결제 정보를 찾을 수 없습니다.</p>
            <Link to="/dashboard">
              <Button>대시보드로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-hey-gradient">
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
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
                <NotificationBell />
                <Link to="/my-page">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={`/campaigns/${paymentInfo.campaignId}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={logout}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 pb-24">
          {/* Page Title */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">결제하기</h1>
              </div>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                안전하고 간편한 결제로 공동구매에 참여하세요.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-white to-white/80 -translate-y-1/2 z-0 transition-all duration-500"
                     style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
                
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.number
                  const isCompleted = currentStep > step.number
                  
                  return (
                    <div key={step.number} className="flex flex-col items-center z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-white text-purple-600 shadow-lg' 
                          : isActive 
                            ? 'bg-white/90 backdrop-blur-sm border-2 border-white text-purple-600 shadow-lg' 
                            : 'bg-white/50 backdrop-blur-sm border-2 border-white/30 text-white/60'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-white/60'}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-white/60 max-w-20 mt-1">{step.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Payment Info Summary */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">결제 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품:</span>
                    <span className="font-medium">{paymentInfo.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수량:</span>
                    <span className="font-medium">{paymentInfo.quantity}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">할인율:</span>
                    <span className="font-medium text-red-600">{paymentInfo.discountRate}%</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">총 결제 금액:</span>
                      <span className="font-bold text-purple-600 text-lg">{paymentInfo.finalPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Card */}
          <div className="max-w-2xl mx-auto shadow-xl border-0 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  {React.createElement(steps[currentStep - 1].icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {steps[currentStep - 1].title}
                  </CardTitle>
                  <p className="text-white/90 mt-1">{steps[currentStep - 1].description}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-8 pt-5 pb-8">
              {/* BNPL 금액 선택 모달 */}
              {showBnplAmountSelector && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">BNPL 사용 금액 선택</h3>
                    <p className="text-gray-600">얼마나 BNPL로 결제하시겠어요?</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {selectedBnplAmount.toLocaleString()}원
                      </div>
                      <div className="text-sm text-gray-600">
                        BNPL로 결제할 금액
                      </div>
                    </div>

                    {/* 슬라이더 */}
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max={Math.min(bnplBalance, paymentInfo?.finalPrice || 0)}
                        step="1"
                        value={selectedBnplAmount}
                        onChange={(e) => handleBnplAmountChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(selectedBnplAmount / Math.min(bnplBalance, paymentInfo?.finalPrice || 0)) * 100}%, #E5E7EB ${(selectedBnplAmount / Math.min(bnplBalance, paymentInfo?.finalPrice || 0)) * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0원</span>
                        <span>{Math.min(bnplBalance, paymentInfo?.finalPrice || 0).toLocaleString()}원</span>
                      </div>
                    </div>

                    {/* 빠른 선택 버튼들 */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[25, 50, 75, 100].map((percent) => {
                        const amount = Math.floor((Math.min(bnplBalance, paymentInfo?.finalPrice || 0) * percent) / 100)
                        return (
                          <Button
                            key={percent}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleBnplAmountChange(amount)}
                            className="text-xs py-2"
                          >
                            {percent}%
                          </Button>
                        )
                      })}
                    </div>

                    {/* 직접 입력 */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        직접 입력 (원 단위)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={Math.min(bnplBalance, paymentInfo?.finalPrice || 0)}
                          value={selectedBnplAmount || ''}
                          onChange={(e) => handleBnplAmountChange(parseInt(e.target.value || '0'))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="금액을 입력하세요"
                        />
                        <span className="text-gray-600">원</span>
                      </div>
                    </div>
                  </div>

                  {/* 결제 분할 미리보기 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">BNPL 계좌</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {selectedBnplAmount.toLocaleString()}원
                      </div>
                      <div className="text-xs text-gray-500">
                        잔액: {bnplBalance.toLocaleString()}원
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">일반 계좌</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {((paymentInfo?.finalPrice || 0) - selectedBnplAmount).toLocaleString()}원
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedBnplAmount === (paymentInfo?.finalPrice || 0) ? "사용하지 않음" : "부족분 결제"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowBnplAmountSelector(false)
                        setPaymentMethod(null)
                      }}
                      className="flex-1"
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      onClick={handleBnplAmountSelect}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      선택 완료
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 1: 결제 방법 선택 */}
              {currentStep === 1 && !showBnplAmountSelector && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {/* 일반 결제 */}
                    <div 
                      onClick={() => handlePaymentMethodSelect('full')}
                      className={`cursor-pointer p-4 border-2 rounded-xl transition-all hover:shadow-md ${
                        paymentMethod === 'full' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">일반 계좌 결제</h4>
                            <p className="text-sm text-gray-600">일반 계좌에서 결제</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            {paymentInfo.finalPrice.toLocaleString()}원
                          </div>
                          <div className="text-sm text-gray-500">즉시 결제</div>
                        </div>
                      </div>
                    </div>

                    {/* BNPL 결제 */}
                    <div 
                      onClick={() => handlePaymentMethodSelect('bnpl')}
                      className={`cursor-pointer p-4 border-2 rounded-xl transition-all hover:shadow-md ${
                        paymentMethod === 'bnpl' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              BNPL 계좌 결제
                              {paymentMethod === 'bnpl' && <span className="text-blue-600 ml-2">(선택완료)</span>}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {paymentMethod === 'bnpl' 
                                ? `BNPL ${bnplAmount.toLocaleString()}원${needsSplitPayment ? ` + 일반계좌 ${cashAmount.toLocaleString()}원` : ''}`
                                : `BNPL 한도: ${bnplBalance.toLocaleString()}원 사용 가능`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {paymentInfo.finalPrice.toLocaleString()}원
                          </div>
                          <div className="text-sm text-gray-500">
                            {needsSplitPayment ? "분할 결제" : "BNPL 계좌"}
                          </div>
                        </div>
                      </div>
                      
                      {/* BNPL 잔액 부족 안내 */}
                      {needsSplitPayment && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 text-orange-800 text-sm">
                            <div className="w-4 h-4 bg-orange-200 rounded-full flex items-center justify-center">
                              <span className="text-xs">!</span>
                            </div>
                            <span className="font-medium">BNPL 잔액 부족</span>
                          </div>
                          <div className="text-xs text-orange-700 mt-1 ml-6">
                            BNPL 잔액: {bnplBalance.toLocaleString()}원 | 부족분: {cashAmount.toLocaleString()}원
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: 비밀번호 입력 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      결제 비밀번호를 입력하세요
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {paymentMethod === 'full' 
                        ? '일반 계좌' 
                        : needsSplitPayment 
                          ? `BNPL ${bnplAmount.toLocaleString()}원 + 일반계좌 ${cashAmount.toLocaleString()}원 분할`
                          : `BNPL 계좌 ${bnplAmount.toLocaleString()}원`
                      } 결제 비밀번호 6자리를 입력해주세요
                    </p>
                  </div>
                  
                  {/* 분할 결제 정보 표시 */}
                  {paymentMethod === 'bnpl' && needsSplitPayment && (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200 mb-6">
                      <div className="text-center mb-4">
                        <h4 className="font-bold text-orange-800 mb-2">🔄 분할 결제</h4>
                        <p className="text-sm text-orange-700">BNPL 잔액이 부족하여 자동으로 분할 결제됩니다</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">BNPL 계좌</span>
                          </div>
                          <div className="text-lg font-bold text-blue-600">{bnplAmount.toLocaleString()}원</div>
                          <div className="text-xs text-gray-500">잔액 전액 사용</div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">일반 계좌</span>
                          </div>
                          <div className="text-lg font-bold text-green-600">{cashAmount.toLocaleString()}원</div>
                          <div className="text-xs text-gray-500">부족분 결제</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <div className="text-sm text-orange-700">
                          총 결제 금액: <span className="font-bold">{paymentInfo?.finalPrice.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 비밀번호 표시 */}
                  <div className="flex justify-center mb-6">
                    <div className="flex gap-2">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center ${
                            password.length > i ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
                          }`}
                        >
                          {password.length > i && (
                            showPassword ? password[i] : '●'
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 비밀번호 보기/숨기기 */}
                  <div className="flex justify-center mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center gap-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    </Button>
                  </div>

                  {/* 랜덤 키패드 */}
                  <div className="max-w-xs mx-auto">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {randomNumbers.filter(num => num !== 0).map((num) => (
                        <Button
                          key={num}
                          variant="outline"
                          className="h-14 text-lg font-semibold hover:bg-purple-50 hover:border-purple-300"
                          onClick={() => handleNumberClick(num)}
                          disabled={password.length >= 6}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                    
                    {/* 마지막 줄: 지우기, 0, 전체 지우기 */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-14 text-sm hover:bg-red-50 hover:border-red-300"
                        onClick={handlePasswordDelete}
                        disabled={password.length === 0}
                      >
                        ←
                      </Button>
                      <Button
                        variant="outline"
                        className="h-14 text-lg font-semibold hover:bg-purple-50 hover:border-purple-300"
                        onClick={() => handleNumberClick(0)}
                        disabled={password.length >= 6}
                      >
                        0
                      </Button>
                      <Button
                        variant="outline"
                        className="h-14 text-sm hover:bg-red-50 hover:border-red-300"
                        onClick={handlePasswordClear}
                        disabled={password.length === 0}
                      >
                        전체삭제
                      </Button>
                    </div>
                  </div>

                  {/* 결제 버튼 */}
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                    size="lg"
                    onClick={handlePayment}
                    disabled={password.length !== 6}
                  >
                    {paymentInfo.finalPrice.toLocaleString()}원 결제하기
                  </Button>

                  {/* 키패드 재배치 버튼 */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shuffleNumbers}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      🔄 키패드 재배치
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: 결제 처리 중 */}
              {currentStep === 3 && (
                <div className="text-center py-12">
                  {isProcessing ? (
                    <div>
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">결제 처리 중...</h3>
                      <p className="text-gray-600">잠시만 기다려주세요.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h3>
                      <p className="text-gray-600">공동구매 참여가 완료되었습니다.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        {currentStep < 3 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 shadow-2xl z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center max-w-2xl mx-auto">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="px-6 py-3 border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:border-white/50 shadow-lg"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      이전 단계
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Link to={`/campaigns/${paymentInfo.campaignId}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-6 py-3 text-white/80 hover:bg-white/20 hover:text-white backdrop-blur-sm"
                    >
                      취소
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}