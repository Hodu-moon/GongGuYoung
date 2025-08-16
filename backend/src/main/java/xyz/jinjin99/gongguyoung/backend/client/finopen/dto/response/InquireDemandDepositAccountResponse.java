package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.BankAccountRecord;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InquireDemandDepositAccountResponse extends BaseResponse {
  // 계좌 정보
  @JsonProperty("REC")
  private BankAccountRecord record;
}
