package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CreateDemandDepositAccountRequest extends BaseRequest {
  // 상품 고유 번호
  private String accountTypeUniqueNo;
}
