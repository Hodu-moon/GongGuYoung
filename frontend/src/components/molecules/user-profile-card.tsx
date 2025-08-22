import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Typography } from "@/components/atoms/typography"
import { Badge } from "@/components/ui/badge"

interface UserProfileCardProps {
  name: string
  studentId: string
  university: string
  major: string
  avatar?: string
  className?: string
}

export function UserProfileCard({ name, studentId, university, major, avatar, className }: UserProfileCardProps) {
  return (
    <div className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm ${className}`}>
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatar || "/placeholder.svg"} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Typography variant="h4">{name}</Typography>
        <Typography variant="caption">
          {university} / {major}
        </Typography>
        <Badge variant="secondary" className="mt-1">
          {studentId}
        </Badge>
      </div>
    </div>
  )
}
