package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.InquireDemandDepositAccountBalanceRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireDemandDepositAccountBalanceResponse;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.UpdateDemandDepositAccountTransferResponse;
import xyz.jinjin99.gongguyoung.backend.domain.member.entity.Member;
import xyz.jinjin99.gongguyoung.backend.domain.member.service.MemberService;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.BNPLRemainResponse;
import xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response.ProcessingBnplResponse;
import xyz.jinjin99.gongguyoung.backend.domain.payment.entity.PaymentEvent;
import xyz.jinjin99.gongguyoung.backend.domain.payment.repository.PaymentRepository;
import xyz.jinjin99.gongguyoung.backend.domain.product.entity.Product;
import xyz.jinjin99.gongguyoung.backend.domain.grouppurchase.entity.GroupPurchase;
import xyz.jinjin99.gongguyoung.backend.global.enums.BnplStatus;

import java.lang.reflect.Field;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.UpdateDemandDepositAccountTransferRequest;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.util.ReflectionTestUtils.setField;

@ExtendWith(MockitoExtension.class)
class BnplServiceTest {

    @InjectMocks
    private BnplService bnplService;

    @Mock private DemandDepositClient demandDepositClient;
    @Mock private MemberService memberService;
    @Mock private PaymentRepository paymentRepository;

    // ---- 기존 helper 유지 (setField, makeBalanceResponse 등)

    // ---------- payBnpl: 성공 시나리오
    @Test
    void payBnpl_success_transfersAndMarksDone() {
        // given
        long paymentId = 100L;
        long memberId = 11L;
        int bnplAmount = 50_000;

        // PaymentEvent mocking
        PaymentEvent event = mock(PaymentEvent.class);
        Member eventOwner = mock(Member.class);
        when(eventOwner.getId()).thenReturn(memberId);
        when(event.getMember()).thenReturn(eventOwner);
        when(event.getBnplStatus()).thenReturn(BnplStatus.PROCESSING);
        when(event.getBnplAmount()).thenReturn(bnplAmount);

        when(paymentRepository.findById(paymentId)).thenReturn(java.util.Optional.of(event));

        // Member & 계좌
        Member caller = mock(Member.class);
        when(memberService.getMember(memberId)).thenReturn(caller);
        when(caller.getStarterAccountNo()).thenReturn("starter-001");
        when(caller.getFlexAccountNo()).thenReturn("flex-001");

        // 잔액 조회: 충분
        when(demandDepositClient.inquireDemandDepositAccountBalance(
                any(InquireDemandDepositAccountBalanceRequest.class)))
                .thenReturn(makeDepositResponse(100000));


        bnplService.payBnpl(paymentId, memberId);

        // then
        // 1) 잔액 조회가 starter 계좌로 나갔는지
        ArgumentCaptor<InquireDemandDepositAccountBalanceRequest> balCap =
                ArgumentCaptor.forClass(InquireDemandDepositAccountBalanceRequest.class);
        verify(demandDepositClient).inquireDemandDepositAccountBalance(balCap.capture());
        assertThat(balCap.getValue().getAccountNo()).isEqualTo("starter-001");

        // 2) 이체 요청 파라미터 검증
        ArgumentCaptor<UpdateDemandDepositAccountTransferRequest> txCap =
                ArgumentCaptor.forClass(UpdateDemandDepositAccountTransferRequest.class);
        verify(demandDepositClient).updateDemandDepositAccountTransfer(txCap.capture());
        UpdateDemandDepositAccountTransferRequest txReq = txCap.getValue();
        assertThat(txReq.getWithdrawalAccountNo()).isEqualTo("starter-001");
        assertThat(txReq.getDepositAccountNo()).isEqualTo("flex-001");
        assertThat(txReq.getTransactionBalance()).isEqualTo(bnplAmount);

        // 3) 이벤트 상태 변경 호출
        verify(event).markBnplStatusDONE();
    }

