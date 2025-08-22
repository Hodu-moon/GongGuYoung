"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, type BNPLPlan } from "@/lib/bnpl-utils"
import { FileText, Shield } from "lucide-react"

interface BNPLApplicationProps {
  plan: BNPLPlan
  totalAmount: number
  monthlyPayment: number
  onSubmit: (applicationData: any) => void
  onCancel: () => void
}

export function BNPLApplication({ plan, totalAmount, monthlyPayment, onSubmit, onCancel }: BNPLApplicationProps) {
  const [formData, setFormData] = useState({
    bankAccount: "",
    monthlyIncome: "",
    emergencyContact: "",
    emergencyPhone: "",
  })
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    credit: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allAgreed = Object.values(agreements).every(Boolean)
  const formComplete = Object.values(formData).every((value) => value.trim() !== "")

  const handleSubmit = async () => {
    if (!allAgreed || !formComplete) return

    setIsSubmitting(true)

    // Mock API call
    setTimeout(() => {
      onSubmit({
        ...formData,
        planId: plan.id,
        totalAmount,
        monthlyPayment,
      })
      setIsSubmitting(false)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          BNPL 신청서
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">선택한 플랜</span>
            <Badge variant="secondary">{plan.name}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">총 결제금액:</span>
              <span className="font-bold ml-2">{formatCurrency(totalAmount)}</span>
            </div>
            <div>
              <span className="text-gray-600">월 납부금액:</span>
              <span className="font-bold ml-2 text-blue-600">{formatCurrency(monthlyPayment)}</span>
            </div>
            <div>
              <span className="text-gray-600">분할 기간:</span>
              <span className="font-bold ml-2">{plan.installments}개월</span>
            </div>
            <div>
              <span className="text-gray-600">금리:</span>
              <span className="font-bold ml-2">연 {plan.interestRate}%</span>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankAccount">출금 계좌번호</Label>
            <Input
              id="bankAccount"
              placeholder="계좌번호를 입력하세요 (하이픈 제외)"
              value={formData.bankAccount}
              onChange={(e) => setFormData((prev) => ({ ...prev, bankAccount: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">월 소득 (아르바이트, 용돈 등)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="월 평균 소득을 입력하세요"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData((prev) => ({ ...prev, monthlyIncome: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">비상연락처 (이름)</Label>
              <Input
                id="emergencyContact"
                placeholder="부모님 또는 보호자"
                value={formData.emergencyContact}
                onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">비상연락처 (전화번호)</Label>
              <Input
                id="emergencyPhone"
                placeholder="010-0000-0000"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Agreements */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            약관 동의
          </h4>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreements.terms}
                onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, terms: checked as boolean }))}
              />
              <Label htmlFor="terms" className="text-sm">
                BNPL 서비스 이용약관에 동의합니다 (필수)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy"
                checked={agreements.privacy}
                onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, privacy: checked as boolean }))}
              />
              <Label htmlFor="privacy" className="text-sm">
                개인정보 수집 및 이용에 동의합니다 (필수)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="credit"
                checked={agreements.credit}
                onCheckedChange={(checked) => setAgreements((prev) => ({ ...prev, credit: checked as boolean }))}
              />
              <Label htmlFor="credit" className="text-sm">
                신용정보 조회 및 제공에 동의합니다 (필수)
              </Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            className="flex-1 bg-hey-gradient text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={!allAgreed || !formComplete || isSubmitting}
          >
            {isSubmitting ? "신청 중..." : "BNPL 신청하기"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">신청 안내</p>
          <p>• 신청 후 1-2시간 내에 승인 결과를 알려드립니다.</p>
          <p>• 학생 신분 및 신용도에 따라 승인이 거부될 수 있습니다.</p>
          <p>• 첫 결제는 승인 후 다음 달부터 시작됩니다.</p>
        </div>
      </CardContent>
    </Card>
  )
}
