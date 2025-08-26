// BNPL utility functions and types

export interface BNPLPlan {
  id: string
  name: string
  installments: number
  interestRate: number
  description: string
  minAmount: number
  maxAmount: number
}

export interface BNPLApplication {
  id: string
  userId: string
  orderId: string
  totalAmount: number
  planId: string
  monthlyPayment: number
  status: "pending" | "approved" | "rejected" | "active" | "completed"
  applicationDate: string
  approvalDate?: string
  nextPaymentDate?: string
  remainingPayments: number
}

export interface BNPLPayment {
  id: string
  bnplId: string
  amount: number
  paymentDate: string
  status: "completed" | "failed" | "pending"
  method: string
}


export function calculateMonthlyPayment(amount: number, plan: BNPLPlan): number {
  if (plan.interestRate === 0) {
    return Math.ceil(amount / plan.installments)
  }

  const monthlyRate = plan.interestRate / 100 / 12
  const payment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, plan.installments)) /
    (Math.pow(1 + monthlyRate, plan.installments) - 1)

  return Math.ceil(payment)
}


export function formatCurrency(amount: number): string {
  return amount.toLocaleString() + "원"
}
