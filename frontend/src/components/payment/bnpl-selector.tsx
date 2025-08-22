"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getEligiblePlans, calculateMonthlyPayment, formatCurrency, type BNPLPlan } from "@/lib/bnpl-utils"
import { CreditCard, Calendar, Percent } from "lucide-react"

interface BNPLSelectorProps {
  totalAmount: number
  onPlanSelect: (plan: BNPLPlan | null) => void
  onProceed: () => void
}

export function BNPLSelector({ totalAmount, onPlanSelect, onProceed }: BNPLSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"full" | "bnpl">("full")

  const eligiblePlans = getEligiblePlans(totalAmount)

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId)
    const plan = eligiblePlans.find((p) => p.id === planId)
    onPlanSelect(plan || null)
  }

  const handleMethodChange = (method: "full" | "bnpl") => {
    setPaymentMethod(method)
    if (method === "full") {
      setSelectedPlan("")
      onPlanSelect(null)
    }
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          결제 방법 선택
        </CardTitle>
        <p className="text-sm text-gray-600">원하는 결제 방법을 선택해주세요</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={handleMethodChange}>
          {/* Full Payment Option */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="flex-1">
              <div className="flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div>
                  <div className="font-medium">일시불 결제</div>
                  <div className="text-sm text-gray-600">전액 즉시 결제</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatCurrency(totalAmount)}</div>
                </div>
              </div>
            </Label>
          </div>

          {/* BNPL Option */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bnpl" id="bnpl" />
            <Label htmlFor="bnpl" className="flex-1">
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-medium">BNPL 분할결제</div>
                    <div className="text-sm text-gray-600">지금 구매하고 나중에 분할 결제</div>
                  </div>
                  <Badge variant="secondary">학생 특가</Badge>
                </div>

                {paymentMethod === "bnpl" && (
                  <div className="space-y-3 mt-4">
                    {eligiblePlans.length > 0 ? (
                      <RadioGroup value={selectedPlan} onValueChange={handlePlanChange}>
                        {eligiblePlans.map((plan) => {
                          const monthlyPayment = calculateMonthlyPayment(totalAmount, plan)
                          return (
                            <div key={plan.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={plan.id} id={plan.id} />
                              <Label htmlFor={plan.id} className="flex-1">
                                <div className="p-3 border rounded-md cursor-pointer hover:bg-blue-50">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-blue-600">{plan.name}</div>
                                      <div className="text-sm text-gray-600">{plan.description}</div>
                                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {plan.installments}개월
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Percent className="w-3 h-3" />연 {plan.interestRate}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-blue-600">월 {formatCurrency(monthlyPayment)}</div>
                                      <div className="text-xs text-gray-500">
                                        총 {formatCurrency(monthlyPayment * plan.installments)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          )
                        })}
                      </RadioGroup>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>현재 금액으로는 BNPL을 이용할 수 없습니다.</p>
                        <p className="text-sm">최소 30,000원 이상부터 이용 가능합니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Label>
          </div>
        </RadioGroup>

        <Button
          className="w-full bg-hey-gradient text-white hover:opacity-90 shadow-lg transition-all duration-200 transform hover:scale-105"
          size="lg"
          onClick={onProceed}
          disabled={paymentMethod === "bnpl" && !selectedPlan}
        >
          {paymentMethod === "full" ? "결제하기" : "BNPL 신청하기"}
        </Button>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="font-medium text-sm">안전한 결제</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• SSL 암호화로 개인정보를 안전하게 보호합니다</p>
            <p>• 모든 결제는 안전한 PG사를 통해 처리됩니다</p>
            {paymentMethod === "bnpl" && (
              <>
                <p>• BNPL 이용을 위해서는 신용평가가 진행됩니다</p>
                <p>• 학생 신분 확인 후 승인 여부가 결정됩니다</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
