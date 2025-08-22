import { cn } from "@/lib/utils"
import type React from "react"

interface TypographyProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "overline"
  children: React.ReactNode
  className?: string
}

export function Typography({ variant = "body", children, className }: TypographyProps) {
  const baseClasses = {
    h1: "text-3xl font-bold tracking-tight",
    h2: "text-2xl font-semibold tracking-tight",
    h3: "text-xl font-semibold",
    h4: "text-lg font-medium",
    body: "text-base",
    caption: "text-sm text-muted-foreground",
    overline: "text-xs uppercase tracking-wide font-medium text-muted-foreground",
  }

  const Component = variant.startsWith("h") ? (variant as keyof React.JSX.IntrinsicElements) : "p"

  return <Component className={cn(baseClasses[variant], className)}>{children}</Component>
}
