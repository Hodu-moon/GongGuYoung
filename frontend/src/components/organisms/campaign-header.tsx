"use client"

import { ArrowLeft, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/atoms/typography"
import { Icon } from "@/components/atoms/icon"
import { Badge } from "@/components/ui/badge"

interface CampaignHeaderProps {
  title: string
  status: "active" | "completed" | "pending"
  onBack?: () => void
  onShare?: () => void
  onFavorite?: () => void
  className?: string
}

export function CampaignHeader({ title, status, onBack, onShare, onFavorite, className }: CampaignHeaderProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
  }

  const statusLabels = {
    active: "진행중",
    completed: "완료",
    pending: "대기중",
  }

  return (
    <div className={`bg-hey-gradient text-white p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
          <Icon icon={ArrowLeft} />
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onShare} className="text-white hover:bg-white/20">
            <Icon icon={Share2} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onFavorite} className="text-white hover:bg-white/20">
            <Icon icon={Heart} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
        </div>
        <Typography variant="h2" className="text-white">
          {title}
        </Typography>
      </div>
    </div>
  )
}
