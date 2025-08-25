package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCancellationRequest {
    private Long paymentEventId;
    private Long memberId;      // 본인 확인/권한 체크 용
//    private String reason;      // 감사/감사로그용(선택)
}
