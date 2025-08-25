package xyz.jinjin99.gongguyoung.backend.global.utils;

public class TransactionSummaryUtil {

    private static final String DEPOSIT_TEMPLATE = "[입금] 공동구매: %s, 수량: %d개";
    private static final String WITHDRAW_TEMPLATE = "[출금] 공동구매: %s, 수량: %d개";

    private TransactionSummaryUtil() {
        // 유틸 클래스는 생성자 private
    }

    /**
     * 입금 거래 요약
     * @param groupPurchaseName 공동구매 이름
     * @param count 구매 수량
     * @return 예: [입금] 공동구매: 아이패드, 수량: 2개
     */
    public static String createDepositSummary(String groupPurchaseName, int count) {
        return String.format(DEPOSIT_TEMPLATE, groupPurchaseName, count);
    }

    /**
     * 출금 거래 요약
     * @param groupPurchaseName 공동구매 이름
     * @param count 구매 수량
     * @return 예: [출금] 공동구매: 아이패드, 수량: 2개
     */
    public static String createWithdrawSummary(String groupPurchaseName, int count) {
        return String.format(WITHDRAW_TEMPLATE, groupPurchaseName, count);
    }
}