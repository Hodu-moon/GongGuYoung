

import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BNPLStatus } from "@/components/payment/bnpl-status"
import { CreditEvaluationForm } from "@/components/credit/CreditEvaluationForm"
import type { BNPLApplication } from "@/lib/bnpl-utils"
import { fetchBNPLRemain, fetchBNPLItems, postBnplRepay, type BNPLRemain, type BNPLItem } from "@/api/Payment"
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, Plus } from "lucide-react"
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Mock BNPL data
const mockBNPLApplications: BNPLApplication[] = [
  {
    id: "bnpl-1",
    userId: "1",
    orderId: "order-1",
    totalAmount: 225000,
    planId: "plan-6",
    monthlyPayment: 38500,
    status: "active",
    applicationDate: "2024-01-15",
    approvalDate: "2024-01-15",
    nextPaymentDate: "2024-02-15",
    remainingPayments: 4,
  },
  {
    id: "bnpl-2",
    userId: "1",
    orderId: "order-2",
    totalAmount: 89000,
    planId: "plan-3",
    monthlyPayment: 29700,
    status: "pending",
    applicationDate: "2024-01-20",
    remainingPayments: 3,
  },
]

export default function BNPLPage() {
  const { user } = useAuth()
  const [showCreditEvaluation, setShowCreditEvaluation] = useState(false)
  const [bnplRemain, setBnplRemain] = useState<BNPLRemain | null>(null)
  const [bnplItems, setBnplItems] = useState<BNPLItem[]>([])
  const [isLoadingBnpl, setIsLoadingBnpl] = useState(true)

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

  // BNPL 한도 정보 (API 실제 데이터 사용 - my-page와 동일한 로직)
  const actualBnplLimit = bnplRemain?.bnplLimit || 0
  const remainAmount = bnplRemain?.remain || 0
  const hasNoLimit = actualBnplLimit === 0
  
  const bnplCreditInfo = {
    totalLimit: hasNoLimit ? 100000 : actualBnplLimit, // API에서 받은 bnplLimit
    usedAmount: hasNoLimit ? 0 : (actualBnplLimit - remainAmount), // 총 한도 - 사용 가능 금액 = 사용 중 금액
    availableAmount: hasNoLimit ? 100000 : remainAmount, // API에서 받은 remain (사용 가능한 금액)
    hasNoLimit, // 한도가 없는 상태인지 여부
  }

  const usagePercentage = bnplCreditInfo.totalLimit > 0 ? (bnplCreditInfo.usedAmount / bnplCreditInfo.totalLimit) * 100 : 0

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              BNPL 관리
            </h1>
            <p className="text-gray-600 mt-2">분할결제 현황을 확인하고 AI 기반 한도 증액을 신청하세요.</p>
          </div>

          <div className="space-y-6">
            {/* BNPL 한도 현황 카드 */}
            <div className="grid md:grid-cols-2 gap-6">
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
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>사용률</span>
                              <span>{usagePercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={usagePercentage} className="h-3" />
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
                      <AlertCircle className="w-4 h-4" />
                      1단계: 학점, 출석률, 활동 평가 (최대 30만원)
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      2단계: AI 신용평가로 추가 20만원 증액
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
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
                  <CreditEvaluationForm />
                </CardContent>
              </Card>
            )}

            {/* BNPL 이용 내역 */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  현재 이용 중인 BNPL
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBnpl ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-600">BNPL 이용 내역을 불러오는 중...</p>
                  </div>
                ) : bnplItems.length > 0 ? (
                  <div className="space-y-4">
                    {bnplItems.map((bnpl) => (
                      <div
                        key={bnpl.paymentId}
                        className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={bnpl.itemImageUrl || "/placeholder.svg"}
                              alt={bnpl.itemName}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-semibold text-blue-800">{bnpl.itemName}</h3>
                              <p className="text-sm text-blue-600">{bnpl.groupPurchaseTitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  bnpl.bnplstatus === "PROCESSING" 
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}>
                                  {bnpl.bnplstatus === "PROCESSING" ? "상환 대기중" : "상환 완료"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {bnpl.bnplAmount.toLocaleString()}원
                            </div>
                            {bnpl.bnplstatus === "PROCESSING" && (
                              <Button
                                size="sm"
                                className="mt-2 bg-blue-600 hover:bg-blue-700"
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
                                상환하기
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                          <div>
                            <span className="text-blue-500">결제 ID</span>
                            <div className="font-semibold">#{bnpl.paymentId}</div>
                          </div>
                          <div>
                            <span className="text-blue-500">상환 금액</span>
                            <div className="font-semibold">{bnpl.bnplAmount.toLocaleString()}원</div>
                          </div>
                          <div>
                            <span className="text-blue-500">상태</span>
                            <div className="font-semibold">
                              {bnpl.bnplstatus === "PROCESSING" ? "상환 대기중" : "상환 완료"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">BNPL 이용 내역이 없습니다</h3>
                    <p className="text-gray-500 mb-6">공동구매에서 BNPL을 이용해보세요.</p>
                    <Link to="/dashboard">
                      <Button className="bg-blue-600 hover:bg-blue-700">공동구매 둘러보기</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
