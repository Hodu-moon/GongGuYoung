package xyz.jinjin99.gongguyoung.backend.domain.payment.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import xyz.jinjin99.gongguyoung.backend.client.finopen.client.DemandDepositClient;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request.InquireDemandDepositAccountBalanceRequest;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response.InquireDemandDepositAccountBalanceResponse;
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

@ExtendWith(MockitoExtension.class)
class BnplServiceTest {

    @InjectMocks
    private BnplService bnplService;

    @Mock private DemandDepositClient demandDepositClient;
    @Mock private MemberService memberService;
    @Mock private PaymentRepository paymentRepository;

    // ---------- helper: reflection setters (DTO에 세터/빌더가 없어서 사용)
    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private InquireDemandDepositAccountBalanceResponse makeBalanceResponse(long balance) {
        // Record 생성
        InquireDemandDepositAccountBalanceResponse.Record rec =
                new InquireDemandDepositAccountBalanceResponse.Record();
        setField(rec, "accountBalance", balance);

        // Response 생성
        InquireDemandDepositAccountBalanceResponse resp =
                new InquireDemandDepositAccountBalanceResponse();
        setField(resp, "record", rec);
        return resp;
    }

    // ---------- getBNPLRemain 테스트
    @Test
    void getBNPLRemain_returnsBalanceFromFlexAccount() {
        // given
        long memberId = 1L;
        String flexAcc = "flex-001";

        Member member = mock(Member.class);
        when(memberService.getMember(memberId)).thenReturn(member);
        when(member.getFlexAccountNo()).thenReturn(flexAcc);

        when(demandDepositClient.inquireDemandDepositAccountBalance(
                any(InquireDemandDepositAccountBalanceRequest.class)))
                .thenReturn(makeBalanceResponse(300_000L));

        // when
        BNPLRemainResponse res = bnplService.getBNPLRemain(memberId);

        // then
        assertThat(res.getMemberId()).isEqualTo(memberId);
        assertThat(res.getRemain()).isEqualTo(300_000L);

        ArgumentCaptor<InquireDemandDepositAccountBalanceRequest> cap =
                ArgumentCaptor.forClass(InquireDemandDepositAccountBalanceRequest.class);
        verify(demandDepositClient).inquireDemandDepositAccountBalance(cap.capture());
        assertThat(cap.getValue().getAccountNo()).isEqualTo(flexAcc);
    }

    // ---------- listProcessBnplPayments 테스트
    @Test
    void listProcessBnplPayments_returnsOnlyProcessingItems_mappedFields() {
        long memberId = 7L;

        // 이벤트 1: BNPL 상태 null → 제외
        PaymentEvent eventNull = mock(PaymentEvent.class);
        when(eventNull.getBnplStatus()).thenReturn(null);

        // 이벤트 2: BNPL DONE → 제외
        PaymentEvent eventDone = mock(PaymentEvent.class);
        when(eventDone.getBnplStatus()).thenReturn(BnplStatus.DONE);

        // 이벤트 3: BNPL PROCESSING → 포함
        PaymentEvent eventProc = mock(PaymentEvent.class);
        when(eventProc.getBnplStatus()).thenReturn(BnplStatus.PROCESSING);
        when(eventProc.getBnplAmount()).thenReturn(20_000);
        when(eventProc.getId()).thenReturn(10L);

        Product product = mock(Product.class);
        when(product.getName()).thenReturn("iPad");
        when(product.getImageUrl()).thenReturn("https://img/sample.png");

        GroupPurchase gp = mock(GroupPurchase.class);
        when(gp.getProduct()).thenReturn(product);
        when(gp.getTitle()).thenReturn("아이패드 공동구매");

        when(eventProc.getGroupPurchase()).thenReturn(gp);

        when(paymentRepository.findByMemberId(memberId))
                .thenReturn(List.of(eventNull, eventDone, eventProc));

        // when
        List<ProcessingBnplResponse> list = bnplService.listProcessBnplPayments(memberId);

        // then
        assertThat(list).hasSize(1);
        ProcessingBnplResponse r = list.get(0);
        assertThat(r.getPaymentId()).isEqualTo(10L);
        assertThat(r.getBnplAmount()).isEqualTo(20_000);
        assertThat(r.getItemName()).isEqualTo("iPad");
        assertThat(r.getItemImageUrl()).isEqualTo("https://img/sample.png");
        assertThat(r.getGroupPurchaseTitle()).isEqualTo("아이패드 공동구매");
        assertThat(r.getBNPLStatus()).isEqualTo("PROCESSING");
    }
}
