package xyz.jinjin99.gongguyoung.backend.client.finopen.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class InquireBankCodesResponse extends BaseResponse {
  @JsonProperty("REC")
  private List<BankRecord> records;

  @Getter
  @NoArgsConstructor
  @ToString
  public static class BankRecord {
    private String bankCode;
    private String bankName;
  }

}
