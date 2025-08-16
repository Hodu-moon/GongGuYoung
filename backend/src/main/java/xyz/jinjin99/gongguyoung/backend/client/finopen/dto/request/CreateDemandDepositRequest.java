package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.request;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CreateDemandDepositRequest extends BaseRequest {
  // userKey 제외

  // 은행코드
  private String bankCode;

  // 상품명
  private String accountName;
  
  // 상품설명
  private String accountDescription;
}
