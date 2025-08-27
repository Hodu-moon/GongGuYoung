import { api } from "@/api/api";

// ===== 백엔드 원본 타입 =====
export interface GroupPurchaseData {
  id: number;
  title: string;
  context: string;
  targetCount: number;
  currentCount: number;
  status: string; // WAITING | ACTIVE | COMPLETED | CANCELLED ...
  endAt: string; // ISO
  createdAt: string; // ISO
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  productDescription: string;
  viewCount: number;
}

export interface ParticipantData {
  id: number;
  memberId: number;
  groupPurchaseId: number;
  isPaid: boolean;
  joinedAt: string;
  groupPurchase: GroupPurchaseData;
}

// ===== 새로운 회원 참여 공구 API 타입 =====
export interface MemberGroupPurchaseData {
  id: number;
  title: string;
  context: string;
  targetCount: number;
  currentCount: number;
  status: string;
  endAt: string;
  createdAt: string;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  productDescription: string;
  viewCount: number;
  isPaid: boolean; // 해당 회원의 결제 여부
  joinedAt: string; // 참여 일시
}

// ===== UI에서 쓰기 쉬운 타입 =====
export type UICampaign = {
  id: string;
  title: string;
  description: string;
  status: "WAITING" | "COMPLETE" | "CANCELLED";
  startDate?: string;
  endDate: string;
  createdAt?: string;
  participants: number;
  discountPrice: number;
  product: {
    name: string;
    originalPrice: number;
    imageUrl: string;
  };
  targetQuantity: number;
  currentQuantity: number;
  viewCount: number;
};

// API 기본 URL
const API_BASE_URL = "/api/v1";

export class GroupPurchaseApi {
  // 모든 공구 목록 조회 (백엔드 원본 타입)
  static async getAllGroupPurchases(): Promise<GroupPurchaseData[]> {
    try {
      const res = await api.get<GroupPurchaseData[]>(
        `${API_BASE_URL}/group-purchase`
      );
      return res.data;
    } catch (err) {
      console.error("Error fetching group purchases:", err);
      return [];
    }
  }

  // === (선택) 사용자가 참여/개설 목록: 필요 시 교체 ===
  static async getUserParticipatedGroupPurchases(
    userId: string
  ): Promise<ParticipantData[]> {
    try {
      const all = await this.getAllGroupPurchases();
      return [
        {
          id: 1,
          memberId: Number(userId) || 1,
          groupPurchaseId: all[0]?.id ?? 1,
          isPaid: true,
          joinedAt: "2024-01-21T10:30:00",
          groupPurchase: all[0],
        },
        {
          id: 2,
          memberId: Number(userId) || 1,
          groupPurchaseId: all[1]?.id ?? 2,
          isPaid: false,
          joinedAt: "2024-01-22T15:20:00",
          groupPurchase: all[1],
        },
      ];
    } catch (error) {
      console.error("Error fetching user participated group purchases:", error);
      return [];
    }
  }

  static async getUserCreatedGroupPurchases(
    userId: string
  ): Promise<GroupPurchaseData[]> {
    try {
      const all = await this.getAllGroupPurchases();
      return [all[2]].filter(Boolean) as GroupPurchaseData[];
    } catch (error) {
      console.error("Error fetching user created group purchases:", error);
      return [];
    }
  }

  // === 어댑터: 백엔드 응답 -> UI에서 쓰기 편한 형태 ===
  static adaptToUI(gp: GroupPurchaseData): UICampaign {
    const now = Date.now();
    const end = new Date(gp.endAt).getTime();

    // 우선순위: CANCELLED -> COMPLETE(마감) -> WAITING
    let status: UICampaign["status"];
    const raw = (gp.status || "").toUpperCase();
    if (raw === "CANCELLED" || raw === "CANCELED") status = "CANCELLED";
    else if (end <= now || raw === "COMPLETED") status = "COMPLETE";
    else status = "WAITING";

    return {
      id: String(gp.id),
      title: gp.title,
      description: gp.context ||gp.productDescription  || "",
      status,
      endDate: gp.endAt,
      createdAt: gp.createdAt,
      participants: gp.currentCount ?? 0,
      discountPrice: gp.productPrice, // 별도 할인값 없으면 productPrice 사용
      product: {
        name: gp.productName,
        originalPrice: gp.productPrice,
        imageUrl: gp.productImageUrl || "/placeholder.svg",
      },
      targetQuantity: gp.targetCount ?? 0,
      currentQuantity: gp.currentCount ?? 0,
      viewCount: gp.viewCount ?? 0,
    };
  }

  // 대시보드에서 바로 쓰게: API 호출 + 어댑트까지
  static async fetchDashboardCampaigns(): Promise<UICampaign[]> {
    const raw = await this.getAllGroupPurchases();
    console.log("대시보드", raw);
    return raw.map(this.adaptToUI);
  }

  //단건 조회용
  static async getGroupPurchaseById(id: string): Promise<UICampaign | null> {
    try {
      const res = await api.get<GroupPurchaseData>(
        `${API_BASE_URL}/group-purchase/${id}`,{
          params:{
            increaseViewCount:true,
          }
        }
      );
      console.log("단건 조회",res);
      return this.adaptToUI(res.data);
    } catch (err) {
      console.error("Error fetching group purchase detail:", err);
      return null;
    }
  }
  // === 모의 데이터 ===
  // private static getMockGroupPurchases(): GroupPurchaseData[] {
  //   return [
  //     {
  //       id: 1,
  //       title: "생화학 교재 공동구매",
  //       context: "생화학 수업에 필요한 교재를 함께 구매해요",
  //       targetCount: 20,
  //       currentCount: 15,
  //       status: "ACTIVE",
  //       endAt: "2026-12-31T23:59:59",
  //       createdAt: "2025-08-01T10:00:00",
  //       productId: 1,
  //       productName: "Campbell Biology 11th Edition",
  //       productPrice: 95000,
  //       productImageUrl: "/placeholder.svg",
  //       productDescription: "생화학 필수 교재",
  //     },
  //     {
  //       id: 2,
  //       title: "간호학과 실습복 공구",
  //       context: "간호학과 실습용 유니폼을 공동구매합니다",
  //       targetCount: 30,
  //       currentCount: 25,
  //       status: "ACTIVE",
  //       endAt: "2026-11-30T23:59:59",
  //       createdAt: "2025-08-10T14:30:00",
  //       productId: 2,
  //       productName: "간호학과 실습복 세트",
  //       productPrice: 80000,
  //       productImageUrl: "/placeholder.svg",
  //       productDescription: "간호학과 전용 실습복",
  //     },
  //     {
  //       id: 3,
  //       title: "공학용 계산기 공구",
  //       context: "공학수학에 필요한 계산기 공동구매",
  //       targetCount: 15,
  //       currentCount: 12,
  //       status: "COMPLETED",
  //       endAt: "2024-01-30T23:59:59",
  //       createdAt: "2024-01-10T09:15:00",
  //       productId: 3,
  //       productName: "TI-89 Titanium 계산기",
  //       productPrice: 150000,
  //       productImageUrl: "/placeholder.svg",
  //       productDescription: "공학용 고급 계산기",
  //     },
  //   ];
  // }

  // 새로운 API: 회원의 참여한 공구 목록 조회
  static async getMemberGroupPurchases(memberId: string): Promise<MemberGroupPurchaseData[]> {
    try {
      const response = await api.get(`${API_BASE_URL}/group-purchase/member/${memberId}`);
      console.log('Member group purchases response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch member group purchases:', error);
      return [];
    }
  }
}
