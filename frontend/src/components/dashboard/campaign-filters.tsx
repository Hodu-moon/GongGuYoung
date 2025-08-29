"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CampaignFiltersProps {
  onFilterChange: (filters: { search: string; status: "all" | "active" | "completed" }) => void;
}

export function CampaignFilters({ onFilterChange }: CampaignFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "completed">("all");

  // 입력 디바운스 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      onFilterChange({
        search: searchTerm,
        status: selectedStatus,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedStatus, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="상품명 또는 키워드 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select
          value={selectedStatus}
          onValueChange={(value: "all" | "active" | "completed") => {
            setSelectedStatus(value);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">진행중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