    private InquireDemandDepositAccountBalanceResponse makeDepositResponse(long balance) {
        // 내부 Record 생성 후 accountBalance 세팅
        InquireDemandDepositAccountBalanceResponse.Record rec =
                new InquireDemandDepositAccountBalanceResponse.Record();
        setField(rec, "accountBalance", balance);

        // 바깥 Response에 record 세팅
        InquireDemandDepositAccountBalanceResponse resp =
                new InquireDemandDepositAccountBalanceResponse();
        setField(resp, "record", rec);

        return resp;
    }


    // ---------- payBnpl: 잔액 부족 시 예외
    @Test
    void payBnpl_insufficientBalance_throws_andNoTransfer() {
        // given
        long paymentId = 101L;
        long memberId = 12L;
        int bnplAmount = 80_000;

        PaymentEvent event = mock(PaymentEvent.class);
        Member owner = mock(Member.class);
        when(owner.getId()).thenReturn(memberId);
        when(event.getMember()).thenReturn(owner);
        when(event.getBnplStatus()).thenReturn(BnplStatus.PROCESSING);
        when(event.getBnplAmount()).thenReturn(bnplAmount);
        when(paymentRepository.findById(paymentId)).thenReturn(java.util.Optional.of(event));

        Member caller = mock(Member.class);
        when(memberService.getMember(memberId)).thenReturn(caller);
        when(caller.getStarterAccountNo()).thenReturn("starter-002");

        // 잔액: 부족
        when(demandDepositClient.inquireDemandDepositAccountBalance(any()))
                .thenReturn(makeDepositResponse(10000));

        // when & then
        assertThrows(RuntimeException.class, () -> bnplService.payBnpl(paymentId, memberId));

        // 이체/상태 변경 없음
        verify(demandDepositClient, never()).updateDemandDepositAccountTransfer(any());
        verify(event, never()).markBnplStatusDONE();
    }

    // ---------- payBnpl: 다른 회원이 호출하면 예외
    @Test
    void payBnpl_differentMember_throws() {
        long paymentId = 102L;
        long callerId = 99L;     // 호출자
        long ownerId = 88L;      // 실제 결제 소유자

        PaymentEvent event = mock(PaymentEvent.class);
        Member owner = mock(Member.class);
        when(owner.getId()).thenReturn(ownerId);
        when(event.getMember()).thenReturn(owner);
        when(paymentRepository.findById(paymentId)).thenReturn(java.util.Optional.of(event));

        assertThrows(RuntimeException.class, () -> bnplService.payBnpl(paymentId, callerId));

        verifyNoInteractions(memberService);
        verify(demandDepositClient, never()).inquireDemandDepositAccountBalance(any());
        verify(demandDepositClient, never()).updateDemandDepositAccountTransfer(any());
        verify(event, never()).markBnplStatusDONE();
    }

    // ---------- payBnpl: 이미 DONE 또는 상태 null이면 예외
    @Test
    void payBnpl_alreadyDoneOrNull_throws() {
        long paymentId = 103L;
        long memberId = 33L;

        // case1: null
        PaymentEvent eNull = mock(PaymentEvent.class);
        Member owner = mock(Member.class);
        when(owner.getId()).thenReturn(memberId);
        when(eNull.getMember()).thenReturn(owner);
        when(eNull.getBnplStatus()).thenReturn(null);

        when(paymentRepository.findById(paymentId)).thenReturn(java.util.Optional.of(eNull));
        assertThrows(RuntimeException.class, () -> bnplService.payBnpl(paymentId, memberId));

        // case2: DONE
        PaymentEvent eDone = mock(PaymentEvent.class);
        when(eDone.getMember()).thenReturn(owner);
        when(eDone.getBnplStatus()).thenReturn(BnplStatus.DONE);

        when(paymentRepository.findById(paymentId)).thenReturn(java.util.Optional.of(eDone));
        assertThrows(RuntimeException.class, () -> bnplService.payBnpl(paymentId, memberId));

        verify(demandDepositClient, never()).inquireDemandDepositAccountBalance(any());
        verify(demandDepositClient, never()).updateDemandDepositAccountTransfer(any());
        verify(eNull, never()).markBnplStatusDONE();
        verify(eDone, never()).markBnplStatusDONE();
    }
}