import { Typography } from "@/components/atoms/typography"
import { Progress } from "@/components/ui/progress"
import { PriceDisplay } from "@/components/atoms/price-display"

interface CampaignStatsProps {
  currentParticipants: number
  targetParticipants: number
  currentPrice: number
  targetPrice: number
  className?: string
}

export function CampaignStats({
  currentParticipants,
  targetParticipants,
  currentPrice,
  targetPrice,
  className,
}: CampaignStatsProps) {
  const progress = (currentParticipants / targetParticipants) * 100

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Typography variant="caption">참여 현황</Typography>
          <Typography variant="caption">
            {currentParticipants}/{targetParticipants}명
          </Typography>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex justify-between items-center">
        <Typography variant="caption">현재 가격</Typography>
        <PriceDisplay amount={currentPrice} size="md" />
      </div>

      <div className="flex justify-between items-center">
        <Typography variant="caption">목표 가격</Typography>
        <PriceDisplay amount={targetPrice} size="md" className="text-green-600" />
      </div>
    </div>
  )
}
