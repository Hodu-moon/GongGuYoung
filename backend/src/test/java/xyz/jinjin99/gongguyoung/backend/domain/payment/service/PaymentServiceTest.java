package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.UpdateDemandDepositAccountTransferRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.UpdateDemandDepositAccountTransferResponse;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.repository.GroupPurchaseRepository;
import xyz.jinjin99.gongguyoung.backend.domain.member.dto.response.MemberAccountsNo;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentCancellationRequest;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request.PaymentRequest;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.domain.payment.repository.PaymentRepository;
import xyz.jinjin99.gongguyoung.backend.global.enums.PaymentStatus;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @InjectMocks
    private PaymentService paymentService;

    @Mock private MemberService memberService;
    @Mock private DemandDepositClient demandDepositClient;
    @Mock private PaymentRepository paymentRepository;

    @Mock private GroupPurchaseRepository groupPurchaseRepository;

    // 공통 목업
    @Mock private Member mockMember;
    @Mock private GroupPurchase mockGroupPurchase;



    @BeforeEach
    void setup() {
        // PaymentService 내부에서 groupPurchase는 현재 null로 두고 저장하지만,
        // repository가 mock이므로 JPA 제약이 실제로 검증되진 않음.
    }

    // 헬퍼: 이체 응답 목업 생성


    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private UpdateDemandDepositAccountTransferResponse makeTransferResponse(long txnNo) {
        // 내부 Record 생성 후 transactionUniqueNo 세팅
        UpdateDemandDepositAccountTransferResponse.Record rec =
                new UpdateDemandDepositAccountTransferResponse.Record();
        setField(rec, "transactionUniqueNo", txnNo);

        // 바깥 Response에 records 세팅
        UpdateDemandDepositAccountTransferResponse resp =
                new UpdateDemandDepositAccountTransferResponse();
        setField(resp, "records", List.of(rec));

        return resp;
    }


    // === processPayment: IMMEDIATE_ONLY 성공 ===
    @Test
    void processPayment_immediateOnly_success() {
        // given
        long memberId = 1L;
        int immediate = 10_000;
        int bnpl = 0;

        PaymentRequest req = mock(PaymentRequest.class);
        when(req.getMemberId()).thenReturn(memberId);
        when(req.getPaymentType()).thenReturn("IMMEDIATE_ONLY");
        when(req.getImmediate()).thenReturn(immediate);
        when(req.getBnpl()).thenReturn(bnpl);
        when(req.getCount()).thenReturn(2);

        // member / accounts
        when(memberService.getMember(memberId)).thenReturn(mockMember);

        MemberAccountsNo accountNos = mock(MemberAccountsNo.class);
        when(memberService.getAccountNo(memberId)).thenReturn(accountNos);
        when(accountNos.getStarterAccountNo()).thenReturn("starter-111");

        // transfer 응답
        when(demandDepositClient.updateDemandDepositAccountTransfer(any()))
                .thenReturn(makeTransferResponse(777L));

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);
        when(paymentRepository.save(eventCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));


        when(groupPurchaseRepository.findById(any())).thenReturn(Optional.of(mockGroupPurchase));

        // when
        paymentService.processPayment(req);

        // then
        verify(demandDepositClient, times(1)).updateDemandDepositAccountTransfer(any(UpdateDemandDepositAccountTransferRequest.class));
        PaymentEvent saved = eventCaptor.getValue();
        assertThat(saved.getAmount()).isEqualTo(immediate + bnpl);
        assertThat(saved.getImmediateAmount()).isEqualTo(immediate);
        assertThat(saved.getBnplAmount()).isEqualTo(0);
        assertThat(saved.getImmediateWithdrawalTransactionNo()).isEqualTo(777L);
        assertThat(saved.getStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void processPayment_bnplOnly_success_afterFix() {
        // given
        long memberId = 1L;
        int immediate = 0;
        int bnpl = 50_000;



        PaymentRequest req = mock(PaymentRequest.class);
        when(req.getMemberId()).thenReturn(memberId);
        when(req.getPaymentType()).thenReturn("BNPL"); // 현재 코드에 맞춤 (switch가 BNPL로 분기)
        when(req.getImmediate()).thenReturn(immediate);
        when(req.getBnpl()).thenReturn(bnpl);
        when(req.getCount()).thenReturn(1);

        when(memberService.getMember(memberId)).thenReturn(mockMember);

        MemberAccountsNo accountNos = mock(MemberAccountsNo.class);
        when(memberService.getAccountNo(memberId)).thenReturn(accountNos);
        when(accountNos.getFlexAccountNo()).thenReturn("flex-222");

        when(demandDepositClient.updateDemandDepositAccountTransfer(any()))
                .thenReturn(makeTransferResponse(888L));

        ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);
        when(paymentRepository.save(eventCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        when(groupPurchaseRepository.findById(any())).thenReturn(Optional.of(mockGroupPurchase));

        // when
        paymentService.processPayment(req);

        // then
        verify(demandDepositClient, times(1)).updateDemandDepositAccountTransfer(any());
        PaymentEvent saved = eventCaptor.getValue();
        assertThat(saved.getBnplAmount()).isEqualTo(bnpl);
        assertThat(saved.getImmediateAmount()).isZero();
        assertThat(saved.getBnplWithdrawalTransactionNo()).isEqualTo(888L);
        assertThat(saved.getStatus()).isEqualTo(PaymentStatus.PAID);
    }

    // === refundParticipation: 즉시+BNPL 모두 환불 성공 ===
    @Test
    void refundParticipation_fullRefund_success() {
        // given
        long memberId = 10L;
        long paymentEventId = 100L;

        PaymentEvent event = PaymentEvent.builder()
                .member(mock(Member.class, inv -> {
                    if (inv.getMethod().getName().equals("getId")) return memberId;
                    return RETURNS_DEFAULTS.answer(inv);
                }))
                .groupPurchase(mockGroupPurchase) // 현재 서비스 코드에선 사용 안 함
                .immediateAmount(12_000)
                .bnplAmount(34_000)
                .amount(46_000)
                .status(PaymentStatus.PAID)
                .bnplStatus(null)
                .build();

        when(paymentRepository.findById(paymentEventId)).thenReturn(Optional.of(event));

        MemberAccountsNo accountNos = mock(MemberAccountsNo.class);
        when(memberService.getAccountNo(memberId)).thenReturn(accountNos);
        when(accountNos.getStarterAccountNo()).thenReturn("starter-123");
        when(accountNos.getFlexAccountNo()).thenReturn("flex-456");

        // 두 번의 역이체 응답
        when(demandDepositClient.updateDemandDepositAccountTransfer(any()))
                .thenReturn(makeTransferResponse(9001L))
                .thenReturn(makeTransferResponse(9002L));

        PaymentCancellationRequest req = new PaymentCancellationRequest(paymentEventId, memberId);

        // when
        var result = paymentService.refundPayment(req);

        // then
        assertThat(result.getImmediateRefundTransactionNo()).isEqualTo(9001L);
        assertThat(result.getBnplRefundTransactionNo()).isEqualTo(9002L);
        verify(demandDepositClient, times(2)).updateDemandDepositAccountTransfer(any(UpdateDemandDepositAccountTransferRequest.class));
        verify(paymentRepository, times(1)).save(any(PaymentEvent.class));

        // markRefund()가 PaymentStatus.REFUNDED로 바꾸도록 구현되어 있다면:
        assertThat(event.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
    }

    // === refundParticipation: 즉시결제만 환불 ===
    @Test
    void refundParticipation_immediateOnly_success() {
        long memberId = 20L;
        long paymentEventId = 200L;

        PaymentEvent event = PaymentEvent.builder()
                .member(mock(Member.class, inv -> {
                    if (inv.getMethod().getName().equals("getId")) return memberId;
                    return RETURNS_DEFAULTS.answer(inv);
                }))
                .groupPurchase(mockGroupPurchase)
                .immediateAmount(15_000)
                .bnplAmount(0)
                .amount(15_000)
                .status(PaymentStatus.PAID)
                .build();

        when(paymentRepository.findById(paymentEventId)).thenReturn(Optional.of(event));

        MemberAccountsNo accountNos = mock(MemberAccountsNo.class);
        when(memberService.getAccountNo(memberId)).thenReturn(accountNos);
        when(accountNos.getStarterAccountNo()).thenReturn("starter-999");

        when(demandDepositClient.updateDemandDepositAccountTransfer(any()))
                .thenReturn(makeTransferResponse(7001L));

        PaymentCancellationRequest req = new PaymentCancellationRequest(paymentEventId, memberId);

        var result = paymentService.refundPayment(req);

        assertThat(result.getImmediateRefundTransactionNo()).isEqualTo(7001L);
        assertThat(result.getBnplRefundTransactionNo()).isNull();
        verify(demandDepositClient, times(1)).updateDemandDepositAccountTransfer(any());
        assertThat(event.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
    }

    // === refundParticipation: 본인 아님 → 예외 ===
    @Test
    void refundParticipation_notOwner_throws() {
        long ownerId = 30L;
        long otherId = 31L;
        long paymentEventId = 300L;

        PaymentEvent event = PaymentEvent.builder()
                .member(mock(Member.class, inv -> {
                    if (inv.getMethod().getName().equals("getId")) return ownerId;
                    return RETURNS_DEFAULTS.answer(inv);
                }))
                .groupPurchase(mockGroupPurchase)
                .immediateAmount(1_000)
                .bnplAmount(0)
                .amount(1_000)
                .status(PaymentStatus.PAID)
                .build();

        when(paymentRepository.findById(paymentEventId)).thenReturn(Optional.of(event));

        PaymentCancellationRequest req = new PaymentCancellationRequest(paymentEventId, otherId);

        assertThatThrownBy(() -> paymentService.refundPayment(req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("본인 결제만 취소");
    }



}
