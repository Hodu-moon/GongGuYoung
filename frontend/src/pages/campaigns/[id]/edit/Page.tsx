

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from '@/compat/navigation'
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Eye, Save } from "lucide-react"
import { Link, useParams } from 'react-router-dom'
import { campaigns } from "@/lib/mock-data"

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    productName: "",
    description: "",
    originalPrice: "",
    discountPrice: "",
    targetQuantity: "",
    endDate: "",
    imageUrl: "",
    deliveryInfo: "",
    contactInfo: "",
    terms: "",
  })

  useEffect(() => {
    const loadCampaignData = () => {
      // Mock API call to load campaign data
      const campaign = campaigns.find((c) => c.id === campaignId)

      if (campaign) {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 7)

        setFormData({
          title: campaign.title,
          productName: campaign.product.name,
          description: campaign.description,
          originalPrice: campaign.product.originalPrice.toString(),
          discountPrice: campaign.discountPrice.toString(),
          targetQuantity: campaign.targetQuantity.toString(),
          endDate: endDate.toISOString().split("T")[0],
          imageUrl: campaign.product.image,
          deliveryInfo: "캠퍼스 내 수령 예정",
          contactInfo: "kakao: heyoung_admin",
          terms: "최소 인원 미달 시 자동 환불됩니다.",
        })
        setImagePreview(campaign.product.image)
      }

      setIsLoading(false)
    }

    loadCampaignData()
  }, [campaignId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Mock API call
    setTimeout(() => {
      alert("공구가 성공적으로 수정되었습니다!")
      router.push(`/campaigns/${campaignId}`)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "imageUrl" && value) {
      setImagePreview(value)
    }
  }

  const discountPercentage =
    formData.originalPrice && formData.discountPrice
      ? Math.round(
          ((Number(formData.originalPrice) - Number(formData.discountPrice)) / Number(formData.originalPrice)) * 100,
        )
      : 0

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">공구 정보를 불러오는 중...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-in">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to={`/campaigns/${campaignId}`}>
              <Button variant="ghost" className="mb-4 hover:bg-white/50 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                공구 상세로 돌아가기
              </Button>
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-purple-700 mb-2">공동구매 수정하기</h1>
              <p className="text-gray-600 text-lg">공구 정보를 수정하여 더 나은 조건으로 운영하세요.</p>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto shadow-xl border-0 animate-slide-up">
            <CardHeader className="bg-hey-gradient text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Save className="w-6 h-6" />
                공구 정보 수정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">기본 정보</h3>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      공구 제목 *
                    </Label>
                    <Input
                      id="title"
                      placeholder="예: 생화학 교재 공동구매 (20명 모집)"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="text-sm font-medium">
                        상품명 *
                      </Label>
                      <Input
                        id="productName"
                        placeholder="예: Campbell Biology 11th Edition"
                        value={formData.productName}
                        onChange={(e) => handleInputChange("productName", e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      상품 설명 *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="상품에 대한 자세한 설명을 입력하세요..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                      required
                    />
                  </div>
                </div>

                {/* Price Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">가격 정보</h3>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice" className="text-sm font-medium">
                        정가 (원) *
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        placeholder="89000"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountPrice" className="text-sm font-medium">
                        공구가 (원) *
                      </Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        placeholder="75000"
                        value={formData.discountPrice}
                        onChange={(e) => handleInputChange("discountPrice", e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                        required
                      />
                    </div>

                    {discountPercentage > 0 && (
                      <div className="flex items-center justify-center">
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold">
                          {discountPercentage}% 할인
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaign Settings Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">공구 설정</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetQuantity" className="text-sm font-medium">
                        목표 수량 (명) *
                      </Label>
                      <Input
                        id="targetQuantity"
                        type="number"
                        placeholder="20"
                        value={formData.targetQuantity}
                        onChange={(e) => handleInputChange("targetQuantity", e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium">
                        마감일 *
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">상품 이미지</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-sm font-medium">
                        이미지 URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="imageUrl"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={formData.imageUrl}
                          onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                          className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {imagePreview && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          미리보기
                        </Label>
                        <div className="border rounded-lg p-2">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="상품 미리보기"
                            className="w-full h-32 object-cover rounded"
                            onError={() => setImagePreview("")}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">추가 정보</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryInfo" className="text-sm font-medium">
                        배송/수령 정보
                      </Label>
                      <Textarea
                        id="deliveryInfo"
                        placeholder="배송 방법, 수령 장소, 예상 배송일 등을 입력하세요..."
                        value={formData.deliveryInfo}
                        onChange={(e) => handleInputChange("deliveryInfo", e.target.value)}
                        rows={3}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactInfo" className="text-sm font-medium">
                        연락처 정보
                      </Label>
                      <Input
                        id="contactInfo"
                        placeholder="카카오톡 ID, 이메일 등 연락 가능한 정보"
                        value={formData.contactInfo}
                        onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="terms" className="text-sm font-medium">
                        공구 조건 및 주의사항
                      </Label>
                      <Textarea
                        id="terms"
                        placeholder="환불 정책, 주의사항, 기타 조건 등을 입력하세요..."
                        value={formData.terms}
                        onChange={(e) => handleInputChange("terms", e.target.value)}
                        rows={3}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="flex-1 bg-hey-gradient hover:opacity-90 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "수정 중..." : "공구 수정하기"}
                  </Button>
                  <Link to={`/campaigns/${campaignId}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="px-8 py-3 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                    >
                      취소
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
