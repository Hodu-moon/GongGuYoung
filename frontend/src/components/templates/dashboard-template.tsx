import type React from "react"
import { NavigationHeader } from "@/components/organisms/navigation-header"

interface DashboardTemplateProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function DashboardTemplate({ children, title, className }: DashboardTemplateProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <NavigationHeader title={title} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
