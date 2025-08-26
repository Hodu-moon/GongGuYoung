package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "BNPL 갚는거 요청 ")
public class PayBNPLRequest {

    @NotNull @Schema(description = "paymentId 입니다.")
    Long paymentId;
    @NotNull @Schema(description = "memberId 입니다.")
    Long memberId;

}
