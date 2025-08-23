

import type React from "react"

import { useState } from "react"
import { useRouter } from '@/compat/navigation'
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductSearchModal } from "@/components/product-search-modal"
import { ArrowLeft, Upload, Eye, Calculator, Search } from "lucide-react"
import { Link } from 'react-router-dom'

const discountTiers = [
  { minQuantity: 1, maxQuantity: 9, discountRate: 0 },
  { minQuantity: 10, maxQuantity: 19, discountRate: 5 },
  { minQuantity: 20, maxQuantity: 49, discountRate: 10 },
  { minQuantity: 50, maxQuantity: 99, discountRate: 15 },
  { minQuantity: 100, maxQuantity: Number.POSITIVE_INFINITY, discountRate: 20 },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    productName: "",
    description: "",
    originalPrice: "",
    targetQuantity: "",
    endDateTime: "",
    imageUrl: "",
    address: "",
    detailAddress: "",
    contactInfo: "",
    terms: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Mock API call
    setTimeout(() => {
      alert("공구가 성공적으로 생성되었습니다!")
      router.push("/dashboard")
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "imageUrl" && value) {
      setImagePreview(value)
    }
  }

  const handleProductSelect = (product: any) => {
    setFormData((prev) => ({
      ...prev,
      productName: product.name,
      originalPrice: product.price.toString(),
      imageUrl: product.image,
      description: product.description,
    }))
    setImagePreview(product.image)
  }

  const handleAddressSelect = (selectedAddress: string) => {
    setFormData((prev) => ({ ...prev, address: selectedAddress }))
    setIsAddressModalOpen(false)
  }

  const calculateDiscountInfo = () => {
    const quantity = Number(formData.targetQuantity)
    const originalPrice = Number(formData.originalPrice)

    if (!quantity || !originalPrice) return { discountRate: 0, discountedPrice: 0, savings: 0 }

    const tier = discountTiers.find((tier) => quantity >= tier.minQuantity && quantity <= tier.maxQuantity)
    const discountRate = tier?.discountRate || 0
    const discountedPrice = originalPrice * (1 - discountRate / 100)
    const savings = originalPrice - discountedPrice

    return { discountRate, discountedPrice, savings }
  }

  const { discountRate, discountedPrice, savings } = calculateDiscountInfo()

  const mockAddresses = [
    "서울특별시 강남구 테헤란로 123",
    "서울특별시 서초구 서초대로 456",
    "서울특별시 송파구 올림픽로 789",
    "서울특별시 마포구 홍익로 321",
    "서울특별시 종로구 종로 654",
    "경기도 성남시 분당구 판교역로 987",
    "경기도 수원시 영통구 광교로 147",
    "인천광역시 연수구 송도과학로 258",
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-in">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4 hover:bg-white/50 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-purple-700 mb-2">새 공동구매 만들기</h1>
              <p className="text-gray-600 text-lg">같은 대학 학생들과 함께 구매할 상품을 등록하세요.</p>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto shadow-xl border-0 animate-slide-up bg-white">
            <CardHeader className="bg-white border-b border-gray-200 rounded-t-lg">
              <CardTitle className="text-2xl text-purple-700">공구 정보 입력</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
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

                  <div className="space-y-2">
                    <Label htmlFor="productName" className="text-sm font-medium">
                      상품명 *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="productName"
                        placeholder="검색 버튼을 눌러 상품을 선택하세요"
                        value={formData.productName}
                        onChange={(e) => handleInputChange("productName", e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                        required
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProductModalOpen(true)}
                        className="px-4 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        검색
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">가격 정보</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice" className="text-sm font-medium">
                        정가 (원) *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="originalPrice"
                          type="number"
                          placeholder="상품 검색으로 자동 입력"
                          value={formData.originalPrice}
                          onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                          className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                          required
                          readOnly
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsProductModalOpen(true)}
                          className="px-4 hover:bg-purple-50 hover:border-purple-300"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

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
                  </div>

                  {formData.originalPrice && formData.targetQuantity && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Calculator className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-700">할인 정보</h4>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{discountRate}%</div>
                          <div className="text-sm text-gray-600">할인율</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{discountedPrice.toLocaleString()}원</div>
                          <div className="text-sm text-gray-600">할인된 가격</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">-{savings.toLocaleString()}원</div>
                          <div className="text-sm text-gray-600">절약 금액</div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded border">
                        <h5 className="font-medium text-gray-700 mb-2">할인 단계별 정보</h5>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                          {discountTiers.map((tier, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded text-center ${
                                Number(formData.targetQuantity) >= tier.minQuantity &&
                                Number(formData.targetQuantity) <= tier.maxQuantity
                                  ? "bg-purple-100 text-purple-700 font-semibold"
                                  : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              <div>
                                {tier.minQuantity}
                                {tier.maxQuantity === Number.POSITIVE_INFINITY ? "+" : `-${tier.maxQuantity}`}개
                              </div>
                              <div>{tier.discountRate}% 할인</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campaign Settings Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">공구 설정</h3>

                  <div className="space-y-2">
                    <Label htmlFor="endDateTime" className="text-sm font-medium">
                      마감일시 *
                    </Label>
                    <Input
                      id="endDateTime"
                      type="datetime-local"
                      value={formData.endDateTime}
                      onChange={(e) => handleInputChange("endDateTime", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-300 w-auto"
                      required
                    />
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
                          placeholder="상품 검색으로 자동 입력"
                          value={formData.imageUrl}
                          onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                          className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                          readOnly
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsProductModalOpen(true)}
                          className="px-4 hover:bg-purple-50 hover:border-purple-300"
                        >
                          <Search className="w-4 h-4" />
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

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-700 border-b border-purple-200 pb-2">게시물 내용</h3>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      상품 설명 *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="상품에 대한 자세한 설명을 입력하세요..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={6}
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                      required
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="contactInfo" className="text-sm font-medium">
                      연락처 정보
                    </Label>
                    <Input
                      id="contactInfo"
                      placeholder="전화번호 010-1234-5678"
                      value={formData.contactInfo}
                      onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="flex-1 bg-hey-gradient hover:opacity-90 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "생성 중..." : "공구 생성하기"}
                  </Button>
                  <Link to="/dashboard">
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

        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-700">주소 검색</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {mockAddresses.map((address, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddressSelect(address)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    {address}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <ProductSearchModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSelectProduct={handleProductSelect}
        />
      </div>
    </AuthGuard>
  )
}
