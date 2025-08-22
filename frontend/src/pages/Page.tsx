

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Link } from 'react-router-dom'
import Image from '@/compat/NextImage'
import { Bell, QrCode, CreditCard, Plus } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-hey-gradient">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/hey-young-logo.png"
                alt="Hey Young Smart Campus"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Hey Young</h1>
                <p className="text-xs text-white/80">Smart Campus</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <CreditCard className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <QrCode className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Left Column - Student ID Card */}
          <div className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center pb-2">
                <p className="text-sm text-gray-600">공학대 학생증</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">👩‍🎓</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">공학대/컴퓨터</p>
                    <p className="font-bold text-lg">{user ? user.fullName : "헤이영(202412345)"}</p>
                  </div>
                </div>
                <Button className="w-full bg-hey-gradient hover:opacity-90 text-white">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR 코드
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-gray-800">빠른 실행</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/dashboard">
                    <Button className="w-full bg-hey-gradient hover:opacity-90 text-white text-sm">
                      <Plus className="w-4 h-4 mr-1" />
                      공구 참여
                    </Button>
                  </Link>
                  <Link to="/bnpl">
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 text-sm bg-transparent"
                    >
                      BNPL 조회
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - MY메뉴 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">MY메뉴</h2>
              <Button variant="ghost" size="sm">
                ⋯
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  📋
                </div>
                <span className="text-xs text-gray-700 text-center">공지사항</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  📚
                </div>
                <span className="text-xs text-gray-700 text-center">학사정보</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  📊
                </div>
                <span className="text-xs text-gray-700 text-center">출결조회</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  🧩
                </div>
                <span className="text-xs text-gray-700 text-center">퀴즈</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                  🏛️
                </div>
                <span className="text-xs text-gray-700 text-center">도서관</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                  📢
                </div>
                <span className="text-xs text-gray-700 text-center">공지사항</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  ⚙️
                </div>
                <span className="text-xs text-gray-700 text-center">설정</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center">
                  🏢
                </div>
                <span className="text-xs text-gray-700 text-center">행정실 예약</span>
              </Link>

              <Link to="/dashboard"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                  🔒
                </div>
                <span className="text-xs text-gray-700 text-center">전자출입구</span>
              </Link>
            </div>

            {!user && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Link to="/auth/login" className="flex-1">
                    <Button className="w-full bg-hey-gradient hover:opacity-90 text-white">로그인</Button>
                  </Link>
                  <Link to="/auth/register" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
                    >
                      회원가입
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
