package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import xyz.jinjin99.gongguyoung.backend.client.finopen.dto.common.BankAccountRecord;

import java.util.List;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InquireDemandDepositAccountListResponse extends BaseResponse {
  // 계좌 목록
  @JsonProperty("REC")
  private List<BankAccountRecord> records;

}
