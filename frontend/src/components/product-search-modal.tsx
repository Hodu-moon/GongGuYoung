"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

// Mock product data
const mockProducts = [
  {
    id: "1",
    name: "Campbell Biology 11th Edition",
    price: 89000,
    image: "/biology-textbook.png",
    description: "생물학 전공 필수 교재",
  },
  {
    id: "2",
    name: "간호학과 실습복 세트",
    price: 45000,
    image: "/nursing-uniform.png",
    description: "간호학과 실습용 유니폼",
  },
  {
    id: "3",
    name: "iPad Air 5세대 64GB",
    price: 899000,
    image: "/ipad-tablet.png",
    description: "학습용 태블릿",
  },
  {
    id: "4",
    name: "의학 해부학 교재",
    price: 120000,
    image: "/medical-anatomy-book.png",
    description: "의대생 필수 해부학 교재",
  },
]

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

interface ProductSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduct: (product: Product) => void
}

export function ProductSearchModal({ isOpen, onClose, onSelectProduct }: ProductSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim() === "") {
      setFilteredProducts(mockProducts)
    } else {
      const filtered = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(term.toLowerCase()) ||
          product.description.toLowerCase().includes(term.toLowerCase()),
      )
      setFilteredProducts(filtered)
    }
  }

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product)
    onClose()
    setSearchTerm("")
    setFilteredProducts(mockProducts)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-purple-700">상품 검색</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="상품명을 입력하세요..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Product List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => handleSelectProduct(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <p className="text-lg font-bold text-purple-600 mt-2">{product.price.toLocaleString()}원</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-purple-50 hover:border-purple-300 bg-transparent"
                      >
                        선택
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm">다른 키워드로 검색해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
