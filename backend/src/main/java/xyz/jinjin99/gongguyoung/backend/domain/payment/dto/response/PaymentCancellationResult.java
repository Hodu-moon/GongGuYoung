package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentCancellationResult {
    private Long immediateRefundTransactionNo;
    private Long bnplRefundTransactionNo;
}