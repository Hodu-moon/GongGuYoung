import { cn } from "@/lib/utils"

interface PriceDisplayProps {
  amount: number
  currency?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PriceDisplay({ amount, currency = "원", size = "md", className }: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg font-semibold",
    lg: "text-2xl font-bold",
  }

  return (
    <span className={cn(sizeClasses[size], className)}>
      {amount.toLocaleString()}
      {currency}
    </span>
  )
}
