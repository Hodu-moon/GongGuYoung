import type React from "react"
import { CampaignHeader } from "@/components/organisms/campaign-header"

interface CampaignTemplateProps {
  children: React.ReactNode
  title: string
  category: string
  status: "active" | "completed" | "pending"
  onBack?: () => void
  className?: string
}

export function CampaignTemplate({ children, title, category, status, onBack, className }: CampaignTemplateProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <CampaignHeader title={title} category={category} status={status} onBack={onBack} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
