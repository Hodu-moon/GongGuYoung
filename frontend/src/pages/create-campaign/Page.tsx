

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from '@/compat/navigation'
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ShoppingBag, Calendar, Target, DollarSign, Image as ImageIcon, FileText, Sparkles, Check, Loader2, Search, X } from "lucide-react"
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    context: "",
    productId: "",
    endAt: "",
    targetCount: "",
    discountedPrice: "",
  })
  
  // 상품 관련 상태
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 6
  
  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  

  const steps = [
    { number: 1, title: "상품 선택", icon: ShoppingBag, description: "공동구매할 상품을 선택하세요" },
    { number: 2, title: "공구 설정", icon: Target, description: "목표 수량과 할인가를 설정하세요" },
    { number: 3, title: "상세 정보", icon: FileText, description: "제목과 설명을 작성하세요" },
    { number: 4, title: "마감 설정", icon: Calendar, description: "마감일을 설정하고 등록하세요" },
  ]

  // 전체 상품 목록 가져오기 함수
  const fetchAllProducts = useCallback(async () => {
    try {
      console.log('Fetching all products')
      const response = await axios.get('/api/v1/products')
      setProducts(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      return []
    }
  }, [])

  // 검색 함수
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // 검색 시 첫 페이지로 이동
    
    if (query.trim() === "") {
      setIsSearching(false)
      setFilteredProducts([])
    } else {
      setIsSearching(true)
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [products])

  // 현재 페이지에 표시할 상품들 계산
  const getCurrentPageProducts = useCallback(() => {
    const sourceProducts = isSearching ? filteredProducts : products
    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    return sourceProducts.slice(startIndex, endIndex)
  }, [products, filteredProducts, isSearching, currentPage, productsPerPage])

  // 총 페이지 수 계산
  const getTotalPages = useCallback(() => {
    const sourceProducts = isSearching ? filteredProducts : products
    return Math.ceil(sourceProducts.length / productsPerPage)
  }, [products, filteredProducts, isSearching, productsPerPage])

  // 초기 로드
  useEffect(() => {
    fetchAllProducts()
  }, [fetchAllProducts])


  const handleSubmit = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)

    // 백엔드 API 호출 (Mock)
    const requestData = {
      title: formData.title,
      context: formData.context,
      productId: parseInt(formData.productId),
      endAt: formData.endAt,
      targetCount: parseInt(formData.targetCount),
      discountedPrice: parseInt(formData.discountedPrice),
    }

    try {
      // 실제로는 POST /api/v1/group-purchase 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert("공구가 성공적으로 생성되었습니다!")
      router.push("/dashboard")
    } catch (error) {
      alert("공구 생성에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProductSelect = (productId: number) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      setFormData(prev => ({ ...prev, productId: productId.toString() }))
    }
  }

  // 검색창 초기화 함수
  const clearSearch = () => {
    setSearchQuery("")
    handleSearch("")
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return selectedProduct !== null
      case 2: return formData.targetCount && formData.discountedPrice
      case 3: return formData.title && formData.context
      case 4: return formData.endAt
      default: return false
    }
  }

  const getSavingsAmount = () => {
    if (!selectedProduct || !formData.discountedPrice) return 0
    return selectedProduct.price - parseInt(formData.discountedPrice)
  }

  const getDiscountPercentage = () => {
    if (!selectedProduct || !formData.discountedPrice) return 0
    const savings = getSavingsAmount()
    return Math.round((savings / selectedProduct.price) * 100)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 pb-24">
          {/* Header */}
          <div className="mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-6 hover:bg-white/60 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-purple-800">새 공동구매 만들기</h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                단계별로 간단하게 공동구매를 등록하고, 같은 대학 학생들과 함께 더 저렴하게 구매하세요.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 -translate-y-1/2 z-0 transition-all duration-500"
                     style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
                
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.number
                  const isCompleted = currentStep > step.number
                  
                  return (
                    <div key={step.number} className="flex flex-col items-center z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : isActive 
                            ? 'bg-white border-2 border-purple-600 text-purple-600 shadow-lg' 
                            : 'bg-white border-2 border-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-sm font-medium ${isActive || isCompleted ? 'text-purple-700' : 'text-gray-400'}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 max-w-24 mt-1">{step.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="max-w-4xl mx-auto shadow-xl border-0 rounded-2xl overflow-hidden bg-gradient-to-b from-purple-600 via-purple-600 to-white" style={{backgroundImage: 'linear-gradient(to bottom, rgb(147, 51, 234) 0%, rgb(236, 72, 153) 120px, rgb(255, 255, 255) 120px, rgb(255, 255, 255) 100%)'}}>
            <CardHeader className="bg-transparent text-white p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  {React.createElement(steps[currentStep - 1].icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {steps[currentStep - 1].title}
                  </CardTitle>
                  <p className="text-purple-100 mt-1">{steps[currentStep - 1].description}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-8 pt-5 pb-8 bg-transparent">
              {/* Step 1: 상품 선택 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* 검색창 */}
                  <div className="relative max-w-md mx-auto mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="상품명으로 검색... (예: 애플 에어팟)"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-10 h-12 text-base border-2 focus:border-purple-600 rounded-xl"
                      />
                      {searchQuery && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    {isSearching && (
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        "{searchQuery}" 검색 결과: {filteredProducts.length}개
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {getCurrentPageProducts().map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product.id)}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-lg ${
                          selectedProduct?.id === product.id
                            ? 'border-purple-600 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-800 mb-2">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 h-10">{product.description}</p>
                          <div className="flex items-center justify-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              {product.price.toLocaleString()}원
                            </span>
                          </div>
                          {selectedProduct?.id === product.id && (
                            <div className="mt-3">
                              <Badge className="bg-purple-600">선택됨</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  {getTotalPages() > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      
                      {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg border ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                        disabled={currentPage === getTotalPages()}
                        className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  )}

                  {/* 로딩 인디케이터 */}
                  {loadingProducts && (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      <span className="ml-2 text-gray-600">상품을 불러오는 중...</span>
                    </div>
                  )}

                  {/* 상품이 하나도 없을 때 */}
                  {!loadingProducts && getCurrentPageProducts().length === 0 && (
                    <div className="text-center py-12">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      {isSearching ? (
                        <div>
                          <p className="text-gray-500 mb-2">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
                          <button
                            onClick={clearSearch}
                            className="text-purple-600 hover:text-purple-700 underline text-sm"
                          >
                            전체 상품 보기
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-500">상품을 불러올 수 없습니다.</p>
                      )}
                    </div>
                  )}

                  {/* 검색 결과 정보 */}
                  {isSearching && getCurrentPageProducts().length > 0 && (
                    <div className="text-center py-4 text-sm text-gray-600">
                      "{searchQuery}" 검색 결과: 총 {filteredProducts.length}개 중 {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, filteredProducts.length)}개 표시
                    </div>
                  )}

                  {!isSearching && getCurrentPageProducts().length > 0 && getTotalPages() > 1 && (
                    <div className="text-center py-4 text-sm text-gray-600">
                      총 {products.length}개 중 {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, products.length)}개 표시
                    </div>
                  )}

                </div>
              )}

              {/* Step 2: 공구 설정 */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  {selectedProduct && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{selectedProduct.name}</h4>
                          <p className="text-gray-600">정가: {selectedProduct.price.toLocaleString()}원</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="targetCount" className="text-sm font-semibold text-gray-700">
                        목표 수량 (최소 주문 개수) *
                      </Label>
                      <div className="relative">
                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="targetCount"
                          type="number"
                          placeholder="20"
                          value={formData.targetCount}
                          onChange={(e) => handleInputChange("targetCount", e.target.value)}
                          className="pl-10 h-12 text-lg border-2 focus:border-purple-600"
                          min="1"
                        />
                      </div>
                      <p className="text-sm text-gray-500">최소 몇 명이 참여해야 공구가 성사되는지 설정하세요.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountedPrice" className="text-sm font-semibold text-gray-700">
                        할인된 가격 (원) *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="discountedPrice"
                          type="number"
                          placeholder="35000"
                          value={formData.discountedPrice}
                          onChange={(e) => handleInputChange("discountedPrice", e.target.value)}
                          className="pl-10 h-12 text-lg border-2 focus:border-purple-600"
                          min="1"
                        />
                      </div>
                      <p className="text-sm text-gray-500">공동구매 시 적용될 할인 가격을 입력하세요.</p>
                    </div>
                  </div>

                  {selectedProduct && formData.discountedPrice && (
                    <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">💰 할인 정보</h4>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{getDiscountPercentage()}%</div>
                          <div className="text-sm text-gray-600">할인율</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{parseInt(formData.discountedPrice).toLocaleString()}원</div>
                          <div className="text-sm text-gray-600">할인 가격</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">-{getSavingsAmount().toLocaleString()}원</div>
                          <div className="text-sm text-gray-600">절약 금액</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Step 3: 상세 정보 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                      공구 제목 *
                    </Label>
                    <Input
                      id="title"
                      placeholder="예: 생화학 교재 공동구매 (20명 모집)"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="h-12 text-lg border-2 focus:border-purple-600"
                    />
                    <p className="text-sm text-gray-500">다른 학생들이 쉽게 이해할 수 있는 제목을 작성하세요.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context" className="text-sm font-semibold text-gray-700">
                      상품 설명 *
                    </Label>
                    <Textarea
                      id="context"
                      placeholder="상품에 대한 자세한 설명을 입력하세요..."
                      value={formData.context}
                      onChange={(e) => handleInputChange("context", e.target.value)}
                      rows={8}
                      className="border-2 focus:border-purple-600 text-base"
                    />
                    <p className="text-sm text-gray-500">상품의 특징, 사용법, 주의사항 등을 자세히 설명해주세요.</p>
                  </div>

                </div>
              )}

              {/* Step 4: 마감 설정 */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">📝 공구 요약</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">상품:</span>
                        <span className="font-medium">{selectedProduct?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">목표 수량:</span>
                        <span className="font-medium">{formData.targetCount}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">할인 가격:</span>
                        <span className="font-medium text-green-600">{parseInt(formData.discountedPrice || "0").toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">절약 금액:</span>
                        <span className="font-medium text-red-600">-{getSavingsAmount().toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endAt" className="text-sm font-semibold text-gray-700">
                      마감일시 *
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="endAt"
                        type="datetime-local"
                        value={formData.endAt}
                        onChange={(e) => handleInputChange("endAt", e.target.value)}
                        className="pl-10 h-12 text-lg border-2 focus:border-purple-600"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <p className="text-sm text-gray-500">공동구매 신청을 받을 마감 날짜와 시간을 설정하세요.</p>
                  </div>

                </div>
              )}

            </CardContent>
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 border-2 border-gray-300 hover:border-purple-600"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    이전 단계
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Link to="/dashboard">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-6 py-3 text-gray-600 hover:bg-gray-100"
                  >
                    취소
                  </Button>
                </Link>
                
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceedToNextStep() || isSubmitting}
                  className={`px-8 py-3 font-semibold transition-all duration-200 ${
                    currentStep === 4
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    "생성 중..."
                  ) : currentStep === 4 ? (
                    "공구 생성하기"
                  ) : (
                    "다음 단계"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
