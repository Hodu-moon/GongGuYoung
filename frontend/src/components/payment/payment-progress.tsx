"use client"
import { CheckCircle, Circle, Clock } from "lucide-react"

interface PaymentProgressProps {
  currentStep: number
  paymentMethod: "full" | "bnpl"
}

export function PaymentProgress({ currentStep, paymentMethod }: PaymentProgressProps) {
  const steps =
    paymentMethod === "bnpl"
      ? [
          { id: 1, title: "결제 방법 선택", description: "일시불 또는 BNPL 선택" },
          { id: 2, title: "BNPL 신청", description: "분할결제 신청서 작성" },
          { id: 3, title: "심사 대기", description: "신용도 및 자격 심사" },
          { id: 4, title: "완료", description: "승인 완료 및 주문 확정" },
        ]
      : [
          { id: 1, title: "결제 방법 선택", description: "일시불 결제 선택" },
          { id: 2, title: "결제 진행", description: "결제 정보 확인" },
          { id: 3, title: "완료", description: "결제 완료 및 주문 확정" },
        ]

  const getStepIcon = (stepId: number) => {
    if (stepId < currentStep) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (stepId === currentStep) {
      return <Clock className="w-5 h-5 text-blue-600" />
    } else {
      return <Circle className="w-5 h-5 text-gray-300" />
    }
  }

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed"
    if (stepId === currentStep) return "current"
    return "upcoming"
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-purple-200 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-center">결제 진행 상황</h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 bg-white mb-2">
                {getStepIcon(step.id)}
              </div>
              <div className="text-center">
                <div
                  className={`text-sm font-medium ${
                    getStepStatus(step.id) === "completed"
                      ? "text-green-600"
                      : getStepStatus(step.id) === "current"
                        ? "text-blue-600"
                        : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1 max-w-20">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${step.id < currentStep ? "bg-green-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
