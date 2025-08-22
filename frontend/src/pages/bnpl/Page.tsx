

import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { BNPLStatus } from "@/components/payment/bnpl-status"
import type { BNPLApplication } from "@/lib/bnpl-utils"
import { ArrowLeft, CreditCard } from "lucide-react"
import { Link } from 'react-router-dom'

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
            <p className="text-gray-600 mt-2">분할결제 현황을 확인하고 관리하세요.</p>
          </div>

          <div className="space-y-6">
            {mockBNPLApplications.length > 0 ? (
              mockBNPLApplications.map((application) => <BNPLStatus key={application.id} application={application} />)
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
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
