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
public class UpdateDemandDepositAccountTransferResponse extends BaseResponse {
  // 거래목록
  @JsonProperty("REC")
  private List<Record> records;

  @Getter
  @NoArgsConstructor
  @ToString
  public static class Record {
    // 거래 고유 번호
    private Long transactionUniqueNo;

    // 계좌 번호
    private String accountNo;

    // 거래일자
    private String transactionDate;

    // 거래유형
    private String transactionType;

    // 거래유형명
    private String transactionTypeName;

    // 이체 거래에 대한 계좌번호
    private String transactionAccountNo;

  }
  
}
