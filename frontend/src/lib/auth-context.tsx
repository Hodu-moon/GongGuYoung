
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/api/api"

interface User {
  id: string
  email: string
  fullName: string
  studentId?: string
  university?: {
    id: string
    name: string
    domain: string
  }
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1) 쿠키(member) 우선 확인
        const memberCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("member="))
          ?.split("=")[1]

        if (memberCookie) {
          try {
            const base64String = memberCookie.replace(/-/g, "+").replace(/_/g, "/")
            const paddedBase64 = base64String + "=".repeat((4 - (base64String.length % 4)) % 4)

            const binaryString = atob(paddedBase64)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i)
            const utf8String = new TextDecoder("utf-8").decode(bytes)
            const decoded = JSON.parse(utf8String)

            const restoredUser: User = {
              id: decoded.id.toString(),
              email: decoded.email,
              fullName: decoded.name,
              studentId: undefined,
              university: undefined,
              isVerified: true,
            }

            setUser(restoredUser)
            localStorage.setItem("auth_token", decoded.userKey || "")
            localStorage.setItem("user_data", JSON.stringify(restoredUser))
          } catch (e) {
            console.error("쿠키 디코딩 실패:", e)
            document.cookie = "member=; Max-Age=0; path=/"
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
          }
        } else {
          // 2) 로컬스토리지 fallback
          const token = localStorage.getItem("auth_token")
          const userData = localStorage.getItem("user_data")
          if (token && userData) {
            setUser(JSON.parse(userData))
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // axios 사용
      await api.post("/api/v1/login", { email, password })
      console.log("성공한건가?");
      // 로그인 성공 후 쿠키에서 사용자 정보 읽기
      const memberCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("member="))
        ?.split("=")[1]

      if (!memberCookie) {
        throw new Error("로그인 정보가 없습니다.")
      }

      try {
        const base64String = memberCookie.replace(/-/g, "+").replace(/_/g, "/")
        const paddedBase64 = base64String + "=".repeat((4 - (base64String.length % 4)) % 4)

        const binaryString = atob(paddedBase64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i)
        const utf8String = new TextDecoder("utf-8").decode(bytes)
        const decoded = JSON.parse(utf8String)

        const loggedInUser: User = {
          id: decoded.id.toString(),
          email: decoded.email,
          fullName: decoded.name,
          studentId: undefined,
          university: undefined,
          isVerified: true,
        }

        setUser(loggedInUser)
        localStorage.setItem("auth_token", decoded.userKey || "")
        localStorage.setItem("user_data", JSON.stringify(loggedInUser))
      } catch (decodeError) {
        console.error("쿠키 디코딩 실패:", decodeError)
        throw new Error("로그인 정보 처리에 실패했습니다.")
      }
    } catch (error) {
      // 필요 시 서버 메시지 파싱
      // const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined
      throw new Error("아이디 또는 비밀번호가 틀립니다.")
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      await api.post("/api/v1/members", {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      })
      // 회원가입 성공해도 자동 로그인 X (기존 동작 유지)
    } catch (error) {
      throw new Error("회원가입에 실패했습니다.")
    }
  }

  const logout = async () => {
    try {
      await api.post("/api/v1/logout")
    } catch (error) {
      console.error("로그아웃 요청 실패:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
