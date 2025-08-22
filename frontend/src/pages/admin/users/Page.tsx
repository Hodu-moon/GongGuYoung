

import { useState } from "react"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Filter, MoreHorizontal, Shield, Ban } from "lucide-react"

// Mock user data
const mockUsers = [
  {
    id: "1",
    email: "student1@yonsei.ac.kr",
    fullName: "김학생",
    university: "연세대학교",
    studentId: "2021123456",
    isVerified: true,
    isActive: true,
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20",
    campaignsJoined: 5,
    bnplActive: 2,
  },
  {
    id: "2",
    email: "student2@korea.ac.kr",
    fullName: "이학생",
    university: "고려대학교",
    studentId: "2020987654",
    isVerified: true,
    isActive: true,
    joinDate: "2024-01-10",
    lastLogin: "2024-01-19",
    campaignsJoined: 3,
    bnplActive: 1,
  },
  {
    id: "3",
    email: "student3@snu.ac.kr",
    fullName: "박학생",
    university: "서울대학교",
    studentId: "2022111111",
    isVerified: false,
    isActive: true,
    joinDate: "2024-01-18",
    lastLogin: "2024-01-20",
    campaignsJoined: 1,
    bnplActive: 0,
  },
]

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.includes(searchTerm)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && user.isVerified) ||
      (statusFilter === "unverified" && !user.isVerified) ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)

    const matchesUniversity = universityFilter === "all" || user.university === universityFilter

    return matchesSearch && matchesStatus && matchesUniversity
  })

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              사용자 관리
            </h1>
            <p className="text-gray-600 mt-2">플랫폼 사용자를 관리하고 모니터링하세요.</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                필터 및 검색
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="이름, 이메일, 학번으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="verified">인증됨</SelectItem>
                    <SelectItem value="unverified">미인증</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={universityFilter} onValueChange={setUniversityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 대학</SelectItem>
                    <SelectItem value="연세대학교">연세대학교</SelectItem>
                    <SelectItem value="고려대학교">고려대학교</SelectItem>
                    <SelectItem value="서울대학교">서울대학교</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자 정보</TableHead>
                    <TableHead>대학교</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>활동</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">학번: {user.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.university}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={user.isVerified ? "default" : "secondary"}>
                            {user.isVerified ? "인증됨" : "미인증"}
                          </Badge>
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "활성" : "비활성"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>공구 참여: {user.campaignsJoined}회</p>
                          <p>BNPL 활성: {user.bnplActive}건</p>
                          <p className="text-xs text-gray-500">최근 로그인: {user.lastLogin}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Shield className="w-3 h-3 mr-1" />
                            인증
                          </Button>
                          <Button size="sm" variant="outline">
                            <Ban className="w-3 h-3 mr-1" />
                            정지
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
