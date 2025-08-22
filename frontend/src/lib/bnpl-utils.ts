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

export const bnplPlans: BNPLPlan[] = [
  {
    id: "plan-3",
    name: "3개월 무이자",
    installments: 3,
    interestRate: 0,
    description: "3개월 동안 무이자로 분할결제",
    minAmount: 30000,
    maxAmount: 500000,
  },
  {
    id: "plan-6",
    name: "6개월 저금리",
    installments: 6,
    interestRate: 2.9,
    description: "6개월 동안 연 2.9% 금리로 분할결제",
    minAmount: 50000,
    maxAmount: 1000000,
  },
  {
    id: "plan-12",
    name: "12개월 장기",
    installments: 12,
    interestRate: 4.9,
    description: "12개월 동안 연 4.9% 금리로 분할결제",
    minAmount: 100000,
    maxAmount: 2000000,
  },
]

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

export function getEligiblePlans(amount: number): BNPLPlan[] {
  return bnplPlans.filter((plan) => amount >= plan.minAmount && amount <= plan.maxAmount)
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString() + "원"
}
