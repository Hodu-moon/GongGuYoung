import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/compat/navigation";
import { useSearchParams } from "react-router-dom";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Download,
  Share2,
  Calendar,
  CreditCard,
  Package,
  User,
  ArrowLeft,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useNotifications } from "@/lib/notification-context";
import Image from "@/compat/NextImage";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const notificationSentRef = useRef(false);

  useEffect(() => {
    // URL 파라미터에서 실제 결제 정보 가져오기
    const orderId = searchParams.get("orderId");
    const paymentMethod = searchParams.get("method");
    const amount = searchParams.get("amount");
    const campaignId = searchParams.get("campaignId");
    const productName = searchParams.get("productName");
    const quantity = searchParams.get("quantity");

    // 분할 결제 정보
    const splitPayment = searchParams.get("splitPayment") === "true";
    const bnplAmount = parseInt(searchParams.get("bnplAmount") || "0");
    const cashAmount = parseInt(searchParams.get("cashAmount") || "0");

    // 이미 알림이 전송되었으면 중단 (useRef 사용)
    if (notificationSentRef.current) {
      return;
    }

    setTimeout(() => {
      let paymentMethodText = "일반 계좌";
      let statusText = "결제 완료";

      if (paymentMethod === "bnpl") {
        if (splitPayment) {
          paymentMethodText = "분할 결제 (BNPL + 일반계좌)";
          statusText = "결제 완료 (분할)";
        } else {
          paymentMethodText = "BNPL 계좌";
          statusText = "결제 완료 (BNPL 계좌)";
        }
      }

      const finalOrderData = {
        orderId: orderId || "ORDER-" + Date.now(),
        campaignId: campaignId || "1",
        productName: productName || "Campbell Biology 11th Edition",
        quantity: parseInt(quantity || "1"),
        amount: parseInt(amount || "75000"),
        paymentMethod: paymentMethodText,
        orderDate: new Date().toLocaleString("ko-KR"),
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("ko-KR"),
        status: statusText,
        // 분할 결제 정보 추가
        splitPayment,
        bnplAmount,
        cashAmount,
      };

      setOrderData(finalOrderData);

      // 알림이 아직 전송되지 않았을 때만 전송 (useRef 사용)
      if (!notificationSentRef.current) {
        // 즉시 참조값을 업데이트하여 중복 방지
        notificationSentRef.current = true;
        
        addNotification({
          userId: user?.id?.toString() || "1",
          type: "campaign_complete",
          title: "공구 결제 성공!",
          message: `${finalOrderData.productName} 공동구매 결제가 완료되었습니다. ${finalOrderData.amount.toLocaleString()}원`,
          isRead: false,
          relatedId: finalOrderData.campaignId,
          actionUrl: `/campaigns/${finalOrderData.campaignId}`,
          priority: "high",
        });
        setNotificationSent(true);
      }

      setIsLoading(false);
    }, 1000);
  }, [searchParams, addNotification, user?.id]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-hey-gradient flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">결제 정보를 확인하는 중...</p>
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
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
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
          <div className="max-w-2xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">결제 완료</h1>
              </div>
              <p className="text-white/80 text-lg max-w-xl mx-auto">
                공동구매 참여가 성공적으로 완료되었습니다!
              </p>
            </div>

            {/* Success Animation */}
            <div className="text-center mb-8 animate-bounce">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-14 h-14 text-green-600" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 inline-block">
                <h2 className="text-xl font-bold text-white mb-1">
                  {orderData?.paymentMethod?.includes("BNPL")
                    ? "BNPL 계좌 결제 완료!"
                    : "결제 완료!"}
                </h2>
                <p className="text-white/80">
                  주문번호:{" "}
                  <span className="font-mono font-semibold">
                    {orderData?.orderId}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Details Card */}
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm mb-6">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="w-6 h-6" />
                  주문 상세 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {orderData?.amount?.toLocaleString()}원
                    </div>
                    <Badge
                      className={`${
                        orderData?.splitPayment
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                          : "bg-gradient-to-r from-purple-600 to-pink-600"
                      } text-white`}
                    >
                      {orderData?.paymentMethod}로 결제됨
                    </Badge>
                  </div>

                  {/* 분할 결제 상세 정보 */}
                  {orderData?.splitPayment && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">
                            BNPL 계좌
                          </span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {orderData.bnplAmount?.toLocaleString()}원
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800">
                            일반 계좌
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {orderData.cashAmount?.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">상품명</span>
                    <span className="font-semibold text-gray-900">
                      {orderData?.productName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">수량</span>
                    <span className="font-semibold text-gray-900">
                      {orderData?.quantity}개
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">결제 방법</span>
                    <Badge
                      variant="outline"
                      className={`${
                        orderData?.paymentMethod?.includes("BNPL")
                          ? "border-blue-200 text-blue-700 bg-blue-50"
                          : "border-green-200 text-green-700 bg-green-50"
                      }`}
                    >
                      {orderData?.paymentMethod}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">주문 일시</span>
                    <span className="font-semibold text-gray-900">
                      {orderData?.orderDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">
                      예상 배송일
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-orange-600">
                        {orderData?.estimatedDelivery}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm mb-8">
              <CardContent className="p-6">
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-800 mb-2">
                        결제가 성공적으로 완료되었습니다
                      </h3>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>
                          • 공동구매가 마감되면 상품을 주문 및 발송 처리합니다
                        </p>
                        <p>• 배송 정보는 이메일과 앱 알림으로 안내드립니다</p>
                        <p>
                          • 문의사항은 마이페이지의 주문내역에서 확인 가능합니다
                        </p>
                      </div>
                      {orderData?.paymentMethod?.includes("BNPL") && (
                        <div
                          className={`mt-3 p-3 rounded-lg ${
                            orderData?.splitPayment
                              ? "bg-orange-50 border border-orange-200"
                              : "bg-blue-50 border border-blue-200"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              orderData?.splitPayment
                                ? "text-orange-800"
                                : "text-blue-800"
                            }`}
                          >
                            {orderData?.splitPayment
                              ? "🔄 BNPL 계좌와 일반 계좌로 분할 결제가 완료되었습니다"
                              : "💳 BNPL 계좌에서 즉시 결제가 완료되었습니다"}
                          </p>
                          {orderData?.splitPayment && (
                            <div className="text-xs text-orange-700 mt-2 space-y-1">
                              <div>
                                • BNPL 계좌:{" "}
                                {orderData.bnplAmount?.toLocaleString()}원 결제
                              </div>
                              <div>
                                • 일반 계좌:{" "}
                                {orderData.cashAmount?.toLocaleString()}원 결제
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm border-white/20 font-bold hover:bg-white shadow-lg"
                >
                  <Package className="w-4 h-4" />
                  다른 공구 둘러보기
                </Button>
              </Link>
              <Link to="/bnpl">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm border-white/20 font-bold hover:bg-white shadow-lg"
                >
                  <Package className="w-4 h-4" />
                  BNPL 계좌 관리
                </Button>
              </Link>
              <Link to="/my-page">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm border-white/20 font-bold hover:bg-white shadow-lg"
                >
                  <Package className="w-4 h-4" />
                  주문 내역 보기
                </Button>
              </Link>
            </div>


            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                <p className="text-white/80 text-sm mb-1">
                  문의사항이 있으시면 고객센터로 연락주세요
                </p>
                <p className="text-white/60 text-xs">
                  평일 09:00-18:00 (점심시간 12:00-13:00 제외) | 1588-0000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
