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
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentRequest;

import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.PaymentProcessingResult;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.domain.payment.repository.PaymentRepository;
import xyz.jinjin99.gongguyoung.backend.global.enums.BnplStatus;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentStatus;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentType;
import xyz.jinjin99.gongguyoung.backend.global.utils.TransactionSummaryUtil;


@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final MemberService memberService;

    private final DemandDepositClient demandDepositClient;
    private final PaymentRepository paymentRepository;

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
        Member member = memberService.getMember(paymentRequest.getMemberId());
        MemberAccountsNo accountNos = memberService.getAccountNo(paymentRequest.getMemberId());
        // 공동구매 가져오기
        GroupPurchase groupPurchase = /* groupPurchaseRepository.findById(paymentRequest.getGroupPurchaseId()).orElseThrow(...) */ null;



        // 3. Transaction 걸고 송금
        // 3-1 BNPL 일때 BNPL로 결제
        // 3-2 일반 결제일때 일반결제 얼마
        Long bnplTxNo = null;
        Long immediateTxNo = null;
        switch (paymentRequest.getPaymentType()){
            case "IMMEDIATE_ONLY" -> {
                immediateTxNo = handleImmediate(paymentRequest, accountNos, groupPurchaseAccountNo);
            }
            case "BNPL" -> {

                PaymentProcessingResult paymentProcessingResult = handleBnpl(paymentRequest, accountNos, groupPurchaseAccountNo);
                bnplTxNo = paymentProcessingResult.getBnplTransactionNo();
                immediateTxNo = paymentProcessingResult.getImmediateTransactionNo();
            }
            default -> throw new RuntimeException("지원하지 않는 결제 타입입니다.");
        }


        PaymentEvent paymentEvent = PaymentEvent.builder()
                .member(member)
                .groupPurchase(groupPurchase)
                .type(PaymentType.valueOf(paymentRequest.getPaymentType())) // GENERAL / BNPL_ONLY / SPLIT
                .status(PaymentStatus.PAID)              // @Builder는 기본값 유지 안 됨: 명시!
                .bnplStatus(BnplStatus.PROCESSING)                        // TODO: 팀 정의 상태에 맞게 설정
                .immediateAmount(paymentRequest.getImmediate())
                .bnplAmount(paymentRequest.getBnpl())
                .amount(paymentRequest.getImmediate() + paymentRequest.getBnpl())
                .bnplWithdrawalTransactionNo(bnplTxNo)
                .immediateWithdrawalTransactionNo(immediateTxNo)
                .build();

        // 그 후 저장 ㅇㅋ

        paymentRepository.save(paymentEvent);
    }

    private Long handleImmediate(PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
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


        return updateDemandDepositAccountTransferResponse.getRecords()
                .get(0).getTransactionUniqueNo();

    }


    /**
     * BNPL 결제가 포함된 경우 (BNPL만 or 혼합)
     *
     * @return
     */
    private PaymentProcessingResult handleBnpl(PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        if (paymentRequest.getImmediate() == 0) {
            // BNPL 전액
            return handleBnplOnly(paymentRequest, accountNos, groupPurchaseAccountNo);
        } else {
            // 혼합 결제 (즉시 + BNPL)
            return handleMixedPayment(paymentRequest, accountNos, groupPurchaseAccountNo);
        }

    }

    /** BNPL만 처리 */
    private PaymentProcessingResult handleBnplOnly(
            PaymentRequest paymentRequest,
            MemberAccountsNo accountNos,
            String groupPurchaseAccountNo
    ) {
        UpdateDemandDepositAccountTransferRequest bnplRequest =
                buildBnplRequest(paymentRequest, accountNos, groupPurchaseAccountNo);

        UpdateDemandDepositAccountTransferResponse bnplResp =
                demandDepositClient.updateDemandDepositAccountTransfer(bnplRequest);

        UpdateDemandDepositAccountTransferResponse.Record record = bnplResp.getRecords().get(0);

        Long bnplTxnNo = record.getTransactionUniqueNo(); // ← 실제 필드명으로 교체


        return PaymentProcessingResult.builder()
                .bnplTransactionNo(bnplTxnNo)
                .immediateTransactionNo(null)
                .build();
    }

    /** 혼합 결제: BNPL + 즉시 */
//    @Transactional // DB 저장/상태 갱신은 트랜잭션, 외부송금은 보상 트랜잭션 고려
    private PaymentProcessingResult handleMixedPayment(
            PaymentRequest paymentRequest,
            MemberAccountsNo accountNos,
            String groupPurchaseAccountNo
    ) {
        UpdateDemandDepositAccountTransferRequest bnplRequest =
                buildBnplRequest(paymentRequest, accountNos, groupPurchaseAccountNo);
        UpdateDemandDepositAccountTransferRequest immediateRequest =
                buildImmediateRequest(paymentRequest, accountNos, groupPurchaseAccountNo);

        Long bnplTxnNo = null;
        Long immediateTxnNo = null;

        try {
            // 1) BNPL 먼저 처리
            UpdateDemandDepositAccountTransferResponse bnplResp =
                    demandDepositClient.updateDemandDepositAccountTransfer(bnplRequest);
            bnplTxnNo = bnplResp.getRecords().get(0).getTransactionUniqueNo(); // 실제 필드명으로 교체

            // 2) 즉시 결제 처리
            UpdateDemandDepositAccountTransferResponse immediateResp =
                    demandDepositClient.updateDemandDepositAccountTransfer(immediateRequest);
            immediateTxnNo = immediateResp.getRecords().get(0).getTransactionUniqueNo(); // 실제 필드명으로 교체

            return PaymentProcessingResult.builder()
                    .bnplTransactionNo(bnplTxnNo)
                    .immediateTransactionNo(immediateTxnNo)
                    .build();

        } catch (Exception e) {
            log.error("BNPL + IMMEDIATE 결제 처리 중 오류 발생. 보상(롤백) 필요", e);

            // 외부 계좌이체는 DB 트랜잭션으로 롤백 불가 → 보상 트랜잭션 시도 권장
            // ex) 이미 성공한 BNPL을 되돌리는 반대 방향 이체 요청 생성
            try {
                if (bnplTxnNo != null) {
                    // 예: reverseBnplTransfer(bnplTxnNo) 혹은 반대방향 transfer 요청
                    // demandDepositClient.updateDemandDepositAccountTransfer(buildCompensationForBnpl(...));
                }
            } catch (Exception ce) {
                log.error("BNPL 보상 트랜잭션 실패. 수동 정산/관리자 알림 필요", ce);
            }

            // 필요 시 커스텀 예외로 래핑
            throw new RuntimeException("혼합 결제 처리 실패", e);
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
