package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "bnpl 잔액 response ")
public class BNPLRemainResponse {
    @Schema(description = "회원 ID")
    private Long memberId;
    @Schema(description = "BNPL 잔액")
    private Long remain;

    @Schema(description = "BNPL 한도 ")
    private Long bnplLimit;
}
