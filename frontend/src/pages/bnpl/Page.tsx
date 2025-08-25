

import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BNPLStatus } from "@/components/payment/bnpl-status"
import { CreditEvaluationForm } from "@/components/credit/CreditEvaluationForm"
import type { BNPLApplication } from "@/lib/bnpl-utils"
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, Plus } from "lucide-react"
import { Link } from 'react-router-dom'
import { useState } from 'react'

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

  // BNPL 한도 정보
  const bnplCreditInfo = {
    totalLimit: 500000, // 총 BNPL 한도
    usedAmount: 314000, // 사용 중인 금액 (위의 mock data 합계)
    availableAmount: 186000, // 사용 가능한 잔여 금액
  }

  const usagePercentage = (bnplCreditInfo.usedAmount / bnplCreditInfo.totalLimit) * 100

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
                      최대 30만원
                    </div>
                    <div className="text-sm text-green-700">한도 증액 가능</div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      학점, 출석률 등 대학생활 데이터 활용
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      즉시 AI 평가 및 한도 결정
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
                {mockBNPLApplications.length > 0 ? (
                  <div className="space-y-4">
                    {mockBNPLApplications.map((application) => (
                      <BNPLStatus key={application.id} application={application} />
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
