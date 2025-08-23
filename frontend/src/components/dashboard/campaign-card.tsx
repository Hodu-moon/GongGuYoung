import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { GroupCampaign } from "@/lib/mock-data"
import { Link } from "react-router-dom";

interface CampaignCardProps {
  campaign: GroupCampaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage = (campaign.currentQuantity / campaign.targetQuantity) * 100
  const discountPercentage = Math.round(
    ((campaign.product.originalPrice - campaign.discountPrice) / campaign.product.originalPrice) * 100,
  )
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="hover:shadow-xl transition-all duration-500 border-gray-200 hover:border-gray-300 hover-lift animate-scale-in group bg-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge
            variant={
              campaign.status === "active" ? "default" : campaign.status === "completed" ? "secondary" : "destructive"
            }
            className={`${campaign.status === "active" ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" : ""} transition-all duration-300`}
          >
            {campaign.status === "active" ? "진행중" : campaign.status === "completed" ? "완료" : "취소"}
          </Badge>
        </div>
        <CardTitle className="text-lg text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
          {campaign.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <img
            src={campaign.product.imageUrl || "/placeholder.svg"}
            alt={campaign.product.name}
            className="w-20 h-20 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 hover:shadow-md"
          />
          <div className="flex-1">
            <h4 className="font-medium text-sm">{campaign.product.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>진행률</span>
            <span>
              {campaign.currentQuantity}/{campaign.targetQuantity}명
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-pink-600 [&>div]:transition-all [&>div]:duration-1000"
          />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-800">{campaign.discountPrice.toLocaleString()}원</span>
              <Badge variant="destructive" className="text-xs">
                {discountPercentage}% 할인
              </Badge>
            </div>
            <span className="text-sm text-gray-500 line-through">
              {campaign.product.originalPrice.toLocaleString()}원
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{campaign.status === "active" ? `${daysLeft}일 남음` : "마감"}</div>
          </div>
        </div>

        <Link to={`/campaigns/${campaign.id}`}>
          <Button
            className={`w-full transition-all duration-300 ${campaign.status === "active" ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-lg" : ""}`}
            disabled={campaign.status !== "active"}
          >
            {campaign.status === "active" ? "참여하기" : campaign.status === "completed" ? "완료됨" : "취소됨"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
