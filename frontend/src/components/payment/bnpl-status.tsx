"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, type BNPLApplication, type BNPLPayment } from "@/lib/bnpl-utils"
import { Calendar, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface BNPLStatusProps {
  application: BNPLApplication
  payments?: BNPLPayment[]
}

export function BNPLStatus({ application, payments = [] }: BNPLStatusProps) {
  const getStatusIcon = () => {
    switch (application.status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "approved":
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (application.status) {
      case "pending":
        return "심사 중"
      case "approved":
        return "승인됨"
      case "active":
        return "결제 진행중"
      case "completed":
        return "완료"
      case "rejected":
        return "거부됨"
      default:
        return "알 수 없음"
    }
  }

  const getStatusColor = () => {
    switch (application.status) {
      case "pending":
        return "secondary"
      case "approved":
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const completedPayments = payments.filter((p) => p.status === "completed").length
  const totalPayments = Math.ceil(application.totalAmount / application.monthlyPayment)
  const progressPercentage = (completedPayments / totalPayments) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            BNPL 결제 현황
          </CardTitle>
          <Badge variant={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">총 결제금액</p>
            <p className="text-lg font-bold">{formatCurrency(application.totalAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">월 납부금액</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(application.monthlyPayment)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">남은 결제</p>
            <p className="text-lg font-bold">{application.remainingPayments}회</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">다음 결제일</p>
            <p className="text-lg font-bold">
              {application.nextPaymentDate ? new Date(application.nextPaymentDate).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>

        {/* Progress */}
        {application.status === "active" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>결제 진행률</span>
              <span>
                {completedPayments}/{totalPayments}회 완료
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Status Messages */}
        {application.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-4 h-4" />
              <span className="font-medium">심사 진행 중</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              신청서를 검토 중입니다. 1-2시간 내에 결과를 알려드리겠습니다.
            </p>
          </div>
        )}

        {application.status === "approved" && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">승인 완료</span>
            </div>
            <p className="text-sm text-green-700 mt-1">BNPL이 승인되었습니다. 첫 결제는 다음 달부터 시작됩니다.</p>
          </div>
        )}

        {application.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">승인 거부</span>
            </div>
            <p className="text-sm text-red-700 mt-1">신용도 또는 소득 조건이 맞지 않아 승인이 거부되었습니다.</p>
          </div>
        )}

        {application.status === "completed" && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">결제 완료</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">모든 분할 결제가 완료되었습니다. 이용해 주셔서 감사합니다.</p>
          </div>
        )}

        {/* Action Buttons */}
        {application.status === "active" && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Calendar className="w-4 h-4 mr-2" />
              결제 내역 보기
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              조기 상환하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
