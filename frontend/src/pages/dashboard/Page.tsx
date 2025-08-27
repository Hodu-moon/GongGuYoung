import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/dashboard/campaign-card";
import { CampaignFilters } from "@/components/dashboard/campaign-filters";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Link } from "react-router-dom";
import Image from "@/compat/NextImage";
import {
  Plus,
  Users,
  ShoppingCart,
  TrendingUp,
  User,
  Clock,
  Star,
  ArrowRight,
  Heart,
  Trophy,
  Eye,
} from "lucide-react";
import { GroupPurchaseApi, type UICampaign } from "@/lib/group-purchase-api";

// === 기존 CampaignCard가 기대하는 형태로 변환 ===
type LegacyCardModel = {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "cancelled";
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
  endDate: string;
  viewCount: number;
};
function RankEmblem({ rank }: { rank: number }) {
  const styles = [
    {
      bg: "from-yellow-300 to-amber-500",
      ring: "ring-amber-300",
      icon: "text-amber-800",
    }, // 1위
    {
      bg: "from-gray-200 to-gray-400",
      ring: "ring-gray-300",
      icon: "text-gray-700",
    }, // 2위
    {
      bg: "from-orange-300 to-amber-600",
      ring: "ring-orange-300",
      icon: "text-amber-900",
    }, // 3위
  ];
  const s = styles[Math.min(rank - 1, 2)];

  return (
    <div
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full
                  bg-gradient-to-br ${s.bg} ring-2 ${s.ring} shadow-md`}
      aria-label={`${rank}위`}
      title={`${rank}위`}
    >
      <Trophy className={`w-5 h-5 ${s.icon}`} />
    </div>
  );
}
function toLegacyCardModel(c: UICampaign): LegacyCardModel {
  // UICampaign.status -> legacy status
  const legacyStatus: LegacyCardModel["status"] =
    c.status === "CANCELLED"
      ? "cancelled"
      : c.status === "COMPLETE"
      ? "completed"
      : "active";
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    status: legacyStatus,
    createdAt: c.createdAt,
    participants: c.participants,
    discountPrice: c.discountPrice,
    product: {
      name: c.product.name,
      originalPrice: c.product.originalPrice,
      imageUrl: c.product.imageUrl,
    },
    targetQuantity: c.targetQuantity,
    currentQuantity: c.currentQuantity,
    endDate: c.endDate,
    viewCount: c.viewCount,
  };
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    category: "전체",
    search: "",
    status: "all" as "all" | "active" | "completed",
  });

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<UICampaign[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await GroupPurchaseApi.fetchDashboardCampaigns();
      if (mounted) {
        setList(data);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 파생 데이터
  const legacy = useMemo(() => list.map(toLegacyCardModel), [list]);

  const filteredCampaigns = useMemo(() => {
    // 상태 필터: 진행중/완료를 마감일로도 보정하고 싶다면 여기서 Date 비교 가능
    const now = Date.now();

    return legacy.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        campaign.product.name
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      const end = new Date(campaign.endDate).getTime();
      const derived =
        end <= now
          ? "completed"
          : campaign.status === "cancelled"
          ? "cancelled"
          : "active";

      const matchesStatus =
        filters.status === "all" ? true : derived === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [legacy, filters]);

  const stats = useMemo(() => {
    const activeCount = legacy.filter((c) => {
      const end = new Date(c.endDate).getTime();
      return end > Date.now() && c.status !== "cancelled";
    }).length;

    const completedCount = legacy.filter((c) => {
      const end = new Date(c.endDate).getTime();
      return end <= Date.now();
    }).length;

    const totalParticipants = legacy.reduce(
      (sum, c) => sum + c.participants,
      0
    );
    const totalFunding = legacy.reduce(
      (sum, c) => sum + c.discountPrice * c.participants,
      0
    );

    return {
      activeCampaigns: activeCount,
      totalParticipants,
      completedCampaigns: completedCount,
      totalFunding,
    };
  }, [legacy]);
  function getDiscountRate(targetQuantity: number): number {
    if (targetQuantity >= 61) return 10;
    if (targetQuantity >= 41) return 8;
    if (targetQuantity >= 21) return 5;
    if (targetQuantity >= 11) return 3;
    return 0;
  }
  // 인기/최신
  const trendingCampaigns = useMemo(
    () =>
      legacy
        .filter(
          (c) =>
            c.status === "active" && new Date(c.endDate).getTime() > Date.now()
        )
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 3),
    [legacy]
  );

  const recentCampaigns = useMemo(
    () =>
      legacy
        .filter(
          (c) =>
            c.status === "active" && new Date(c.endDate).getTime() > Date.now()
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt || Date.now()).getTime() -
            new Date(a.createdAt || Date.now()).getTime()
        )
        .slice(0, 2),
    [legacy]
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-hey-gradient">
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/hey-young-logo.png"
                  alt="Hey Young Smart Campus"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">Hey Young</h1>
                  <p className="text-xs text-white/80">Smart Campus</p>
                </div>
              </Link>
              <div className="flex gap-1">
                <NotificationBell />
                <Link to="/my-page">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/create-campaign">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  onClick={logout}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Hero */}
          <div className="mb-8">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-purple-800 mb-2">
                      새로운 공동구매를 시작해보세요!
                    </h2>
                    <p className="text-purple-600">
                      더 많은 사람들과 함께 할인 혜택을 누리고, 원하는 상품을 더
                      저렴하게 구매하세요.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/create-campaign">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        <Plus className="w-5 h-5 mr-2" />
                        공동구매 만들기
                      </Button>
                    </Link>
                    <Link to="/campaigns">
                      <Button
                        variant="outline"
                        className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-3 text-lg font-semibold"
                      >
                        전체 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 로딩/에러/빈 상태 */}
          {loading ? (
            <div className="p-12 text-center text-white/90">불러오는 중…</div>
          ) : (
            <>
              {/* Trending & Recent */}
              <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Trending */}
                <div className="lg:col-span-2">
                  <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-orange-500" />
                          <CardTitle className="text-xl text-purple-800">
                            인기 공동구매
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-600"
                          >
                            HOT
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {trendingCampaigns.map((campaign, index) => (
                        <div
                          key={campaign.id}
                          className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-lg hover:bg-purple-100/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <RankEmblem rank={index + 1} />
                          </div>
                          <img
                            src={
                              campaign.product.imageUrl || "/placeholder.svg"
                            }
                            alt={campaign.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-purple-900 truncate">
                              {campaign.title}
                            </h4>
                            <p className="text-sm text-purple-600 flex items-center gap-2 mt-1">
                              <Users className="h-4 w-4" />
                              {campaign.participants}명 참여
                              <Eye className="h-3 w-3" />
                              {campaign.viewCount}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-700">
                              {(
                                campaign.discountPrice *
                                (100 -
                                  getDiscountRate(campaign.targetQuantity)) *
                                0.01
                              ).toLocaleString()}
                              원
                            </p>
                            <Badge
                              variant="destructive"
                              className="text-xs bg-pink-500"
                            >
                              {/* 임시 할인율: 원가 동일 시 0% */}
                              {getDiscountRate(campaign.targetQuantity)}% 할인
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent */}
                <div>
                  <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-xl text-purple-800">
                          최신 공구
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentCampaigns.map((campaign) => (
                        <Link
                          key={campaign.id}
                          to={`/campaigns/${campaign.id}`}
                          className="block"
                        >
                          <div className="p-4 border border-purple-200/50 bg-purple-50/30 rounded-lg hover:border-purple-300 hover:bg-purple-100/40 hover:shadow-md transition-all duration-200">
                            <div className="flex gap-3">
                              <img
                                src={
                                  campaign.product.imageUrl ||
                                  "/placeholder.svg"
                                }
                                alt={campaign.product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-purple-900 text-sm mb-2 line-clamp-2">
                                  {campaign.title}
                                </h4>
                                <div className="text-xs text-purple-600 mb-2 flex items-center gap-2">
                                  <Eye className="h-3 w-3" />
                                  {campaign.viewCount}
                                  <Users className="h-3 w-3 ml-2" />
                                  {campaign.participants}
                                </div>
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-purple-300 text-purple-700"
                                  >
                                    NEW
                                  </Badge>
                                  <p className="text-sm font-bold text-purple-700">
                                    {(
                                      campaign.discountPrice *
                                      (100 -
                                        getDiscountRate(
                                          campaign.targetQuantity
                                        )) *
                                      0.01
                                    ).toLocaleString()}
                                    원
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Filters */}
              <CampaignFilters
                onFilterChange={(f) => setFilters((s) => ({ ...s, ...f }))}
              />

              {/* Grid */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    전체 공동구매 {filteredCampaigns.length}개
                  </h2>
                </div>

                {filteredCampaigns.length > 0 ? (
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCampaigns.map((c) => (
                      <CampaignCard key={c.id} campaign={c as any} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingCart className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        조건에 맞는 공동구매가 없습니다
                      </h3>
                      <p className="text-gray-500 mb-6">
                        새로운 공동구매를 만들어 다른 사용자들과 함께 혜택을
                        누려보세요!
                      </p>
                      <Link to="/create-campaign">
                        <Button className="bg-hey-gradient hover:opacity-90 text-white">
                          <Plus className="w-4 h-4 mr-2" />새 공구 만들기
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
