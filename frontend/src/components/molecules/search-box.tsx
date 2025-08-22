"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/atoms/icon"

interface SearchBoxProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export function SearchBox({ placeholder = "검색...", onSearch, className }: SearchBoxProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Input placeholder={placeholder} className="flex-1" />
      <Button size="icon" onClick={() => onSearch?.("")}>
        <Icon icon={Search} size="sm" />
      </Button>
    </div>
  )
}
