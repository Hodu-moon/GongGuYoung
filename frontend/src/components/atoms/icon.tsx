import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconProps {
  icon: LucideIcon
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Icon({ icon: IconComponent, size = "md", className }: IconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  }

  return <IconComponent className={cn(sizeClasses[size], className)} />
}
