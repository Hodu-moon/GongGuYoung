package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "결제 요청 DTO")
public class PaymentRequest {
    @Schema(description = "공동구매 ID")
    @NotNull(message = "공동구매 ID는 필수입니다.")
    private Long groupPurchaseId;

    @Schema(description = "회원 ID")
    @NotNull(message = "회원 ID는 필수값입니다.")
    private Long memberId;


    @Schema(description = "구매 수량")
    @Positive(message = "구매 수량은 1 이상이어야 합니다.")
    private int count;

    @Schema(description = "즉시 결제 금액", example = "10000")
    @Min(value = 0, message = "즉시 결제 금액은 0 이상이어야 합니다.")
    private int immediate;

    @Schema(description = "BNPL 결제 금액", example = "10000")
    @Min(value = 0, message = "BNPL 결제 금액은 0 이상이어야 합니다.")
    private int bnpl;

    @Schema(description = "결제 타입", example = "BNPL", allowableValues = {"IMMEDIATE_ONLY", "BNPL"})
    @NotBlank(message = "결제 타입은 필수입니다.")
    private String paymentType;

}
