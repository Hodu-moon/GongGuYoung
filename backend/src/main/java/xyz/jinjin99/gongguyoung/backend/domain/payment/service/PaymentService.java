package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.MemberClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.BaseRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.UpdateDemandDepositAccountTransferRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.UpdateDemandDepositAccountTransferResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository.GroupPurchaseRepository;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.MemberAccountsNo;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentCancellationRequest;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentRequest;

import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.PaymentCancellationResult;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.PaymentProcessingResult;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.domain.payment.repository.PaymentRepository;
import xyz.jinjin99.gongguyoung.backend.global.enums.BnplStatus;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentStatus;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentType;
import xyz.jinjin99.gongguyoung.backend.global.exception.MemberCreationException;
import xyz.jinjin99.gongguyoung.backend.global.utils.TransactionSummaryUtil;

import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final MemberService memberService;
    private final DemandDepositClient demandDepositClient;
    private final PaymentRepository paymentRepository;
    private final MemberClient memberClient;
    private final GroupPurchaseRepository groupPurchaseRepository;


    private final String GROUP_PURCHASE_EMAIL = "gongguyoung@jinjin99.xyz";

    /**
     *      1. 공동구매 ID로 계좌번호가져오기
     *      2. 회원 아이디로 계좌번호 구하기
     *      3. 송금
     *      3-1 BNPL 일때 BNPL로 결제
     *      3-2 일반 결제일때 일반결제 얼마
     *      4. groupPurchase count 올리기
     *      그 후 저장
     *      TODO 결제 에는 출금계좌, 입금계좌
     *          두개가 존재함 ->
     *
     *      TODO transaction Summary 작성
     * @param paymentRequest
     */
    @Transactional
    public void processPayment(PaymentRequest paymentRequest){
        // 1. 공동구매 ID로 계좌번호가져오기 -> 덕종이형 진행중



        if ("IMMEDIATE_ONLY".equals(paymentRequest.getPaymentType())) {
            if (paymentRequest.getImmediate() <= 0 || paymentRequest.getBnpl() != 0) {
                throw new IllegalArgumentException("IMMEDIATE_ONLY 결제는 immediate > 0, bnpl == 0 이어야 합니다.");
            }
        } else if ("BNPL".equals(paymentRequest.getPaymentType())) {
            if (paymentRequest.getImmediate() < 0 || paymentRequest.getBnpl() <= 0) {
                throw new IllegalArgumentException("BNPL 결제는 immediate >= 0, bnpl > 0 이어야 합니다.");
            }
        }

        GroupPurchase groupPurchase = groupPurchaseRepository.findById(paymentRequest.getGroupPurchaseId()).orElseThrow();
        String groupPurchaseAccountNo = groupPurchase.getAccountNo();

        // 2. 회원 아이디로 계좌번호 구하기 -> 지금 해야함
        Member member = memberService.getMember(paymentRequest.getMemberId());
        MemberAccountsNo accountNos = memberService.getAccountNo(paymentRequest.getMemberId());
        // 공동구매 가져오기

        // 3. Transaction 걸고 송금
        // 3-1 BNPL 일때 BNPL로 결제
        // 3-2 일반 결제일때 일반결제 얼마
        Long bnplTxNo = null;
        Long immediateTxNo = null;

        String userKey = member.getUserKey();
        switch (paymentRequest.getPaymentType()){
            case "IMMEDIATE_ONLY" -> {
                immediateTxNo = handleImmediate(userKey, paymentRequest, accountNos, groupPurchaseAccountNo);
            }
            case "BNPL" -> {
                PaymentProcessingResult paymentProcessingResult = handleBnpl(userKey, paymentRequest, accountNos, groupPurchaseAccountNo);
                bnplTxNo = paymentProcessingResult.getBnplTransactionNo();
                immediateTxNo = paymentProcessingResult.getImmediateTransactionNo();
            }
            default -> throw new RuntimeException("지원하지 않는 결제 타입입니다.");
        }

        // 4. groupPurchase 에 수량 업데이트
        groupPurchase.addCurrentCount(paymentRequest.getCount());

        PaymentEvent paymentEvent = PaymentEvent.builder()
                .member(member)
                .groupPurchase(groupPurchase)
                .type(PaymentType.valueOf(paymentRequest.getPaymentType())) // IMMEDIATE_ONLY, BNPL
                .status(PaymentStatus.PAID)              // @Builder는 기본값 유지 안 됨: 명시!
                .bnplStatus(BnplStatus.PROCESSING)
                .immediateAmount(paymentRequest.getImmediate())
                .count(paymentRequest.getCount())
                .bnplAmount(paymentRequest.getBnpl())
                .amount(paymentRequest.getImmediate() + paymentRequest.getBnpl())
                .bnplWithdrawalTransactionNo(bnplTxNo)
                .immediateWithdrawalTransactionNo(immediateTxNo)
                .build();

        // 그 후 저장 ㅇㅋ

        paymentRepository.save(paymentEvent);
    }

    private String getGroupPurchaseUserKey(){
        String userKey;
        try {
            userKey = Optional.ofNullable(memberClient.getOrCreateMember(GROUP_PURCHASE_EMAIL).getUserKey())
                    .orElseThrow(() -> new MemberCreationException(
                            "Member creation returned null userKey for email: " + GROUP_PURCHASE_EMAIL));
        } catch (Exception e) {
            throw new MemberCreationException("Failed to create member with email: " + GROUP_PURCHASE_EMAIL, e);
        }


        return userKey;
    }


    @Transactional
    public PaymentCancellationResult refundPayment(PaymentCancellationRequest request) {
        // 0) 결제 이벤트 로드 + 소유자 검증
        PaymentEvent event = paymentRepository.findById(request.getPaymentEventId())
                .orElseThrow(() -> new IllegalArgumentException("결제 이벤트가 없습니다. id=" + request.getPaymentEventId()));

        if (!event.getMember().getId().equals(request.getMemberId())) {
            throw new IllegalStateException("본인 결제만 취소할 수 있습니다.");
        }

        if (event.getStatus() == PaymentStatus.CANCELED) {
            // 이미 취소/환불 처리된 건
            return PaymentCancellationResult.builder().build();
        }

        // (선택) 공동구매 상태로 취소 가능 여부 체크

        // group purchase 계좌에도 손을 대야해서
        String groupPurchaseUserKey = getGroupPurchaseUserKey();



        // 1) 계좌 정보
        // TODO: 실제 그룹공동구매 전용  이게 맞는지 잘 모르겠음
        GroupPurchase groupPurchase = event.getGroupPurchase();
        String groupPurchaseAccountNo = groupPurchase.getAccountNo();
        Member member = memberService.getMember(request.getMemberId());
        MemberAccountsNo accountNos = memberService.getAccountNo(request.getMemberId());

        Long immediateRefundTxNo = null;
        Long bnplRefundTxNo = null;

        // 2) 환불(역이체) — 즉시결제 금액이 있으면: 그룹계좌 → 회원 Starter 계좌
        if (event.getImmediateAmount() > 0) {
            UpdateDemandDepositAccountTransferRequest reqImmediateRefund =
                    buildImmediateRefundRequest( groupPurchaseUserKey, event, accountNos, groupPurchaseAccountNo);

            UpdateDemandDepositAccountTransferResponse resp =
                    demandDepositClient.updateDemandDepositAccountTransfer(reqImmediateRefund);

            immediateRefundTxNo = resp.getRecords().get(0).getTransactionUniqueNo();
        }

        // 3) 환불(역이체) — BNPL 금액이 있으면: 그룹계좌 → 회원 Flex(BNPL) 계좌
        if (event.getBnplAmount() > 0) {
            UpdateDemandDepositAccountTransferRequest reqBnplRefund =
                    buildBnplRefundRequest(groupPurchaseUserKey, event, accountNos, groupPurchaseAccountNo);

            UpdateDemandDepositAccountTransferResponse resp =
                    demandDepositClient.updateDemandDepositAccountTransfer(reqBnplRefund);

            bnplRefundTxNo = resp.getRecords().get(0).getTransactionUniqueNo();
        }

        // 4) 상태 전이
        event.markRefund();
        paymentRepository.save(event);

        // 5) 그룹 구매 카운트 내리기
        groupPurchase.addCurrentCount(-event.getCount());

        return PaymentCancellationResult.builder()
                .immediateRefundTransactionNo(immediateRefundTxNo)
                .bnplRefundTransactionNo(bnplRefundTxNo)
                .build();
    }


    /** 즉시결제 환불: 그룹공동구매계좌 → 회원 Starter 계좌 */
    private UpdateDemandDepositAccountTransferRequest buildImmediateRefundRequest(
            String groupPurchaseUserKey,
            PaymentEvent event, MemberAccountsNo accountNos, String groupPurchaseAccountNo
    ) {
        return UpdateDemandDepositAccountTransferRequest.builder()
                .header(BaseRequest.Header.builder().userKey(groupPurchaseUserKey).build())
                .withdrawalAccountNo(groupPurchaseAccountNo)                 // 그룹계좌에서 출금
                .depositAccountNo(accountNos.getStarterAccountNo())          // 회원 Starter 계좌로 입금
                .transactionBalance((long) event.getImmediateAmount())
                .withdrawalTransactionSummary(
                        TransactionSummaryUtil.createWithdrawSummary("공동구매 환불", 1)
                )
                .depositTransactionSummary(
                        TransactionSummaryUtil.createDepositSummary("공동구매 환불", 1)
                )
                .build();
    }

    /** BNPL 환불: 그룹공동구매계좌 → 회원 Flex(BNPL) 계좌 */
    private UpdateDemandDepositAccountTransferRequest buildBnplRefundRequest(
            String userKey,
            PaymentEvent event, MemberAccountsNo accountNos, String groupPurchaseAccountNo
    ) {
        return UpdateDemandDepositAccountTransferRequest.builder()
                .header(BaseRequest.Header.builder().userKey(userKey).build())
                .withdrawalAccountNo(groupPurchaseAccountNo)             // 그룹계좌에서 출금
                .depositAccountNo(accountNos.getFlexAccountNo())         // 회원 BNPL(Flex) 계좌로 입금
                .transactionBalance((long) event.getBnplAmount())
                .withdrawalTransactionSummary(
                        TransactionSummaryUtil.createWithdrawSummary("공동구매 BNPL 환불", 1)
                )
                .depositTransactionSummary(
                        TransactionSummaryUtil.createDepositSummary("공동구매 BNPL 환불", 1)
                )
                .build();
    }


    // 입금계좌 -> 공동구매 계좌
    // 출금계좌 -> 회원의 starter
    private Long handleImmediate(String userKey, PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        UpdateDemandDepositAccountTransferRequest request =
                UpdateDemandDepositAccountTransferRequest.builder()
                        .header(BaseRequest.Header.builder().userKey(userKey).build())
                        .depositAccountNo(groupPurchaseAccountNo) //  입금 계좌 -> 공동구매 계좌
                        .transactionBalance((long) paymentRequest.getImmediate())
                        .withdrawalAccountNo(accountNos.getStarterAccountNo()) // 출금 계좌 -> 회원의 starter
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
    private PaymentProcessingResult handleBnpl(String userKey, PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        if (paymentRequest.getImmediate() == 0) {
            // BNPL 전액
            return handleBnplOnly(userKey, paymentRequest, accountNos, groupPurchaseAccountNo);
        } else {
            // 혼합 결제 (즉시 + BNPL)
            return handleMixedPayment(userKey, paymentRequest, accountNos, groupPurchaseAccountNo);
        }

    }

    /** BNPL만 처리 */
    private PaymentProcessingResult handleBnplOnly(
            String userKey,
            PaymentRequest paymentRequest,
            MemberAccountsNo accountNos,
            String groupPurchaseAccountNo
    ) {
        UpdateDemandDepositAccountTransferRequest bnplRequest =
                buildBnplRequest(userKey, paymentRequest, accountNos, groupPurchaseAccountNo);

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
            String userKey,
            PaymentRequest paymentRequest,
            MemberAccountsNo accountNos,
            String groupPurchaseAccountNo
    ) {
        UpdateDemandDepositAccountTransferRequest bnplRequest =
                buildBnplRequest(userKey, paymentRequest, accountNos, groupPurchaseAccountNo);
        UpdateDemandDepositAccountTransferRequest immediateRequest =
                buildImmediateRequest(userKey, paymentRequest, accountNos, groupPurchaseAccountNo);

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
    private UpdateDemandDepositAccountTransferRequest buildBnplRequest(String userKey, PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        return UpdateDemandDepositAccountTransferRequest.builder()
                .header(BaseRequest.Header.builder().userKey(userKey).build())
                .depositAccountNo(groupPurchaseAccountNo)
                .transactionBalance((long) paymentRequest.getBnpl())
                .withdrawalAccountNo(accountNos.getFlexAccountNo())
                .depositTransactionSummary(TransactionSummaryUtil.createDepositSummary("공동구매", paymentRequest.getCount()))
                .withdrawalTransactionSummary(TransactionSummaryUtil.createWithdrawSummary("공동구매", paymentRequest.getCount()))
                .build();
    }

    /** 즉시결제 요청 생성 */
    private UpdateDemandDepositAccountTransferRequest buildImmediateRequest(String userKey, PaymentRequest paymentRequest, MemberAccountsNo accountNos, String groupPurchaseAccountNo) {
        return UpdateDemandDepositAccountTransferRequest.builder()
                .header(BaseRequest.Header.builder().userKey(userKey).build())
                .depositAccountNo(groupPurchaseAccountNo)
                .transactionBalance((long) paymentRequest.getImmediate())
                .withdrawalAccountNo(accountNos.getStarterAccountNo())
                .depositTransactionSummary(TransactionSummaryUtil.createDepositSummary("공동구매", paymentRequest.getCount()))
                .withdrawalTransactionSummary(TransactionSummaryUtil.createWithdrawSummary("공동구매", paymentRequest.getCount()))
                .build();
    }
}
