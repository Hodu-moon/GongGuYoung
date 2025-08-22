

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from '@/compat/navigation'
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Share2, Calendar, CreditCard, Package } from "lucide-react"
import { Link } from 'react-router-dom'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    // Mock API call to get order details
    const orderId = searchParams.get("orderId")
    const paymentMethod = searchParams.get("method")

    setTimeout(() => {
      setOrderData({
        orderId: orderId || "ORDER-" + Date.now(),
        campaignTitle: "생화학 교재 공동구매",
        productName: "Campbell Biology 11th Edition",
        quantity: 1,
        amount: 75000,
        paymentMethod: paymentMethod === "bnpl" ? "BNPL 3개월" : "일시불",
        orderDate: new Date().toLocaleDateString(),
        estimatedDelivery: "2024-02-15",
        status: paymentMethod === "bnpl" ? "심사 중" : "결제 완료",
      })
      setIsLoading(false)
    }, 1500)
  }, [searchParams])

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">결제 정보를 확인하는 중...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-in">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8 animate-slide-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {orderData?.paymentMethod?.includes("BNPL") ? "BNPL 신청 완료!" : "결제 완료!"}
              </h1>
              <p className="text-gray-600 text-lg">
                {orderData?.paymentMethod?.includes("BNPL")
                  ? "BNPL 신청이 성공적으로 접수되었습니다."
                  : "주문이 성공적으로 완료되었습니다."}
              </p>
            </div>

            {/* Order Details Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6 animate-slide-up">
              <CardHeader className="bg-hey-gradient text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  주문 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-mono font-semibold">{orderData?.orderId}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">공구명</span>
                    <span className="font-medium">{orderData?.campaignTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품명</span>
                    <span className="font-medium">{orderData?.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수량</span>
                    <span className="font-medium">{orderData?.quantity}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제금액</span>
                    <span className="font-bold text-lg text-purple-600">{orderData?.amount?.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제방법</span>
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      {orderData?.paymentMethod}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문일시</span>
                    <span className="font-medium">{orderData?.orderDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6 animate-slide-up">
              <CardContent className="p-6">
                {orderData?.paymentMethod?.includes("BNPL") ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-semibold">BNPL 심사 진행 중</span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      신청서를 검토 중입니다. 1-2시간 내에 승인 결과를 알려드리겠습니다.
                    </p>
                    <div className="text-sm text-yellow-600">
                      <p>• 승인 시 첫 결제는 다음 달부터 시작됩니다</p>
                      <p>• 결과는 이메일과 앱 알림으로 안내드립니다</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">결제 완료</span>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      결제가 성공적으로 완료되었습니다. 공구 마감 후 상품을 발송해드립니다.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Calendar className="w-4 h-4" />
                      <span>예상 배송일: {orderData?.estimatedDelivery}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-slide-up">
              <Button variant="outline" className="flex items-center gap-2 bg-white/80">
                <Download className="w-4 h-4" />
                영수증 다운로드
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-white/80">
                <Share2 className="w-4 h-4" />
                친구에게 공유
              </Button>
              <Link to="/my-page">
                <Button variant="outline" className="w-full flex items-center gap-2 bg-white/80">
                  <Package className="w-4 h-4" />
                  주문 내역 보기
                </Button>
              </Link>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 animate-slide-up">
              <Link to="/dashboard" className="flex-1">
                <Button className="w-full bg-hey-gradient hover:opacity-90 text-white">다른 공구 둘러보기</Button>
              </Link>
              {orderData?.paymentMethod?.includes("BNPL") && (
                <Link to="/bnpl" className="flex-1">
                  <Button variant="outline" className="w-full bg-white/80">
                    BNPL 관리
                  </Button>
                </Link>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center text-sm text-gray-500 animate-slide-up">
              <p>문의사항이 있으시면 고객센터(1588-0000)로 연락주세요.</p>
              <p className="mt-1">평일 09:00-18:00 (점심시간 12:00-13:00 제외)</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
