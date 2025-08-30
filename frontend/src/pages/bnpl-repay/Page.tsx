import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  fetchBNPLRemain,
  fetchBNPLItems,
  postBnplRepay,
  type BNPLRemain,
  type BNPLItem,
} from "@/api/Payment";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Bell,
  User,
  Plus,
} from "lucide-react";
import Image from "@/compat/NextImage";

export default function BnplRepayPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bnplItems, setBnplItems] = useState<BNPLItem[]>([]);
  const [bnplRemain, setBnplRemain] = useState<BNPLRemain | null>(null);
  const [starterBalance, setStarterBalance] = useState<number>(0);
  const [isLoadingBnpl, setIsLoadingBnpl] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [repayAmount, setRepayAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // BNPL 데이터 및 잔액 로드
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setIsLoadingBnpl(true);
      setIsLoadingBalance(true);

      try {
        const [remain, items, balanceResponse] = await Promise.all([
          fetchBNPLRemain(user.id),
          fetchBNPLItems(user.id),
          fetch(`/api/v1/members/${user.id}/starter-balance`),
        ]);

        setBnplRemain(remain);
        setBnplItems(items || []);

        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setStarterBalance(balanceData.starterBalance || 0);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoadingBnpl(false);
        setIsLoadingBalance(false);
      }
    };

    loadData();
  }, [user?.id]);

  // 상환 대상 아이템들 (PROCESSING 상태이면서 금액이 0원보다 큰 것들만)
  const processingItems = bnplItems.filter(
    (item) => item.bnplstatus === "PROCESSING" && item.bnplAmount > 0
  );

  // 총 상환 금액 (BNPL 사용 중인 금액과 동일)
  const totalRepayAmount = bnplRemain
    ? bnplRemain.bnplLimit - bnplRemain.remain
    : 0;

  // 상환 처리
  const handleRepay = async () => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    const amount = parseInt(repayAmount);
    if (!amount || amount <= 0) {
      alert("올바른 금액을 입력해주세요.");
      return;
    }

    if (amount > totalRepayAmount) {
      alert("상환할 금액이 총 상환 금액보다 클 수 없습니다.");
      return;
    }

    if (amount > starterBalance) {
      alert("보유 금액이 부족합니다.");
      return;
    }

    setIsProcessing(true);

    try {
      // 부분 상환의 경우 금액 비례로 각 아이템에서 차감
      let remainingAmount = amount;
      const repayPromises = [];

      for (const item of processingItems) {
        if (remainingAmount <= 0) break;

        const itemRepayAmount =
          amount === totalRepayAmount
            ? item.bnplAmount // 전체 상환인 경우 해당 아이템 전액
            : Math.min(
                Math.floor((item.bnplAmount / totalRepayAmount) * amount),
                remainingAmount
              ); // 비례 상환

        if (itemRepayAmount > 0) {
          repayPromises.push(
            postBnplRepay({
              paymentId: item.paymentId,
              memberId: user.id,
              amount: itemRepayAmount,
            })
          );
          remainingAmount -= itemRepayAmount;
        }
      }

      const results = await Promise.all(repayPromises);
      const successCount = results.filter((result) => result).length;

      if (successCount > 0) {
        // 잔액 업데이트: 상환한 금액만큼 차감
        try {
          const updatedBalanceResponse = await fetch(
            `/api/v1/members/${user.id}/starter-balance`
          );
          if (updatedBalanceResponse.ok) {
            const balanceData = await updatedBalanceResponse.json();
            setStarterBalance(balanceData.starterBalance || 0);
          }
        } catch (error) {
          console.error("Failed to update balance:", error);
        }

        alert(`${amount.toLocaleString()}원 상환이 완료되었습니다.`);
        navigate("/my-page");
      } else {
        alert("상환 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Repay error:", error);
      alert("상환 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase() === "processing") {
      return <Badge className="bg-orange-100 text-orange-700">상환 대기</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-700">상환 완료</Badge>;
    }
  };

  if (isLoadingBnpl || isLoadingBalance) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-hey-gradient flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">데이터를 불러오는 중...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-hey-gradient">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/favicon.png"
                  alt="GongGuYoung Smart Campus"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">GongGuYoung</h1>
                  <p className="text-xs text-white/80">Smart Campus</p>
                </div>
              </Link>
              <div className="flex gap-1">
                <Link to="/notifications">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
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
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              to="/my-page"
              className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              마이페이지로 돌아가기
            </Link>
            <h1 className="text-4xl font-bold mb-2 text-white">BNPL 상환</h1>
            <p className="text-white/90 text-lg">
              보유 금액으로 BNPL 상환을 진행하세요
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - 상환 정보 */}
            <div className="space-y-6">
              {/* 보유 금액 */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="w-5 h-5" />
                    보유 금액
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {starterBalance.toLocaleString()}원
                    </div>
                    <p className="text-green-700">사용 가능한 잔액</p>
                  </div>
                </CardContent>
              </Card>

              {/* 상환 정보 요약 */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <CreditCard className="w-5 h-5" />
                    상환 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {totalRepayAmount.toLocaleString()}원
                      </div>
                      <div className="text-sm text-red-700">총 상환 금액</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {processingItems.length}개
                      </div>
                      <div className="text-sm text-blue-700">
                        상환 대상 아이템
                      </div>
                    </div>
                  </div>

                  {starterBalance < totalRepayAmount && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-orange-800">
                          잔액 부족
                        </span>
                      </div>
                      <p className="text-sm text-orange-700">
                        보유 금액이 부족하여 부분 상환만 가능합니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 상환 금액 입력 */}
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <CreditCard className="w-5 h-5" />
                    상환 금액 입력
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="repayAmount"
                      className="text-sm font-medium text-gray-700"
                    >
                      상환할 금액 (원)
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="repayAmount"
                        type="number"
                        placeholder="상환할 금액을 입력하세요"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        min="1"
                        max={Math.min(totalRepayAmount, starterBalance)}
                        className="flex-1"
                        disabled={isProcessing}
                      />
                      <span className="flex items-center text-gray-600">
                        원
                      </span>
                    </div>
                  </div>

                  {/* 빠른 선택 버튼 */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setRepayAmount(
                          Math.min(totalRepayAmount, starterBalance).toString()
                        )
                      }
                      disabled={isProcessing}
                      className="text-sm"
                    >
                      최대 금액
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setRepayAmount(totalRepayAmount.toString())
                      }
                      disabled={
                        isProcessing || starterBalance < totalRepayAmount
                      }
                      className="text-sm"
                    >
                      전체 상환
                    </Button>
                  </div>

                  <Button
                    onClick={handleRepay}
                    disabled={
                      !repayAmount ||
                      isProcessing ||
                      parseInt(repayAmount) <= 0 ||
                      parseInt(repayAmount) >
                        Math.min(totalRepayAmount, starterBalance)
                    }
                    className="w-full bg-hey-gradient hover:opacity-90"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        상환 처리 중...
                      </>
                    ) : (
                      `${
                        repayAmount
                          ? parseInt(repayAmount).toLocaleString()
                          : "0"
                      }원 상환하기`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 상환 대상 목록 */}
            <div>
              <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Clock className="w-5 h-5" />
                    상환 대상 목록 ({processingItems.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processingItems.length > 0 ? (
                    <div className="space-y-4">
                      {processingItems.map((item) => (
                        <div
                          key={item.paymentId}
                          className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.itemImageUrl || "/placeholder.svg"}
                                alt={item.itemName}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <h3 className="font-semibold text-purple-800">
                                  {item.itemName}
                                </h3>
                                <p className="text-sm text-purple-600">
                                  {item.groupPurchaseTitle}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(item.bnplstatus)}
                              <div className="text-lg font-bold text-red-600 mt-1">
                                {item.bnplAmount.toLocaleString()}원
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            결제 ID: #{item.paymentId}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-purple-600">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-semibold">
                        상환할 BNPL이 없습니다!
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        모든 BNPL 상환이 완료되었습니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
