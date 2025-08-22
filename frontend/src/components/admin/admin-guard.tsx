"use client"

import type React from "react"

import { useAdmin } from "@/lib/admin-context"
import { useRouter, usePathname } from "@/compat/navigation";
import { useEffect } from "react"

interface AdminGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AdminGuard({ children, requireAdmin = true }: AdminGuardProps) {
  const { adminUser, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAdmin && !adminUser) {
        router.push("/admin/login")
      } else if (!requireAdmin && adminUser) {
        router.push("/admin/dashboard")
      }
    }
  }, [adminUser, loading, requireAdmin, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (requireAdmin && !adminUser) {
    return null
  }

  if (!requireAdmin && adminUser) {
    return null
  }

  return <>{children}</>
}
