package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "결제 취소 요청")
public class PaymentCancellationRequest {
    @NotNull
    @Schema(description = "결제 ID")
    private Long paymentEventId;
    @NotNull
    @Schema(description = "회원 ID")
    private Long memberId;      // 본인 확인/권한 체크 용
}
