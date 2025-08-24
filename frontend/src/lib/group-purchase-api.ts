// 공구 API 서비스
export interface GroupPurchaseData {
  id: number
  title: string
  context: string
  targetCount: number
  currentCount: number
  status: string
  endAt: string
  createdAt: string
  productId: number
  productName: string
  productPrice: number
  productImageUrl: string
  productDescription: string
}

export interface ParticipantData {
  id: number
  memberId: number
  groupPurchaseId: number
  isPaid: boolean
  joinedAt: string
  groupPurchase: GroupPurchaseData
}

// API 기본 URL
const API_BASE_URL = '/api/v1'

export class GroupPurchaseApi {
  // 모든 공구 목록 조회
  static async getAllGroupPurchases(): Promise<GroupPurchaseData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/group-purchase`)
      if (!response.ok) {
        throw new Error('Failed to fetch group purchases')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching group purchases:', error)
      // 백엔드 연결이 안될 경우 모의 데이터 반환
      return this.getMockGroupPurchases()
    }
  }

  // 모의 데이터 (백엔드 구조에 맞게 조정)
  private static getMockGroupPurchases(): GroupPurchaseData[] {
    return [
      {
        id: 1,
        title: "생화학 교재 공동구매",
        context: "생화학 수업에 필요한 교재를 함께 구매해요",
        targetCount: 20,
        currentCount: 15,
        status: "ACTIVE",
        endAt: "2024-02-15T23:59:59",
        createdAt: "2024-01-20T10:00:00",
        productId: 1,
        productName: "Campbell Biology 11th Edition",
        productPrice: 95000,
        productImageUrl: "/placeholder.svg",
        productDescription: "생화학 필수 교재"
      },
      {
        id: 2,
        title: "간호학과 실습복 공구",
        context: "간호학과 실습용 유니폼을 공동구매합니다",
        targetCount: 30,
        currentCount: 25,
        status: "ACTIVE", 
        endAt: "2024-02-20T23:59:59",
        createdAt: "2024-01-18T14:30:00",
        productId: 2,
        productName: "간호학과 실습복 세트",
        productPrice: 80000,
        productImageUrl: "/placeholder.svg",
        productDescription: "간호학과 전용 실습복"
      },
      {
        id: 3,
        title: "공학용 계산기 공구",
        context: "공학수학에 필요한 계산기 공동구매",
        targetCount: 15,
        currentCount: 12,
        status: "COMPLETED",
        endAt: "2024-01-30T23:59:59",
        createdAt: "2024-01-10T09:15:00",
        productId: 3,
        productName: "TI-89 Titanium 계산기",
        productPrice: 150000,
        productImageUrl: "/placeholder.svg",
        productDescription: "공학용 고급 계산기"
      }
    ]
  }

  // 사용자가 참여한 공구 목록 (모의 데이터 - 실제 API는 백엔드에서 구현 필요)
  static async getUserParticipatedGroupPurchases(userId: string): Promise<ParticipantData[]> {
    try {
      // TODO: 실제 API 엔드포인트가 생기면 교체
      // const response = await fetch(`${API_BASE_URL}/group-purchase/user/${userId}/participated`)
      
      // 현재는 모의 데이터 반환
      const allPurchases = await this.getAllGroupPurchases()
      
      return [
        {
          id: 1,
          memberId: 1,
          groupPurchaseId: 1,
          isPaid: true,
          joinedAt: "2024-01-21T10:30:00",
          groupPurchase: allPurchases[0]
        },
        {
          id: 2,
          memberId: 1,
          groupPurchaseId: 2,
          isPaid: false,
          joinedAt: "2024-01-22T15:20:00", 
          groupPurchase: allPurchases[1]
        }
      ]
    } catch (error) {
      console.error('Error fetching user participated group purchases:', error)
      return []
    }
  }

  // 사용자가 개설한 공구 목록 (모의 데이터 - 실제 API는 백엔드에서 구현 필요)
  static async getUserCreatedGroupPurchases(userId: string): Promise<GroupPurchaseData[]> {
    try {
      // TODO: 실제 API 엔드포인트가 생기면 교체
      // const response = await fetch(`${API_BASE_URL}/group-purchase/user/${userId}/created`)
      
      // 현재는 모의 데이터 반환
      const allPurchases = await this.getAllGroupPurchases()
      
      // 사용자가 개설한 공구로 가정 (실제로는 createdBy 필드가 필요)
      return [allPurchases[2]] // 공학용 계산기 공구를 개설한 것으로 가정
    } catch (error) {
      console.error('Error fetching user created group purchases:', error)
      return []
    }
  }
}