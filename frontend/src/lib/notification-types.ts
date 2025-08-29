// Notification system types and utilities

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedId?: string // Campaign ID, Order ID, etc.
  actionUrl?: string
  priority: "low" | "medium" | "high"
}

export type NotificationType =
  | "campaign_start"
  | "campaign_complete"
  | "campaign_deadline"
  | "campaign_cancelled"
  | "group_purchase_success"
  | "group_purchase_cancelled"
  | "payment_due"
  | "payment_success"
  | "payment_failed"
  | "bnpl_approved"
  | "bnpl_rejected"
  | "new_campaign"
  | "price_drop"
  | "system_update"

export interface NotificationPreferences {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  categories: {
    campaigns: boolean
    payments: boolean
    bnpl: boolean
    promotions: boolean
    system: boolean
  }
}

export const notificationTypeConfig: Record<
  NotificationType,
  {
    icon: string
    color: string
    category: keyof NotificationPreferences["categories"]
    defaultPriority: "low" | "medium" | "high"
  }
> = {
  campaign_start: {
    icon: "🚀",
    color: "text-blue-600",
    category: "campaigns",
    defaultPriority: "medium",
  },
  campaign_complete: {
    icon: "✅",
    color: "text-green-600",
    category: "campaigns",
    defaultPriority: "high",
  },
  campaign_deadline: {
    icon: "⏰",
    color: "text-orange-600",
    category: "campaigns",
    defaultPriority: "high",
  },
  campaign_cancelled: {
    icon: "❌",
    color: "text-red-600",
    category: "campaigns",
    defaultPriority: "high",
  },
  group_purchase_success: {
    icon: "🎉",
    color: "text-green-600",
    category: "campaigns",
    defaultPriority: "high",
  },
  group_purchase_cancelled: {
    icon: "💸",
    color: "text-orange-600",
    category: "campaigns",
    defaultPriority: "high",
  },
  payment_due: {
    icon: "💳",
    color: "text-red-600",
    category: "payments",
    defaultPriority: "high",
  },
  payment_success: {
    icon: "✅",
    color: "text-green-600",
    category: "payments",
    defaultPriority: "medium",
  },
  payment_failed: {
    icon: "❌",
    color: "text-red-600",
    category: "payments",
    defaultPriority: "high",
  },
  bnpl_approved: {
    icon: "🎉",
    color: "text-green-600",
    category: "bnpl",
    defaultPriority: "high",
  },
  bnpl_rejected: {
    icon: "❌",
    color: "text-red-600",
    category: "bnpl",
    defaultPriority: "high",
  },
  new_campaign: {
    icon: "🆕",
    color: "text-blue-600",
    category: "campaigns",
    defaultPriority: "low",
  },
  price_drop: {
    icon: "📉",
    color: "text-green-600",
    category: "promotions",
    defaultPriority: "medium",
  },
  system_update: {
    icon: "🔧",
    color: "text-gray-600",
    category: "system",
    defaultPriority: "low",
  },
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "방금 전"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
  return date.toLocaleDateString()
}

// FCM payload를 Notification 타입으로 변환하는 유틸리티
export function convertFCMPayloadToNotification(
  payload: any, 
  userId: string
): Omit<Notification, "id" | "createdAt"> {
  // FCM payload에서 알림 타입 추출 (데이터에서 또는 기본값)
  const notificationType = payload.data?.notificationType || "system_update" as NotificationType
  
  // 알림 타입에 따른 설정 가져오기
  const config = notificationTypeConfig[notificationType] || notificationTypeConfig["system_update"]
  
  return {
    userId,
    type: notificationType,
    title: payload.notification?.title || "새로운 알림",
    message: payload.notification?.body || "알림 메시지가 도착했습니다.",
    isRead: false,
    priority: config.defaultPriority,
    relatedId: payload.data?.relatedId,
    actionUrl: payload.data?.actionUrl || payload.data?.click_action
  }
}
