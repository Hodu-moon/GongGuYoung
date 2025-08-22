"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

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
  logout: () => void
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  studentId: string
  universityId: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (token) {
          // In a real app, verify token with backend
          const userData = localStorage.getItem("user_data")
          if (userData) {
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
      // Mock login - in real app, call your API
      const mockUser: User = {
        id: "1",
        email,
        fullName: "김학생",
        studentId: "2021123456",
        university: {
          id: "1",
          name: "연세대학교",
          domain: "yonsei.ac.kr",
        },
        isVerified: true,
      }

      setUser(mockUser)
      localStorage.setItem("auth_token", "mock_token")
      localStorage.setItem("user_data", JSON.stringify(mockUser))
    } catch (error) {
      throw new Error("로그인에 실패했습니다.")
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      // Mock registration - in real app, call your API
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        fullName: userData.fullName,
        studentId: userData.studentId,
        university: {
          id: userData.universityId,
          name: "연세대학교", // Would be fetched from API
          domain: "yonsei.ac.kr",
        },
        isVerified: false,
      }

      setUser(newUser)
      localStorage.setItem("auth_token", "mock_token")
      localStorage.setItem("user_data", JSON.stringify(newUser))
    } catch (error) {
      throw new Error("회원가입에 실패했습니다.")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
