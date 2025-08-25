package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.UpdateDemandDepositAccountTransferRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.UpdateDemandDepositAccountTransferResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.MemberAccountsNo;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentRequest;

import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentType;
import xyz.jinjin99.gongguyoung.backend.global.utils.TransactionSummaryUtil;


@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final MemberService memberService;
    private final DemandDepositClient demandDepositClient;

    /**
     *      1. 공동구매 ID로 계좌번호가져오기
     *      2. 회원 아이디로 계좌번호 구하기
     *      3. 송금
     *      3-1 BNPL 일때 BNPL로 결제
     *      3-2 일반 결제일때 일반결제 얼마
     *      그 후 저장
     *
     *      TODO 결제 에는 출금계좌, 입금계좌
     *          두개가 존재함 ->
     *
     *      TODO transaction Summary 작성
     * @param paymentRequest
     */
    @Transactional
    public void processPayment(PaymentRequest paymentRequest){
        // 1. 공동구매 ID로 계좌번호가져오기 -> 덕종이형 진행중

        String groupPurchaseAccountNo = "test";
        // 2. 회원 아이디로 계좌번호 구하기 -> 지금 해야함
        MemberAccountsNo accountNos = memberService.getAccountNo(paymentRequest.getMemberId());

        // 3. Transaction 걸고 송금
        // 3-1 BNPL 일때 BNPL로 결제
        // 3-2 일반 결제일때 일반결제 얼마

        switch (paymentRequest.getPaymentType()){

            case "IMMEDIATE_ONLY" -> handleImmediate(paymentRequest, accountNos, groupPurchaseAccountNo);
            case "BNPL" -> handleBnpl(paymentRequest, accountNos, groupPurchaseAccountNo);
            default -> throw new RuntimeException("지원하지 않는 결제 타입입니다.");
        }



        // 그 후 저장 ㅇㅋ



    }

    private void handleImmediate(PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        UpdateDemandDepositAccountTransferRequest request =
                UpdateDemandDepositAccountTransferRequest.builder()
                        .depositAccountNo(groupPurchaseAccountNo)
                        .transactionBalance((long) paymentRequest.getImmediate())
                        .withdrawalAccountNo(accountNos.getStarterAccountNo())
                        .depositTransactionSummary(
                                TransactionSummaryUtil.createDepositSummary("공동구매", paymentRequest.getCount())
                        )
                        .withdrawalTransactionSummary(
                                TransactionSummaryUtil.createWithdrawSummary("공동구매", paymentRequest.getCount())
                        )
                        .build();

        UpdateDemandDepositAccountTransferResponse updateDemandDepositAccountTransferResponse = demandDepositClient.updateDemandDepositAccountTransfer(request);
    }


    /** BNPL 결제가 포함된 경우 (BNPL만 or 혼합) */
    private void handleBnpl(PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        if (paymentRequest.getImmediate() == 0) {
            // BNPL 전액
            UpdateDemandDepositAccountTransferRequest bnplRequest = buildBnplRequest(paymentRequest, accountNos, groupPurchaseAccountNo);
            demandDepositClient.updateDemandDepositAccountTransfer(bnplRequest);
        } else {
            // 혼합 결제 (즉시 + BNPL)
            UpdateDemandDepositAccountTransferRequest bnplRequest = buildBnplRequest(paymentRequest, accountNos, groupPurchaseAccountNo);
            UpdateDemandDepositAccountTransferRequest immediateRequest = buildImmediateRequest(paymentRequest, accountNos, groupPurchaseAccountNo);

            try {
                demandDepositClient.updateDemandDepositAccountTransfer(bnplRequest);
                demandDepositClient.updateDemandDepositAccountTransfer(immediateRequest);
            } catch (Exception e) {
                log.error("BNPL + IMMEDIATE 결제 처리 중 오류 발생, 롤백 필요", e);
                // TODO: 롤백 처리 로직 추가
            }
        }
    }

    /** BNPL 결제 요청 생성 */
    private UpdateDemandDepositAccountTransferRequest buildBnplRequest(PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        return UpdateDemandDepositAccountTransferRequest.builder()
                .depositAccountNo(groupPurchaseAccountNo)
                .transactionBalance((long) paymentRequest.getBnpl())
                .withdrawalAccountNo(accountNos.getFlexAccountNo())
                .depositTransactionSummary(TransactionSummaryUtil.createDepositSummary("공동구매", paymentRequest.getCount()))
                .withdrawalTransactionSummary(TransactionSummaryUtil.createWithdrawSummary("공동구매", paymentRequest.getCount()))
                .build();
    }

    /** 즉시결제 요청 생성 */
    private UpdateDemandDepositAccountTransferRequest buildImmediateRequest(PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        return UpdateDemandDepositAccountTransferRequest.builder()
                .depositAccountNo(groupPurchaseAccountNo)
                .transactionBalance((long) paymentRequest.getImmediate())
                .withdrawalAccountNo(accountNos.getStarterAccountNo())
                .depositTransactionSummary(TransactionSummaryUtil.createDepositSummary("공동구매", paymentRequest.getCount()))
                .withdrawalTransactionSummary(TransactionSummaryUtil.createWithdrawSummary("공동구매", paymentRequest.getCount()))
                .build();
    }
}
