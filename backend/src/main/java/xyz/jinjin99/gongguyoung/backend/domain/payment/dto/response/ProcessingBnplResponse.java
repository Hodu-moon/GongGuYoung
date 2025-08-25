package xyz.jinjin99.gongguyoung.backend.domain.payment.dto.response;

import lombok.Builder;
import lombok.Data;
import xyz.jinjin99.gongguyoung.backend.global.enums.BnplStatus;

@Data
@Builder
public class ProcessingBnplResponse {
    Long paymentId;
    String itemName;
    String groupPurchaseTitle;
    String itemImageUrl;
    String BNPLStatus;
    Integer bnplAmount;
}
