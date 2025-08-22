// Admin dashboard data types and mock data

export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: "admin" | "moderator" | "support"
  lastLogin: string
  isActive: boolean
}

export interface UserStats {
  totalUsers: number
  verifiedUsers: number
  activeUsers: number
  newUsersThisMonth: number
}

export interface CampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  pendingApproval: number
  totalRevenue: number
}

export interface BNPLStats {
  totalApplications: number
  approvedApplications: number
  activeLoans: number
  overduePayments: number
  totalLoanAmount: number
}

export interface PlatformMetrics {
  userStats: UserStats
  campaignStats: CampaignStats
  bnplStats: BNPLStats
  revenueGrowth: number
  userGrowth: number
}

// Mock admin data
export const mockAdminUser: AdminUser = {
  id: "admin-1",
  email: "admin@heyoung.com",
  fullName: "관리자",
  role: "admin",
  lastLogin: new Date().toISOString(),
  isActive: true,
}

export const mockPlatformMetrics: PlatformMetrics = {
  userStats: {
    totalUsers: 1247,
    verifiedUsers: 1089,
    activeUsers: 892,
    newUsersThisMonth: 156,
  },
  campaignStats: {
    totalCampaigns: 89,
    activeCampaigns: 23,
    completedCampaigns: 61,
    pendingApproval: 5,
    totalRevenue: 45670000,
  },
  bnplStats: {
    totalApplications: 234,
    approvedApplications: 198,
    activeLoans: 156,
    overduePayments: 8,
    totalLoanAmount: 12340000,
  },
  revenueGrowth: 23.5,
  userGrowth: 18.2,
}

export interface AdminNotification {
  id: string
  type: "user_report" | "campaign_flag" | "payment_issue" | "system_alert"
  title: string
  message: string
  priority: "low" | "medium" | "high" | "critical"
  createdAt: string
  isRead: boolean
  actionRequired: boolean
}

export const mockAdminNotifications: AdminNotification[] = [
  {
    id: "admin-notif-1",
    type: "payment_issue",
    title: "BNPL 연체 알림",
    message: "8건의 BNPL 결제가 연체되었습니다. 확인이 필요합니다.",
    priority: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false,
    actionRequired: true,
  },
  {
    id: "admin-notif-2",
    type: "campaign_flag",
    title: "공구 신고 접수",
    message: "iPad 공동구매에 대한 신고가 접수되었습니다.",
    priority: "medium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    actionRequired: true,
  },
  {
    id: "admin-notif-3",
    type: "user_report",
    title: "사용자 신고",
    message: "부적절한 행동으로 신고된 사용자가 있습니다.",
    priority: "medium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isRead: true,
    actionRequired: false,
  },
]
