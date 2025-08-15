package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CreateDemandDepositAccountResponse extends BaseResponse {

  // 계좌 정보
  @JsonProperty("REC")
  private Record record;

  @Getter
  @NoArgsConstructor
  @ToString
  static public class Record {
    // 은행 코드
    private String bankCode;

    // 계좌 번호
    private String accountNo;

    private Currency currency;

    @Getter
    @NoArgsConstructor
    @ToString
    static class Currency {
      // 통화 코드
      private String currency;
      // 통화명
      private String currencyName;

    }
  }
}
