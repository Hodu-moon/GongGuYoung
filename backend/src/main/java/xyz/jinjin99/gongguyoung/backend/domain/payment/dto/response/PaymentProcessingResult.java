package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentProcessingResult {
    private final Long bnplTransactionNo;      // BNPL 트랜잭션 번호
    private final Long immediateTransactionNo; // 즉시결제 트랜잭션 번호
}